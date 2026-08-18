/**
 * TwinMind Backend Server
 * Supports two agent protocols:
 *   1. Socket.IO  — original laptop-agent (laptop:register / laptop:telemetry events)
 *   2. Raw WS     — dhanu/twinmind-agent (ws://host:4000/ws/telemetry/:deviceId)
 *
 * Both are normalized into the same `telemetry_update` Socket.IO event
 * that the React frontend listens to.
 */

const express  = require('express');
const http     = require('http');
const { Server } = require('socket.io');
const { WebSocketServer } = require('ws');
const cors     = require('cors');
const url      = require('url');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

// ── Socket.IO (for React frontend + old laptop-agent) ────────────────────────
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// ── Raw WebSocket server (for dhanu/twinmind-agent) ──────────────────────────
const wss = new WebSocketServer({ noServer: true });

// ── Shared device state store ─────────────────────────────────────────────────
const deviceStates = new Map();

// ─────────────────────────────────────────────────────────────────────────────
// Helper: normalize dhanu-agent's rich payload → frontend-friendly flat object
// ─────────────────────────────────────────────────────────────────────────────
function normalizeDhanuPayload(raw, deviceId) {
  const cpu     = raw.cpu     || {};
  const memory  = raw.memory  || {};
  const gpu     = raw.gpu     || {};
  const storage = raw.storage || {};
  const battery = raw.battery || {};
  const network = raw.network || {};
  const system  = raw.system  || {};
  const health  = raw.health  || {};

  // Primary disk (first entry)
  const primaryDisk = (storage.disks && storage.disks[0]) || {};

  return {
    id:        deviceId,
    deviceId:  deviceId,
    name:      system.hostname || raw.deviceId || deviceId,
    online:    true,
    isRealDevice: true,

    // CPU
    cpu:      cpu.usage      ?? null,
    cpuTemp:  cpu.temperature ?? null,
    temperature: cpu.temperature ?? null,

    // Memory — dhanu sends: usage, total_gb, available_gb, used_gb
    ram:          memory.usage ?? memory.usage_percent ?? memory.usagePercent ?? null,
    ramAvailable: memory.available_gb ?? memory.availableGB ?? null,
    ramTotal:     memory.total_gb ?? memory.totalGB ?? null,

    // Storage — map first disk
    ssd:           primaryDisk.usage        ?? primaryDisk.usage_percent ?? null,
    ssdTemp:       primaryDisk.temperature  ?? null,
    diskRead:      primaryDisk.read_speed_mb  ?? primaryDisk.readMBps  ?? null,
    diskWrite:     primaryDisk.write_speed_mb ?? primaryDisk.writeMBps ?? null,

    // Battery
    battery:        battery.percent      ?? battery.percentage  ?? null,
    charging:       battery.plugged_in   ?? battery.charging    ?? null,
    batteryHealth:  battery.health_percent ?? null,
    batteryTemp:    battery.temperature  ?? null,

    // GPU
    gpu:     gpu.usage       ?? null,
    gpuTemp: gpu.temperature ?? null,

    // Fan (dhanu agent may not have fan data)
    fanSpeed: raw.fan ? (raw.fan.rpm ?? null) : null,

    // Network
    network:         network.connected ? 'WiFi' : 'Offline',
    networkUpload:   network.upload_mbps   ?? network.uploadMbps   ?? null,
    networkDownload: network.download_mbps ?? network.downloadMbps ?? null,
    wifiSignal:      network.connected ? 100 : 0,

    // System
    uptime:   system.uptime_seconds ?? system.uptimeSeconds ?? null,
    hostname: system.hostname ?? null,
    platform: system.platform ?? null,
    os:       system.os_version ?? null,

    // Rich health (extra fields the frontend can optionally use)
    healthScore: health.score ?? null,
    healthLabel: health.label ?? null,

    lastSeen: Date.now(),
    timestamp: raw.timestamp,

    // Pass through anomalies & alerts for future dashboard use
    anomalies: raw.anomalies || [],
    alerts:    raw.alerts    || [],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Broadcast normalized state to all Socket.IO frontend clients
// ─────────────────────────────────────────────────────────────────────────────
function broadcast(deviceId) {
  const state = deviceStates.get(deviceId);
  if (state) {
    io.emit('telemetry_update', state);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// HTTP upgrade handler — route /ws/telemetry/:deviceId to raw WS server
// ─────────────────────────────────────────────────────────────────────────────
server.on('upgrade', (request, socket, head) => {
  const pathname = url.parse(request.url).pathname;
  const match = pathname.match(/^\/ws\/telemetry\/(.+)$/);

  if (match) {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request, match[1]);
    });
  } else {
    // Let Socket.IO handle its own upgrade (for /socket.io/...)
    socket.destroy();
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Raw WebSocket connection handler (dhanu/twinmind-agent)
// ─────────────────────────────────────────────────────────────────────────────
wss.on('connection', (ws, request, deviceId) => {
  console.log(`[WS] Raw WebSocket connected: ${deviceId}`);

  // Register device immediately as online
  if (!deviceStates.has(deviceId)) {
    deviceStates.set(deviceId, { id: deviceId, deviceId, name: deviceId, online: true, lastSeen: Date.now() });
  }

  ws.on('message', (data) => {
    try {
      const raw = JSON.parse(data.toString());
      const normalized = normalizeDhanuPayload(raw, deviceId);

      // Merge into device state store
      deviceStates.set(deviceId, {
        ...deviceStates.get(deviceId),
        ...normalized,
      });

      broadcast(deviceId);

      const cpuVal = normalized.cpu !== null ? `${normalized.cpu}%` : 'N/A';
      const ramVal = normalized.ram !== null ? `${normalized.ram}%` : 'N/A';
      const batVal = normalized.battery !== null ? `${normalized.battery}%` : 'N/A';
      console.log(`[WS Telemetry] ${deviceId} | CPU ${cpuVal} | RAM ${ramVal} | Battery ${batVal}`);
    } catch (err) {
      console.error(`[WS] Parse error from ${deviceId}:`, err.message);
    }
  });

  ws.on('close', () => {
    console.log(`[WS] ${deviceId} disconnected`);
    const state = deviceStates.get(deviceId);
    if (state) {
      state.online = false;
      io.emit('device_offline', { deviceId });
    }
  });

  ws.on('error', (err) => {
    console.error(`[WS] Error for ${deviceId}:`, err.message);
  });

  // Send acknowledgement
  try {
    ws.send(JSON.stringify({ type: 'connected', message: 'TwinMind server ready', deviceId }));
  } catch (_) {}
});

// ─────────────────────────────────────────────────────────────────────────────
// Socket.IO connection handler (original laptop-agent + React frontend)
// ─────────────────────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  socket.on('device_telemetry', (data) => handleFlatTelemetry(socket, data));
  socket.on('device:telemetry', (data) => handleFlatTelemetry(socket, data));
  socket.on('device:register',  (data) => {
    console.log(`[Device Register] ${data.deviceId} registered`);
    handleFlatTelemetry(socket, data);
  });

  // ── Laptop-agent: Register ────────────────────────────────────────────────
  socket.on('laptop:register', (data) => {
    const { deviceId, hostname, platform, agentVersion, token } = data;
    const SECURE_TOKEN = 'TWINMIND_LAPTOP_SECURE_TOKEN_2026';

    if (token !== SECURE_TOKEN) {
      console.log(`[Auth Failed] ${deviceId}`);
      socket.emit('laptop:auth_failed', { message: 'Invalid device token' });
      socket.disconnect();
      return;
    }

    console.log(`[Laptop Register] ${deviceId} (${hostname} / ${platform}) v${agentVersion}`);
    deviceStates.set(deviceId, {
      ...(deviceStates.get(deviceId) || {}),
      id: deviceId, deviceId, name: hostname || deviceId,
      platform, agentVersion, online: true,
      socketId: socket.id, lastSeen: Date.now(),
    });
    broadcast(deviceId);
  });

  // ── Laptop-agent: Telemetry ───────────────────────────────────────────────
  socket.on('laptop:telemetry', (data) => {
    const { deviceId, token } = data;
    const SECURE_TOKEN = 'TWINMIND_LAPTOP_SECURE_TOKEN_2026';
    if (token !== SECURE_TOKEN) return;

    if (!deviceStates.has(deviceId)) {
      deviceStates.set(deviceId, { id: deviceId, deviceId, name: data.hostname || deviceId, online: true, socketId: socket.id });
    }

    deviceStates.set(deviceId, {
      ...deviceStates.get(deviceId),
      ...data,
      online: true,
      socketId: socket.id,
      lastSeen: Date.now(),
    });

    broadcast(deviceId);
  });

  // ── Generic flat telemetry (mobile/monitor agents) ────────────────────────
  function handleFlatTelemetry(socket, data) {
    if (!data.deviceId) return;
    deviceStates.set(data.deviceId, {
      ...(deviceStates.get(data.deviceId) || {}),
      ...data,
      online: true,
      socketId: socket.id,
      lastSeen: Date.now(),
    });
    broadcast(data.deviceId);
  }

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Disconnected: ${socket.id}`);
    for (const [deviceId, state] of deviceStates.entries()) {
      if (state.socketId === socket.id) {
        console.log(`[Device] ${deviceId} went OFFLINE`);
        state.online = false;
        io.emit('device_offline', { deviceId });
      }
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// REST API endpoints for Pairing Wizard (dhanu agent)
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/devices/register', (req, res) => {
  const { deviceId, deviceName, systemInfo, agentVersion } = req.body || {};
  const id = deviceId || 'TWIN-LAPTOP-4C18F';
  console.log(`[REST Register] Device ${id} (${deviceName}) registered via HTTP`);

  deviceStates.set(id, {
    ...(deviceStates.get(id) || {}),
    id: id,
    deviceId: id,
    name: deviceName || id,
    online: true,
    agentVersion: agentVersion || '1.0.0',
    platform: systemInfo?.platform || 'Windows',
    lastSeen: Date.now()
  });

  broadcast(id);
  res.status(200).json({ status: 'registered', deviceId: id });
});

app.get('/api/devices/:deviceId/pairing', (req, res) => {
  const { deviceId } = req.params;
  // Automatically approve pairing and return secure token
  res.status(200).json({
    status: 'approved',
    token: 'TWINMIND_LAPTOP_SECURE_TOKEN_2026',
    deviceId: deviceId
  });
});

app.post('/api/telemetry', (req, res) => {
  const data = req.body;
  if (data && data.deviceId) {
    const normalized = normalizeDhanuPayload(data, data.deviceId);
    deviceStates.set(data.deviceId, {
      ...(deviceStates.get(data.deviceId) || {}),
      ...normalized
    });
    broadcast(data.deviceId);
  }
  res.status(200).json({ status: 'ok' });
});

// ─────────────────────────────────────────────────────────────────────────────
// Health-check endpoint
// ─────────────────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', devices: deviceStates.size });
});

app.get('/devices', (_req, res) => {
  res.json([...deviceStates.values()]);
});

// ─────────────────────────────────────────────────────────────────────────────
// Heartbeat monitor — mark devices offline after 10s silence
// ─────────────────────────────────────────────────────────────────────────────
setInterval(() => {
  const now = Date.now();
  for (const [deviceId, state] of deviceStates.entries()) {
    if (state.online && now - state.lastSeen > 10000) {
      console.log(`[Heartbeat] ${deviceId} missed — marking OFFLINE`);
      state.online = false;
      io.emit('device_offline', { deviceId });
    }
  }
}, 5000);

// ─────────────────────────────────────────────────────────────────────────────
// Start
// ─────────────────────────────────────────────────────────────────────────────
const PORT = 4000;
server.listen(PORT, '0.0.0.0', () => {
  console.log('════════════════════════════════════════════════');
  console.log('  TwinMind Backend  —  listening on port', PORT);
  console.log('  Socket.IO : ws://0.0.0.0:4000');
  console.log('  Raw WS    : ws://0.0.0.0:4000/ws/telemetry/:deviceId');
  console.log('════════════════════════════════════════════════');
});

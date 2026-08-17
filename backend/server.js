const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow frontend to connect
    methods: ["GET", "POST"]
  }
});

// Maintain the latest state of each connected device
const deviceStates = new Map();

io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  // Handle incoming telemetry from Android devices (or test client)
  socket.on('device_telemetry', (data) => handleTelemetry(socket, data));
  socket.on('device:telemetry', (data) => handleTelemetry(socket, data));
  socket.on('device:register', (data) => {
    console.log(`[Device Register] ${data.deviceId} registered`);
    handleTelemetry(socket, data);
  });

  function handleTelemetry(socket, data) {
    if (!data.deviceId) return;
    
    // Update the device state
    deviceStates.set(data.deviceId, {
      ...deviceStates.get(data.deviceId),
      ...data,
      online: true,
      socketId: socket.id,
      lastSeen: Date.now()
    });

    // Broadcast the update to the React frontend
    io.emit('telemetry_update', deviceStates.get(data.deviceId));
  }

  // Handle client disconnect
  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    
    // Find if this socket belonged to a device
    for (const [deviceId, state] of deviceStates.entries()) {
      if (state.socketId === socket.id) {
        console.log(`[Device] ${deviceId} went OFFLINE`);
        state.online = false;
        
        // Broadcast offline status
        io.emit('device_offline', { deviceId });
      }
    }
  });
});

// Periodic cleanup/heartbeat check (optional, marks devices offline if no data for 10s)
setInterval(() => {
  const now = Date.now();
  for (const [deviceId, state] of deviceStates.entries()) {
    if (state.online && now - state.lastSeen > 10000) {
      console.log(`[Device] ${deviceId} heartbeat missed, marking OFFLINE`);
      state.online = false;
      io.emit('device_offline', { deviceId });
    }
  }
}, 5000);

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`[TwinMind Backend] Server listening on port ${PORT}`);
});

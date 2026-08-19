import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { mockMobileDevices, mockLaptopDevices, mockMonitorDevices } from '../data/devices';

// Helpers to simulate smooth telemetry changes
const applyDrift = (current, min, max, maxDelta) => {
  const delta = (Math.random() * 2 - 1) * maxDelta;
  const next = current + delta;
  return Math.max(min, Math.min(max, next));
};

const evaluateStatus = (device) => {
  if (device.temperature > 50 || device.battery < 10) return 'critical';
  if (device.temperature > 40 || device.battery < 20 || device.cpu > 80) return 'warning';
  return 'normal';
};

// Custom hook to provide live telemetry data
export function useDeviceTelemetry(deviceType, isDemoMode = true, onRealTelemetry = null) {
  const onRealTelemetryRef = useRef(onRealTelemetry);
  onRealTelemetryRef.current = onRealTelemetry;

  const [devices, setDevices] = useState(() => {
    switch (deviceType) {
      case 'MOBILE': return mockMobileDevices;
      case 'LAPTOP': return mockLaptopDevices;
      case 'MONITOR': return mockMonitorDevices;
      default: return [];
    }
  });

  const [socketConnected, setSocketConnected] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  // WebSocket Connection - Always active to detect incoming real device connections
  useEffect(() => {
    const backendHost = (typeof window !== 'undefined' && window.location.hostname) ? window.location.hostname : 'localhost';
    const socket = io(`http://${backendHost}:4000`, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      setSocketConnected(true);
      setBackendOnline(true);
      console.log(`[Socket.IO] Connected to http://${backendHost}:4000`);
    });

    socket.on('connect_error', () => {
      setSocketConnected(false);
      setBackendOnline(false);
    });

    socket.on('disconnect', () => {
      setSocketConnected(false);
    });

    socket.on('telemetry_update', (data) => {
      setBackendOnline(true);
      if (!data.deviceId) return;

      setLastUpdate(Date.now());

      // If we receive telemetry from MOBILE_001 via the live socket connection,
      // trigger the callback to prioritize real telemetry and exit demo mode.
      if (data.deviceId === 'MOBILE_001' && onRealTelemetryRef.current) {
        onRealTelemetryRef.current();
      }

      // Only update devices using socket data if demo mode is NOT active
      if (!isDemoMode) {
        setDevices(currentDevices =>
          currentDevices.map(device => {
            if (device.id === data.deviceId) {
              const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
              
              const cpuVal = data.cpuUsage !== undefined ? data.cpuUsage : (data.cpu !== undefined ? data.cpu : device.cpu);
              const ramPct = data.ramUsage !== undefined ? data.ramUsage : (data.ram !== undefined ? data.ram : device.ram);
              
              const newHistoryPoint = { 
                time: timeStr, 
                temperature: Number(data.temperature ?? device.temperature ?? 28), 
                battery: Number(data.battery ?? device.battery ?? 50),
                cpuUsage: Number(cpuVal),
                ramUsage: Number(ramPct)
              };

              const updated = { 
                ...device, 
                ...data, 
                cpu: cpuVal,
                ram: ramPct,
                cpuUsage: cpuVal,
                ramUsage: ramPct,
                online: true,
                status: evaluateStatus({ ...device, ...data, cpu: cpuVal }),
                history: [...(device.history || []), newHistoryPoint].slice(-100)
              };
              return updated;
            }
            return device;
          })
        );
      }
    });

    socket.on('device_offline', (data) => {
      if (!isDemoMode) {
        setDevices(currentDevices =>
          currentDevices.map(device => {
            if (device.id === data.deviceId) {
              return { ...device, online: false, status: 'offline' };
            }
            return device;
          })
        );
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [isDemoMode, deviceType]);

  // Simulated Telemetry for Demo Mode
  useEffect(() => {
    if (!isDemoMode) return;

    const interval = setInterval(() => {
      setDevices(currentDevices => 
        currentDevices.map(device => {
          let updated = { ...device, online: true };
          
          if (updated.battery !== undefined) {
            const batteryDelta = updated.charging ? 0.2 : -0.1;
            updated.battery = Math.max(0, Math.min(100, updated.battery + batteryDelta));
          }

          if (updated.temperature !== undefined) {
            const tempDelta = (updated.cpu > 60 ? 0.5 : -0.2) + (Math.random() * 0.4 - 0.2);
            updated.temperature = applyDrift(updated.temperature + tempDelta, 25, 75, 0.5);
          }

          if (updated.cpuUsage !== undefined) {
            updated.cpuUsage = applyDrift(updated.cpuUsage, 5, 100, 5);
            updated.cpu = updated.cpuUsage;
          } else if (updated.cpu !== undefined) {
            updated.cpu = applyDrift(updated.cpu, 5, 100, 5);
            updated.cpuUsage = updated.cpu;
          }

          if (updated.ramUsage !== undefined) {
            updated.ramUsage = applyDrift(updated.ramUsage, 20, 95, 2);
            updated.ram = updated.ramUsage;
            updated.ramTotal = updated.ramTotal || 8192;
            updated.ramUsed = Math.floor(updated.ramTotal * (updated.ramUsage / 100));
          } else if (updated.ram !== undefined) {
            updated.ram = applyDrift(updated.ram, 20, 95, 2);
            updated.ramUsage = updated.ram;
            updated.ramTotal = updated.ramTotal || 8192;
            updated.ramUsed = Math.floor(updated.ramTotal * (updated.ramUsage / 100));
          }

          updated.status = evaluateStatus(updated);

          if (updated.battery) updated.battery = parseFloat(updated.battery.toFixed(1));
          if (updated.temperature) updated.temperature = parseFloat(updated.temperature.toFixed(1));
          if (updated.cpuUsage) updated.cpuUsage = parseFloat(updated.cpuUsage.toFixed(1));
          if (updated.ramUsage) updated.ramUsage = parseFloat(updated.ramUsage.toFixed(1));
          updated.cpu = updated.cpuUsage;
          updated.ram = updated.ramUsage;

          // Append simulated telemetry to the history buffer
          const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          const newHistoryPoint = { 
            time: timeStr, 
            temperature: updated.temperature, 
            battery: updated.battery,
            cpuUsage: updated.cpuUsage,
            ramUsage: updated.ramUsage
          };
          updated.history = [...(device.history || []), newHistoryPoint].slice(-100);

          return updated;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [isDemoMode, deviceType]);

  // Attach connection metadata onto the array object in a backward-compatible manner
  const result = [...devices];
  result.socketConnected = socketConnected;
  result.backendOnline = backendOnline;
  result.lastUpdate = lastUpdate;
  
  return result;
}


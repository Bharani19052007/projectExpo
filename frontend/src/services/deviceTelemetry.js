import { useState, useEffect } from 'react';
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
export function useDeviceTelemetry(deviceType, isDemoMode = true) {
  const [devices, setDevices] = useState(() => {
    switch (deviceType) {
      case 'MOBILE': return mockMobileDevices;
      case 'LAPTOP': return mockLaptopDevices;
      case 'MONITOR': return mockMonitorDevices;
      default: return [];
    }
  });

  // WebSocket Connection for Real Device Mode
  useEffect(() => {
    if (isDemoMode) return;

    // Connect to Backend WebSocket
    const socket = io('http://localhost:4000');

    socket.on('connect', () => {
      console.log(`Connected to TwinMind backend WebSocket. Mode: ${deviceType}`);
    });

    socket.on('telemetry_update', (data) => {
      setDevices(currentDevices => 
        currentDevices.map(device => {
          if (device.id === data.deviceId) {
            // Update this specific device
            const updated = { ...device, ...data, status: evaluateStatus({ ...device, ...data }) };
            return updated;
          }
          return device;
        })
      );
    });

    socket.on('device_offline', (data) => {
      setDevices(currentDevices =>
        currentDevices.map(device => {
          if (device.id === data.deviceId) {
            return { ...device, online: false, status: 'offline' };
          }
          return device;
        })
      );
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
          let updated = { ...device, online: true }; // Force online in demo mode
          
          if (updated.battery !== undefined) {
            const batteryDelta = updated.charging ? 0.2 : -0.1;
            updated.battery = Math.max(0, Math.min(100, updated.battery + batteryDelta));
          }

          if (updated.temperature !== undefined) {
            const tempDelta = (updated.cpu > 60 ? 0.5 : -0.2) + (Math.random() * 0.4 - 0.2);
            updated.temperature = applyDrift(updated.temperature + tempDelta, 25, 75, 0.5);
          }

          if (updated.cpu !== undefined) {
            updated.cpu = applyDrift(updated.cpu, 5, 100, 5);
          }

          if (updated.ram !== undefined) {
            updated.ram = applyDrift(updated.ram, 20, 95, 2);
          }

          updated.status = evaluateStatus(updated);

          if (updated.battery) updated.battery = parseFloat(updated.battery.toFixed(1));
          if (updated.temperature) updated.temperature = parseFloat(updated.temperature.toFixed(1));
          if (updated.cpu) updated.cpu = parseFloat(updated.cpu.toFixed(1));
          if (updated.ram) updated.ram = parseFloat(updated.ram.toFixed(1));

          return updated;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [isDemoMode, deviceType]);

  return devices;
}

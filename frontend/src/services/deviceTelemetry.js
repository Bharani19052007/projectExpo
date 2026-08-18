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
  const idUpper = (device.id || '').toUpperCase();
  if (idUpper.includes('LAPTOP')) {
    const cTemp = device.cpuTemp || device.temperature || 40;
    const gTemp = device.gpuTemp || 40;
    const sTemp = device.ssdTemp || 35;
    if (cTemp > 85 || gTemp > 85 || device.battery < 10 || sTemp > 65) return 'critical';
    if (cTemp > 70 || gTemp > 70 || device.battery < 20 || device.cpu > 90 || device.ram > 90 || sTemp > 58) return 'warning';
    return 'normal';
  }
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

    // Connect to Backend WebSocket using current host (supports access from Laptop B via LAN IP)
    const backendHost = (typeof window !== 'undefined' && window.location.hostname) || 'localhost';
    const socket = io(`http://${backendHost}:4000`);

    socket.on('connect', () => {
      console.log(`Connected to TwinMind backend WebSocket at http://${backendHost}:4000. Mode: ${deviceType}`);
    });

    socket.on('telemetry_update', (data) => {
      const incomingId = data.deviceId || data.id;
      if (!incomingId) return;

      setDevices(currentDevices => {
        let mappedData = { ...data };

        // ── Case 1: Original laptop-agent nested payload (cpu is an object) ──
        if (data.cpu && typeof data.cpu === 'object') {
          mappedData = {
            id: incomingId,
            deviceId: incomingId,
            name: data.hostname || data.name || incomingId,
            online: true,
            isRealDevice: true,

            cpu: data.cpu.usage ?? data.cpu.usage_percent,
            cpuTemp: data.cpu.temperature,
            temperature: data.cpu.temperature,

            ram: data.memory?.usagePercent ?? data.memory?.usage_percent,
            ramAvailable: data.memory?.availableGB ?? data.memory?.available_gb,
            ramTotal: data.memory?.totalGB ?? data.memory?.total_gb,

            ssd: data.disk?.usagePercent
              ?? data.storage?.disks?.[0]?.usage
              ?? data.storage?.disks?.[0]?.usage_percent,
            ssdTemp: data.disk?.temperature
              ?? data.storage?.disks?.[0]?.temperature,
            diskRead: data.disk?.readMBps
              ?? data.storage?.disks?.[0]?.read_speed_mb,
            diskWrite: data.disk?.writeMBps
              ?? data.storage?.disks?.[0]?.write_speed_mb,

            battery: data.battery?.percentage ?? data.battery?.percent,
            charging: data.battery?.charging ?? data.battery?.plugged_in,
            batteryHealth: data.battery?.health_percent,
            batteryTemp: data.battery?.temperature,

            gpu: data.gpu?.usage,
            gpuTemp: data.gpu?.temperature,

            fanSpeed: data.fan?.rpm,

            network: data.network?.connected ? 'WiFi' : 'Offline',
            networkUpload: data.network?.uploadMbps ?? data.network?.upload_mbps,
            networkDownload: data.network?.downloadMbps ?? data.network?.download_mbps,

            wifiSignal: data.network?.connected ? 100 : 0,
            uptime: data.system?.uptimeSeconds ?? data.system?.uptime_seconds,
            hostname: data.hostname ?? data.system?.hostname,
            lastSeen: data.lastSeen || Date.now(),

            healthScore: data.health?.score,
            healthLabel: data.health?.label,
            anomalies: data.anomalies || [],
            alerts: data.alerts || [],
          };
        } else {
          mappedData = {
            ...data,
            id: incomingId,
            online: true,
            isRealDevice: true,
          };
        }

        const deviceWithStatus = {
          ...mappedData,
          status: evaluateStatus(mappedData)
        };

        const existingIndex = currentDevices.findIndex(
          d => d.id.toLowerCase() === incomingId.toLowerCase()
        );

        if (existingIndex >= 0) {
          const updatedList = [...currentDevices];
          updatedList[existingIndex] = {
            ...updatedList[existingIndex],
            ...deviceWithStatus
          };
          return updatedList;
        } else {
          // Dynamic device discovery: append new device from Laptop B!
          return [...currentDevices, deviceWithStatus];
        }
      });
    });

    socket.on('device_offline', (data) => {
      setDevices(currentDevices =>
        currentDevices.map(device => {
          const matches = device.id.toLowerCase() === (data.deviceId || '').toLowerCase();
          if (matches) {
            return { ...device, online: false, status: 'offline', lastSeen: Date.now() };
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
          
          if (updated.id && updated.id.toUpperCase().includes('LAPTOP')) {
            // LAPTOP DRIFT SIMULATION
            updated.cpu = applyDrift(updated.cpu || 20, 5, 100, 8);
            updated.gpu = applyDrift(updated.gpu || 15, 2, 100, 6);
            updated.ram = applyDrift(updated.ram || 40, 20, 95, 2);
            updated.ramAvailable = parseFloat((16 * (1 - updated.ram / 100)).toFixed(1));

            // Thermal models based on usage + drift
            const targetCpuTemp = 35 + (updated.cpu * 0.5) + (updated.gpu * 0.1);
            updated.cpuTemp = applyDrift(updated.cpuTemp || 40, 35, 95, 1.5);
            // Move cpuTemp smoothly toward targetCpuTemp
            updated.cpuTemp = updated.cpuTemp * 0.9 + targetCpuTemp * 0.1;
            updated.temperature = updated.cpuTemp; // compat

            const targetGpuTemp = 38 + (updated.gpu * 0.45) + (updated.cpu * 0.05);
            updated.gpuTemp = applyDrift(updated.gpuTemp || 42, 35, 95, 1.2);
            updated.gpuTemp = updated.gpuTemp * 0.9 + targetGpuTemp * 0.1;

            updated.ssdTemp = applyDrift(updated.ssdTemp || 38, 30, 70, 0.4);
            updated.ssd = applyDrift(updated.ssd || 70, 70, 75, 0.05); // SSD storage changes very slowly

            // Battery drift
            const batteryDelta = updated.charging ? 0.3 : -0.15;
            updated.battery = Math.max(0, Math.min(100, (updated.battery || 50) + batteryDelta));
            if (updated.battery >= 100 && updated.charging) {
              updated.charging = false; // toggle charging once full
            } else if (updated.battery <= 15 && !updated.charging) {
              updated.charging = true; // start charging at low battery
            }
            updated.batteryTemp = applyDrift(updated.batteryTemp || 32, 28, 50, 0.3);

            // Fan Speed depends on temp
            const highestTemp = Math.max(updated.cpuTemp, updated.gpuTemp);
            let targetFanSpeed = 0;
            if (highestTemp > 45) {
              targetFanSpeed = 1500 + ((highestTemp - 45) / 50) * 4000;
            }
            updated.fanSpeed = Math.round(applyDrift(updated.fanSpeed || 2000, 0, 5800, 150));
            updated.fanSpeed = Math.round(updated.fanSpeed * 0.85 + targetFanSpeed * 0.15);

            // Power Draw in Watts
            updated.power = parseFloat((15 + (updated.cpu * 0.35) + (updated.gpu * 0.4) + (updated.fanSpeed / 1000) * 2).toFixed(1));

            // Wi-Fi and connection details
            updated.wifiSignal = Math.round(applyDrift(updated.wifiSignal || 85, 40, 100, 2));
            updated.uptime = (updated.uptime || 14400) + 1;
          } else {
            // OTHER DEVICES DRIFT
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
          }

          updated.status = evaluateStatus(updated);

          // Formatting floating points
          if (updated.battery !== undefined) updated.battery = parseFloat(updated.battery.toFixed(1));
          if (updated.temperature !== undefined) updated.temperature = parseFloat(updated.temperature.toFixed(1));
          if (updated.cpuTemp !== undefined) updated.cpuTemp = parseFloat(updated.cpuTemp.toFixed(1));
          if (updated.gpuTemp !== undefined) updated.gpuTemp = parseFloat(updated.gpuTemp.toFixed(1));
          if (updated.ssdTemp !== undefined) updated.ssdTemp = parseFloat(updated.ssdTemp.toFixed(1));
          if (updated.batteryTemp !== undefined) updated.batteryTemp = parseFloat(updated.batteryTemp.toFixed(1));
          if (updated.cpu !== undefined) updated.cpu = parseFloat(updated.cpu.toFixed(1));
          if (updated.gpu !== undefined) updated.gpu = parseFloat(updated.gpu.toFixed(1));
          if (updated.ram !== undefined) updated.ram = parseFloat(updated.ram.toFixed(1));
          if (updated.ssd !== undefined) updated.ssd = parseFloat(updated.ssd.toFixed(1));

          return updated;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [isDemoMode, deviceType]);

  return devices;
}

const { io } = require('socket.io-client');

// Simulate only the real connected MOBILE_001 device
const devices = [
  { deviceId: 'MOBILE_001', model: 'Android Phone', network: 'WiFi', battery: 80, charging: true, temperature: 33 }
];

const socket = io('http://localhost:4000');

socket.on('connect', () => {
  console.log('[Test Client] Connected to TwinMind backend!');
  
  // Start sending telemetry loop for each device
  devices.forEach((device) => {
    setInterval(() => {
      // Simulate slight drift
      device.battery = Math.max(0, Math.min(100, device.battery + (device.charging ? 0.2 : -0.1)));
      device.temperature = device.temperature + (Math.random() * 0.4 - 0.2);
      
      const cpuVal = Math.floor(Math.random() * 40 + 20);
      const ramPct = Math.floor(Math.random() * 20 + 40);
      const totalRam = 8192;
      const usedRam = Math.floor(totalRam * (ramPct / 100));

      const payload = {
        deviceId: device.deviceId,
        battery: parseFloat(device.battery.toFixed(1)),
        charging: device.charging,
        temperature: parseFloat(device.temperature.toFixed(1)),
        network: device.network,
        model: device.deviceId === 'MOBILE_001' ? 'Vivo V2336' : device.model,
        online: true,
        cpu: cpuVal,
        ram: ramPct,
        cpuUsage: cpuVal,
        ramUsage: ramPct,
        ramTotal: totalRam,
        ramUsed: usedRam
      };

      console.log(`Sending telemetry for ${device.deviceId}...`);
      socket.emit('device_telemetry', payload);
    }, 2000); // Send every 2 seconds
  });
});

socket.on('disconnect', () => {
  console.log('[Test Client] Disconnected from server');
});

const { io } = require('socket.io-client');

// Simulate 3 mobile devices and 1 laptop device
const devices = [
  { deviceId: 'MOBILE_001', model: 'Android Phone', network: 'WiFi', battery: 80, charging: true, temperature: 33 },
  { deviceId: 'MOBILE_002', model: 'Android Phone', network: '5G', battery: 62, charging: false, temperature: 39 },
  { deviceId: 'MOBILE_003', model: 'Android Phone', network: 'WiFi', battery: 91, charging: true, temperature: 31 },
  { 
    deviceId: 'LAPTOP_001', 
    model: 'Engineering Laptop 1', 
    network: 'Ethernet', 
    battery: 45, 
    charging: true, 
    cpuTemp: 42, 
    gpuTemp: 48, 
    ssdTemp: 38, 
    batteryTemp: 32, 
    fanSpeed: 3800, 
    wifiSignal: 90, 
    ssd: 72, 
    uptime: 14400 
  }
];

const socket = io('http://localhost:4000');

socket.on('connect', () => {
  console.log('[Test Client] Connected to TwinMind backend!');
  
  // Start sending telemetry loop for each device
  devices.forEach((device) => {
    setInterval(() => {
      // Simulate slight drift
      device.battery = Math.max(0, Math.min(100, device.battery + (device.charging ? 0.2 : -0.1)));
      if (device.battery >= 100 && device.charging) device.charging = false;
      else if (device.battery <= 15 && !device.charging) device.charging = true;

      const isLaptop = device.deviceId.includes('LAPTOP');
      let payload = {
        deviceId: device.deviceId,
        battery: parseFloat(device.battery.toFixed(1)),
        charging: device.charging,
        network: device.network,
        model: device.model,
        online: true,
      };

      if (isLaptop) {
        // Laptop drift values
        const cpu = Math.floor(Math.random() * 40 + 20);
        const gpu = Math.floor(Math.random() * 30 + 15);
        const ram = Math.floor(Math.random() * 15 + 60);

        device.cpuTemp = Math.max(35, Math.min(95, device.cpuTemp + (cpu > 40 ? 0.8 : -0.4) + (Math.random() * 0.4 - 0.2)));
        device.gpuTemp = Math.max(35, Math.min(95, device.gpuTemp + (gpu > 30 ? 0.6 : -0.3) + (Math.random() * 0.4 - 0.2)));
        device.ssdTemp = Math.max(30, Math.min(65, device.ssdTemp + (Math.random() * 0.2 - 0.1)));
        device.batteryTemp = Math.max(28, Math.min(48, device.batteryTemp + (device.charging ? 0.15 : -0.1)));
        device.fanSpeed = Math.round(1500 + (Math.max(device.cpuTemp, device.gpuTemp) - 35) * 60 + (Math.random() * 100 - 50));
        device.wifiSignal = Math.max(50, Math.min(100, device.wifiSignal + Math.round(Math.random() * 4 - 2)));
        device.uptime += 2;

        payload = {
          ...payload,
          cpu,
          gpu,
          ram,
          ramAvailable: parseFloat((16 * (1 - ram / 100)).toFixed(1)),
          cpuTemp: parseFloat(device.cpuTemp.toFixed(1)),
          temperature: parseFloat(device.cpuTemp.toFixed(1)),
          gpuTemp: parseFloat(device.gpuTemp.toFixed(1)),
          ssdTemp: parseFloat(device.ssdTemp.toFixed(1)),
          ssd: device.ssd,
          batteryTemp: parseFloat(device.batteryTemp.toFixed(1)),
          batteryHealth: 94,
          batteryCycles: 142,
          fanSpeed: device.fanSpeed,
          power: parseFloat((15 + (cpu * 0.35) + (gpu * 0.4) + (device.fanSpeed / 1000) * 2).toFixed(1)),
          wifiSignal: device.wifiSignal,
          uptime: device.uptime
        };
      } else {
        device.temperature = device.temperature + (Math.random() * 0.4 - 0.2);
        payload = {
          ...payload,
          temperature: parseFloat(device.temperature.toFixed(1)),
          cpu: Math.floor(Math.random() * 40 + 20),
          ram: Math.floor(Math.random() * 20 + 40)
        };
      }

      console.log(`Sending telemetry for ${device.deviceId}...`);
      socket.emit('device_telemetry', payload);
    }, 2000); // Send every 2 seconds
  });
});


socket.on('disconnect', () => {
  console.log('[Test Client] Disconnected from server');
});

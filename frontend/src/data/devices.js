export const mockMobileDevices = [
  {
    id: "MOBILE_001",
    name: "Mobile 001",
    battery: 82,
    temperature: 32,
    cpu: 28,
    ram: 45,
    network: "WiFi",
    charging: true,
    status: "normal"
  },
  {
    id: "MOBILE_002",
    name: "Mobile 002",
    battery: 61,
    temperature: 39,
    cpu: 64,
    ram: 72,
    network: "5G",
    charging: false,
    status: "warning"
  },
  {
    id: "MOBILE_003",
    name: "Mobile 003",
    battery: 94,
    temperature: 31,
    cpu: 21,
    ram: 38,
    network: "WiFi",
    charging: true,
    status: "normal"
  }
];

export const mockLaptopDevices = [
  {
    id: "TWIN-LAPTOP-4C18F",
    name: "Dhanush_lap",
    status: "normal",
    model: "ASUS ROG Strix G15 (GTX 1650)",
    cpuModel: "Intel® Core™ i5-10300H / AMD Ryzen™ 7",
    gpuModel: "NVIDIA® GeForce® GTX 1650 (4GB GDDR6)",
    online: true,
    isRealDevice: true,
    battery: 80,
    temperature: 40,
    cpu: 6.2,
    ram: 87.4,
    network: "WiFi",
    charging: true,
    gpu: 0,
    cpuTemp: null,
    gpuTemp: 40,
    ramTotal: 16,
    ramAvailable: 8.8,
    ssd: 63,
    ssdTemp: 36,
    batteryTemp: 30,
    batteryHealth: 95,
    power: 12.5,
    fanSpeed: null,
    wifiSignal: 100,
    uptime: 6540
  }
];

export const mockMonitorDevices = [
  {
    id: "MONITOR_001",
    name: "Control Room Display A",
    power: "ON",
    brightness: 80,
    temperature: 35,
    status: "normal"
  }
];

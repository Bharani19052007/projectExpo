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
    id: "laptop-001",
    name: "Engineering Laptop 1",
    status: "warning",
    // Core parameters
    battery: 45,
    temperature: 42,
    cpu: 85,
    ram: 90,
    network: "Ethernet",
    charging: true,
    // Detailed twin parameters
    gpu: 65,
    cpuTemp: 42,
    gpuTemp: 48,
    ramAvailable: 1.6,
    ssd: 72,
    ssdTemp: 38,
    batteryTemp: 32,
    batteryHealth: 94,
    batteryCycles: 142,
    power: 65,
    fanSpeed: 3800,
    wifiSignal: 90,
    uptime: 14400
  },
  {
    id: "TWIN-LAPTOP-4C18F",
    name: "Laptop A (TwinMind Agent)",
    status: "normal",
    online: false,
    // Default values shown before real data arrives
    battery: null,
    temperature: null,
    cpu: null,
    ram: null,
    network: "WiFi",
    charging: null,
    gpu: null,
    cpuTemp: null,
    gpuTemp: null,
    ramAvailable: null,
    ssd: null,
    ssdTemp: null,
    batteryTemp: null,
    batteryHealth: null,
    fanSpeed: null,
    wifiSignal: null,
    uptime: null
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

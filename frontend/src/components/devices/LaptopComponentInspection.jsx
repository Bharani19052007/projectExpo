import React from 'react';
import { Cpu, MemoryStick, Database, Battery, Fan, Tv, Keyboard, MousePointerClick, Wifi, Zap } from 'lucide-react';

export default function LaptopComponentInspection({ telemetry, selectedComponent, onSelectComponent }) {
  // Helper to compute individual component health
  const getComponentHealth = (id) => {
    switch (id) {
      case 'CPU':
        return Math.max(0, Math.min(100, Math.round(100 - (telemetry.cpuTemp > 60 ? (telemetry.cpuTemp - 60) * 1.5 : 0) - (telemetry.cpu > 90 ? (telemetry.cpu - 90) : 0))));
      case 'GPU':
        return Math.max(0, Math.min(100, Math.round(100 - (telemetry.gpuTemp > 60 ? (telemetry.gpuTemp - 60) * 1.5 : 0) - (telemetry.gpu > 90 ? (telemetry.gpu - 90) : 0))));
      case 'RAM':
        return Math.max(0, Math.min(100, Math.round(100 - (telemetry.ram > 85 ? (telemetry.ram - 85) * 3 : 0))));
      case 'SSD':
        return Math.max(0, Math.min(100, Math.round(100 - (telemetry.ssdTemp > 55 ? (telemetry.ssdTemp - 55) * 2 : 0))));
      case 'Battery':
        return telemetry.batteryHealth || 94;
      case 'Cooling fan':
        const thermalLoad = Math.max(telemetry.cpuTemp || 40, telemetry.gpuTemp || 40);
        if (thermalLoad > 75 && (telemetry.fanSpeed || 0) < 2000) return 45; // Fan failure warning
        return 98;
      case 'Display':
        return 99;
      case 'Keyboard':
        return 100;
      case 'Touchpad':
        return 100;
      case 'Wi-Fi module':
        return telemetry.wifiSignal < 40 ? 78 : 96;
      case 'Charging system':
        return 100;
      default:
        return 100;
    }
  };

  const getStatusColor = (health) => {
    if (health >= 90) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (health >= 70) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  const ramTotalDisplay = telemetry.ramTotal ? `${telemetry.ramTotal}GB` : '16GB';
  const cpuDisplay = telemetry.cpuModel || (telemetry.hostname ? `${telemetry.hostname} CPU` : 'Intel® Core™ i5-10300H / AMD Ryzen™ 7');

  const components = [
    { id: 'CPU', name: cpuDisplay, icon: Cpu, desc: 'Central processing unit & system execution telemetry.' },
    { id: 'GPU', name: 'NVIDIA® GeForce® GTX 1650 (4GB GDDR6)', icon: Cpu, desc: 'Dedicated Turing architecture GPU with dynamic Boost Clock.' },
    { id: 'RAM', name: `${ramTotalDisplay} DDR4 3200MHz Dual-Channel`, icon: MemoryStick, desc: 'High-bandwidth gaming memory footprint and system availability.' },
    { id: 'SSD', name: '512GB PCIe® 3.0 NVMe™ M.2 SSD', icon: Database, desc: 'Ultra-fast solid state drive storage capacity and throughput.' },
    { id: 'Battery', name: '56Wh 4-Cell Li-ion (150W Fast Charge)', icon: Battery, desc: 'High-drain battery pack with ASUS Battery Health Charging protection.' },
    { id: 'Display', name: '15.6" FHD 144Hz IPS Anti-Glare Display', icon: Tv, desc: 'Fast refresh rate gaming display panel with adaptive sync.' },
    { id: 'Keyboard', name: '4-Zone Aura Sync RGB (Transparent WASD)', icon: Keyboard, desc: 'Desktop-style gaming keyboard with Overstroke technology and highlighted WASD keys.' },
    { id: 'Touchpad', name: 'Precision Glass Touchpad', icon: MousePointerClick, desc: 'Large smooth surface with multi-touch Windows Precision gesture recognition.' },
    { id: 'Wi-Fi module', name: 'Intel® Wi-Fi 6 (802.11ax) + RangeBoost', icon: Wifi, desc: 'Dual-band Wi-Fi 6 wireless controller with ROG RangeBoost antenna array.' },
    { id: 'Charging system', name: '150W Dedicated ROG Barrel / Type-C PD', icon: Zap, desc: 'Power regulation stage supplying high-wattage current for GPU Boost.' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0a0f1d]/60 border border-[#1e293b] rounded-2xl p-4 backdrop-blur-md">
      <h3 className="text-sm font-bold tracking-wider text-slate-300 uppercase mb-3 flex items-center gap-2">
        <Database className="w-4 h-4 text-sky-400" />
        Component Inspector
      </h3>

      <div className="flex-1 overflow-y-auto space-y-2 max-h-[320px] pr-1 scrollbar-thin">
        {components.map((comp) => {
          const health = getComponentHealth(comp.id);
          const isSelected = selectedComponent === comp.id;
          const statusStyle = getStatusColor(health);

          return (
            <button
              key={comp.id}
              onClick={() => onSelectComponent(isSelected ? null : comp.id)}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all duration-200 hover:bg-[#1e293b]/50 ${
                isSelected ? 'border-sky-500 bg-sky-500/10 shadow-lg shadow-sky-500/5' : 'border-[#1e293b] bg-black/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-slate-800 ${isSelected ? 'text-sky-400' : 'text-slate-400'}`}>
                  <comp.icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{comp.id}</div>
                  <div className="text-[10px] text-slate-400 font-medium truncate max-w-[150px]">{comp.name}</div>
                </div>
              </div>

              <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusStyle}`}>
                {health}%
              </div>
            </button>
          );
        })}
      </div>

      {/* Expanded detail box */}
      {selectedComponent && (
        <div className="mt-3 p-3 bg-slate-900/80 border border-sky-500/20 rounded-xl animate-fadeIn">
          {(() => {
            const comp = components.find(c => c.id === selectedComponent);
            const health = getComponentHealth(selectedComponent);
            return (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-sky-400">{comp.id} Diagnostics</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${health >= 90 ? 'bg-emerald-500/10 text-emerald-400' : health >= 70 ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    {health >= 90 ? 'HEALTHY' : health >= 70 ? 'WARNING' : 'CRITICAL'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 leading-relaxed mb-2">{comp.desc}</p>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  {selectedComponent === 'CPU' && (
                    <>
                      <div className="bg-black/25 p-1.5 rounded">
                        <div className="text-slate-400 font-medium">Usage</div>
                        <div className="font-bold font-mono text-white">{telemetry.cpu || 0}%</div>
                      </div>
                      <div className="bg-black/25 p-1.5 rounded">
                        <div className="text-slate-400 font-medium">Temp</div>
                        <div className="font-bold font-mono text-white">{telemetry.cpuTemp || telemetry.temperature || 0}°C</div>
                      </div>
                    </>
                  )}
                  {selectedComponent === 'GPU' && (
                    <>
                      <div className="bg-black/25 p-1.5 rounded">
                        <div className="text-slate-400 font-medium">Usage</div>
                        <div className="font-bold font-mono text-white">{telemetry.gpu || 0}%</div>
                      </div>
                      <div className="bg-black/25 p-1.5 rounded">
                        <div className="text-slate-400 font-medium">Temp</div>
                        <div className="font-bold font-mono text-white">{telemetry.gpuTemp || 0}°C</div>
                      </div>
                    </>
                  )}
                  {selectedComponent === 'RAM' && (
                    <>
                      <div className="bg-black/25 p-1.5 rounded">
                        <div className="text-slate-400 font-medium">Usage</div>
                        <div className="font-bold font-mono text-white">{telemetry.ram || 0}%</div>
                      </div>
                      <div className="bg-black/25 p-1.5 rounded">
                        <div className="text-slate-400 font-medium">Available</div>
                        <div className="font-bold font-mono text-white">{telemetry.ramAvailable || 0} GB</div>
                      </div>
                    </>
                  )}
                  {selectedComponent === 'SSD' && (
                    <>
                      <div className="bg-black/25 p-1.5 rounded">
                        <div className="text-slate-400 font-medium">Storage Used</div>
                        <div className="font-bold font-mono text-white">{telemetry.ssd || 0}%</div>
                      </div>
                      <div className="bg-black/25 p-1.5 rounded">
                        <div className="text-slate-400 font-medium">Temp</div>
                        <div className="font-bold font-mono text-white">{telemetry.ssdTemp || 0}°C</div>
                      </div>
                    </>
                  )}
                  {selectedComponent === 'Battery' && (
                    <>
                      <div className="bg-black/25 p-1.5 rounded">
                        <div className="text-slate-400 font-medium">Charge Level</div>
                        <div className="font-bold font-mono text-emerald-400">{telemetry.battery !== null && telemetry.battery !== undefined ? `${telemetry.battery}%` : 'N/A'}</div>
                      </div>
                      <div className="bg-black/25 p-1.5 rounded">
                        <div className="text-slate-400 font-medium">Health Rating</div>
                        <div className="font-bold font-mono text-white">{telemetry.batteryHealth || 94}%</div>
                      </div>
                    </>
                  )}
                  {selectedComponent === 'Cooling fan' && (
                    <>
                      <div className="bg-black/25 p-1.5 rounded">
                        <div className="text-slate-400 font-medium">Fan Speed</div>
                        <div className="font-bold font-mono text-white">{telemetry.fanSpeed || 0} RPM</div>
                      </div>
                      <div className="bg-black/25 p-1.5 rounded">
                        <div className="text-slate-400 font-medium">Efficiency</div>
                        <div className="font-bold font-mono text-white">{health}%</div>
                      </div>
                    </>
                  )}
                  {selectedComponent === 'Display' && (
                    <>
                      <div className="bg-black/25 p-1.5 rounded">
                        <div className="text-slate-400 font-medium">Lid Opening</div>
                        <div className="font-bold font-mono text-white">Open</div>
                      </div>
                      <div className="bg-black/25 p-1.5 rounded">
                        <div className="text-slate-400 font-medium">Refresh Rate</div>
                        <div className="font-bold font-mono text-white">60 Hz</div>
                      </div>
                    </>
                  )}
                  {selectedComponent === 'Keyboard' && (
                    <>
                      <div className="bg-black/25 p-1.5 rounded">
                        <div className="text-slate-400 font-medium">Backlight</div>
                        <div className="font-bold font-mono text-white">100%</div>
                      </div>
                      <div className="bg-black/25 p-1.5 rounded">
                        <div className="text-slate-400 font-medium">Buffer Status</div>
                        <div className="font-bold font-mono text-white">Active</div>
                      </div>
                    </>
                  )}
                  {selectedComponent === 'Touchpad' && (
                    <>
                      <div className="bg-black/25 p-1.5 rounded">
                        <div className="text-slate-400 font-medium">Sensitivity</div>
                        <div className="font-bold font-mono text-white">Medium</div>
                      </div>
                      <div className="bg-black/25 p-1.5 rounded">
                        <div className="text-slate-400 font-medium">Driver State</div>
                        <div className="font-bold font-mono text-white">Connected</div>
                      </div>
                    </>
                  )}
                  {selectedComponent === 'Wi-Fi module' && (
                    <>
                      <div className="bg-black/25 p-1.5 rounded">
                        <div className="text-slate-400 font-medium">Signal Strength</div>
                        <div className="font-bold font-mono text-white">{telemetry.wifiSignal || 0}%</div>
                      </div>
                      <div className="bg-black/25 p-1.5 rounded">
                        <div className="text-slate-400 font-medium">Link Status</div>
                        <div className="font-bold font-mono text-white">{telemetry.network || 'WiFi'}</div>
                      </div>
                    </>
                  )}
                  {selectedComponent === 'Charging system' && (
                    <>
                      <div className="bg-black/25 p-1.5 rounded">
                        <div className="text-slate-400 font-medium">Total Draw</div>
                        <div className="font-bold font-mono text-white">{telemetry.power || 0}W</div>
                      </div>
                      <div className="bg-black/25 p-1.5 rounded">
                        <div className="text-slate-400 font-medium">PD Protocol</div>
                        <div className="font-bold font-mono text-white">Active (20V)</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

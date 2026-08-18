import React from 'react';
import { Cpu, Thermometer, MemoryStick, Database, Battery, Fan, Wifi, Zap, Clock } from 'lucide-react';
import TelemetryCard from './TelemetryCard';

export default function LaptopTelemetryPanel({ telemetry }) {
  // Helper to format uptime into Hh Mm Ss
  const formatUptime = (seconds) => {
    if (!seconds) return '0s';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) return `${hrs}h ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const isReal = telemetry.isRealDevice;
  const cpuTemp = isReal ? (telemetry.cpuTemp !== undefined ? telemetry.cpuTemp : null) : (telemetry.cpuTemp || telemetry.temperature || 40);
  const gpuTemp = isReal ? (telemetry.gpuTemp !== undefined ? telemetry.gpuTemp : null) : (telemetry.gpuTemp || 40);
  const fanRPM = isReal ? (telemetry.fanSpeed !== undefined ? telemetry.fanSpeed : null) : (telemetry.fanSpeed || 0);
  const batteryPct = isReal ? (telemetry.battery !== undefined ? telemetry.battery : null) : (telemetry.battery || 0);

  return (
    <div className="flex flex-col h-full bg-[#0a0f1d]/60 border border-[#1e293b] rounded-2xl p-4 backdrop-blur-md">
      <h3 className="text-sm font-bold tracking-wider text-slate-300 uppercase mb-3 flex items-center gap-2">
        <Cpu className="w-4 h-4 text-emerald-400" />
        System Live Telemetry
      </h3>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <TelemetryCard 
          title="CPU Usage" 
          value={telemetry.cpu || 0} 
          unit="%" 
          icon={Cpu} 
          color={telemetry.cpu > 85 ? 'rose' : (telemetry.cpu > 60 ? 'amber' : 'blue')} 
        />
        <TelemetryCard 
          title="CPU Temp" 
          value={cpuTemp} 
          unit="°C" 
          icon={Thermometer} 
          color={cpuTemp > 80 ? 'rose' : (cpuTemp > 65 ? 'amber' : 'emerald')} 
        />
        <TelemetryCard 
          title="GPU Usage" 
          value={telemetry.gpu || 0} 
          unit="%" 
          icon={Cpu} 
          color={telemetry.gpu > 85 ? 'rose' : (telemetry.gpu > 60 ? 'amber' : 'blue')} 
        />
        <TelemetryCard 
          title="GPU Temp" 
          value={gpuTemp} 
          unit="°C" 
          icon={Thermometer} 
          color={gpuTemp > 80 ? 'rose' : (gpuTemp > 65 ? 'amber' : 'emerald')} 
        />
        <TelemetryCard 
          title="RAM Load" 
          value={telemetry.ram || 0} 
          unit="%" 
          icon={MemoryStick} 
          color={telemetry.ram > 85 ? 'rose' : (telemetry.ram > 70 ? 'amber' : 'slate')} 
        />
        <TelemetryCard 
          title="SSD Space" 
          value={telemetry.ssd || 0} 
          unit="%" 
          icon={Database} 
          color={telemetry.ssd > 85 ? 'rose' : 'slate'} 
        />
        <TelemetryCard 
          title="Battery" 
          value={batteryPct} 
          unit="%" 
          icon={Battery} 
          color={batteryPct < 20 ? 'rose' : (telemetry.charging ? 'emerald' : 'slate')} 
        />
        <TelemetryCard 
          title="Cooling Fan" 
          value={fanRPM} 
          unit="RPM" 
          icon={Fan} 
          color={fanRPM > 5000 ? 'rose' : (fanRPM > 3500 ? 'amber' : 'slate')} 
        />
      </div>

      {/* Mini details grid for tertiary variables */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-black/20 p-2.5 rounded-xl border border-[#1e293b]/40">
        <div className="flex flex-col">
          <span className="text-[9px] font-bold text-slate-500 uppercase">Power Consumption</span>
          <span className="text-xs font-bold text-slate-300 font-mono mt-0.5 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            {telemetry.power || 0} W
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[9px] font-bold text-slate-500 uppercase">Battery Temp</span>
          <span className="text-xs font-bold text-slate-300 font-mono mt-0.5 flex items-center gap-1">
            <Thermometer className="w-3.5 h-3.5 text-sky-400" />
            {telemetry.batteryTemp || 0} °C
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[9px] font-bold text-slate-500 uppercase">WiFi Signal</span>
          <span className="text-xs font-bold text-slate-300 font-mono mt-0.5 flex items-center gap-1">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            {telemetry.wifiSignal || 0}% ({telemetry.network || 'Ethernet'})
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[9px] font-bold text-slate-500 uppercase">System Uptime</span>
          <span className="text-xs font-bold text-slate-300 font-mono mt-0.5 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {formatUptime(telemetry.uptime)}
          </span>
        </div>
      </div>
    </div>
  );
}

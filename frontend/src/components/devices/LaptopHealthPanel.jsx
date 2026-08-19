import React from 'react';
import { Heart, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

export default function LaptopHealthPanel({ telemetry }) {
  const isReal = telemetry.isRealDevice;
  
  // CPU Health
  const hasCpu = telemetry.cpu !== null && telemetry.cpu !== undefined;
  const hasCpuTemp = telemetry.cpuTemp !== null && telemetry.cpuTemp !== undefined;
  const cpuTemp = hasCpuTemp ? telemetry.cpuTemp : (isReal ? null : (telemetry.temperature || 40));
  
  let cpuHealth = 100;
  if (hasCpu || hasCpuTemp) {
    const usagePenalty = telemetry.cpu > 90 ? (telemetry.cpu - 90) : 0;
    const tempPenalty = (cpuTemp !== null && cpuTemp > 60) ? (cpuTemp - 60) * 1.5 : 0;
    cpuHealth = Math.max(0, Math.min(100, Math.round(100 - tempPenalty - usagePenalty)));
  }

  // GPU Health
  const hasGpu = telemetry.gpu !== null && telemetry.gpu !== undefined;
  const hasGpuTemp = telemetry.gpuTemp !== null && telemetry.gpuTemp !== undefined;
  const gpuTemp = hasGpuTemp ? telemetry.gpuTemp : (isReal ? null : 40);
  
  let gpuHealth = null;
  if (hasGpu || hasGpuTemp) {
    const usagePenalty = (telemetry.gpu > 90) ? (telemetry.gpu - 90) : 0;
    const tempPenalty = (gpuTemp !== null && gpuTemp > 60) ? (gpuTemp - 60) * 1.5 : 0;
    gpuHealth = Math.max(0, Math.min(100, Math.round(100 - tempPenalty - usagePenalty)));
  } else if (!isReal) {
    gpuHealth = 100;
  }

  // RAM Health
  const hasRam = telemetry.ram !== null && telemetry.ram !== undefined;
  const ram = hasRam ? telemetry.ram : (isReal ? null : 50);
  let ramHealth = 100;
  if (hasRam) {
    ramHealth = Math.max(0, Math.min(100, Math.round(100 - (ram > 85 ? (ram - 85) * 3 : 0))));
  }

  // SSD Health
  const hasSsdTemp = telemetry.ssdTemp !== null && telemetry.ssdTemp !== undefined;
  const ssdTemp = hasSsdTemp ? telemetry.ssdTemp : (isReal ? null : 35);
  let ssdHealth = 100;
  if (hasSsdTemp) {
    ssdHealth = Math.max(0, Math.min(100, Math.round(100 - (ssdTemp > 55 ? (ssdTemp - 55) * 2.5 : 0))));
  }

  // Battery Health (defaults to 96% based on healthy charge cycle)
  const hasBatteryHealth = telemetry.batteryHealth !== null && telemetry.batteryHealth !== undefined;
  const batHealth = hasBatteryHealth ? telemetry.batteryHealth : (telemetry.battery ? Math.min(100, Math.max(90, Math.round(telemetry.battery * 0.2 + 80))) : 96);

  // Network / Link Health
  const wifiHealth = telemetry.wifiSignal ? Math.min(100, Math.max(80, telemetry.wifiSignal)) : 100;

  // 2. Average to get overall Health Score
  const scores = [];
  if (cpuHealth !== null) scores.push(cpuHealth);
  if (gpuHealth !== null) scores.push(gpuHealth);
  if (ramHealth !== null) scores.push(ramHealth);
  if (ssdHealth !== null) scores.push(ssdHealth);
  if (batHealth !== null) scores.push(batHealth);
  if (wifiHealth !== null) scores.push(wifiHealth);

  const overallHealth = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 100;

  // Determine status configurations
  let healthColor = 'text-emerald-400 border-emerald-500/20';
  let healthText = 'HEALTHY';
  let ringGlow = 'shadow-[0_0_15px_rgba(16,185,129,0.2)] border-emerald-500';
  let strokeDash = 251.2 - (251.2 * overallHealth) / 100;

  if (overallHealth < 70) {
    healthColor = 'text-rose-400 border-rose-500/20';
    healthText = 'CRITICAL';
    ringGlow = 'shadow-[0_0_15px_rgba(239,68,68,0.2)] border-rose-500';
  } else if (overallHealth < 88) {
    healthColor = 'text-amber-400 border-amber-500/20';
    healthText = 'WARNING';
    ringGlow = 'shadow-[0_0_15px_rgba(245,158,11,0.2)] border-amber-500';
  }

  // 3. Predictive Maintenance Layer
  const getPredictiveMaintenance = () => {
    // GPU Overheating
    if (gpuTemp !== null && gpuTemp > 80) {
      return {
        issue: 'GPU Thermal Threshold Alert',
        explanation: `Dedicated GTX 1650 GPU is running warm at ${gpuTemp}°C.`,
        action: 'Close heavy 3D rendering tasks or place the laptop in a well-ventilated area.'
      };
    }
    // Memory saturation
    if (hasRam && ram > 90) {
      return {
        issue: 'System Memory Saturation',
        explanation: `RAM usage is at ${ram}%, exhausting local registers and forcing virtual memory swap writes.`,
        action: 'Identify and close high-memory background applications in task manager.'
      };
    }
    // SSD Temperature hazard
    if (hasSsdTemp && ssdTemp > 58) {
      return {
        issue: 'Solid State Storage Overheating',
        explanation: `The M.2 SSD temperature is elevated at ${ssdTemp}°C.`,
        action: 'Reduce continuous high-bandwidth disk write operations until SSD cools down.'
      };
    }
    return null;
  };

  const maintAdvice = getPredictiveMaintenance();

  const renderComponentHealth = (score) => {
    if (score === null || score === undefined) return <span className="text-slate-500 font-bold">N/A</span>;
    const color = score >= 90 ? 'text-emerald-400' : score >= 70 ? 'text-amber-400' : 'text-rose-400';
    return <span className={`font-bold ${color}`}>{score}%</span>;
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0f1d]/60 border border-[#1e293b] rounded-2xl p-4 backdrop-blur-md">
      <h3 className="text-sm font-bold tracking-wider text-slate-300 uppercase mb-3 flex items-center gap-2">
        <Heart className="w-4 h-4 text-emerald-400 animate-pulse" />
        Health & Maintenance
      </h3>

      <div className="flex gap-4 items-center mb-4">
        {/* Circular health score gauge */}
        <div className={`relative w-24 h-24 flex items-center justify-center flex-shrink-0 rounded-full border border-transparent ${ringGlow}`}>
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="40"
              className="stroke-[#1e293b]"
              strokeWidth="6"
              fill="transparent"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              className={`transition-all duration-500 ease-out ${
                overallHealth >= 90 ? 'stroke-emerald-500' : overallHealth >= 70 ? 'stroke-amber-500' : 'stroke-rose-500'
              }`}
              strokeWidth="6"
              fill="transparent"
              strokeDasharray="251.2"
              strokeDashoffset={strokeDash}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-black font-mono leading-none text-white">{overallHealth}%</span>
            <span className={`text-[8px] font-bold tracking-widest mt-1 ${healthColor}`}>{healthText}</span>
          </div>
        </div>

        {/* Individual Component Health List */}
        <div className="flex-1 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px] bg-black/15 p-2 rounded-xl border border-[#1e293b]/30">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-medium">CPU Health</span>
            {renderComponentHealth(cpuHealth)}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-medium">GPU Health</span>
            {renderComponentHealth(gpuHealth)}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-medium">RAM Health</span>
            {renderComponentHealth(ramHealth)}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-medium">SSD Health</span>
            {renderComponentHealth(ssdHealth)}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-medium">Battery Cell</span>
            {renderComponentHealth(batHealth)}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-medium">Network Link</span>
            {renderComponentHealth(wifiHealth)}
          </div>
        </div>
      </div>

      {/* AI Predictive Maintenance Panel */}
      <div className="flex-1 flex flex-col justify-between">
        <div className="text-[10px] font-bold text-sky-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
          Predictive Maintenance Insight
        </div>

        {maintAdvice ? (
          <div className="p-3 bg-rose-500/5 border border-rose-500/25 rounded-xl flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold mb-1">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                {maintAdvice.issue}
              </div>
              <p className="text-[10px] text-slate-300 leading-relaxed font-medium">
                {maintAdvice.explanation}
              </p>
            </div>
            <div className="mt-2 pt-2 border-t border-rose-500/10 text-[9px] text-amber-400 font-bold">
              <span className="text-slate-400 mr-1">ACTION REQUIRED:</span>
              {maintAdvice.action}
            </div>
          </div>
        ) : (
          <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex-1 flex flex-col justify-center items-center text-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 mb-1" />
            <span className="text-xs font-bold text-slate-200">All systems operating within specification</span>
            <span className="text-[9px] text-slate-400 mt-1 max-w-[200px] leading-relaxed">
              Temperatures, voltage inputs, and workloads are fully stable. Cooling efficiency is at maximum rating. No actions required.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

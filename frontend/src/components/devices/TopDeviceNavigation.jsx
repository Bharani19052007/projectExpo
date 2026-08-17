import React from 'react';
import { Smartphone, Laptop, Monitor, Activity, Zap, Server } from 'lucide-react';

export default function TopDeviceNavigation({ activeType, onChangeType, isDemoMode, onToggleDemoMode }) {
  const tabs = [
    { id: 'MOBILE', label: 'MOBILE', icon: Smartphone },
    { id: 'LAPTOP', label: 'LAPTOP', icon: Laptop },
    { id: 'MONITOR', label: 'MONITOR', icon: Monitor },
  ];

  return (
    <header className="flex-shrink-0 bg-[#0f172a]/95 backdrop-blur-md border-b border-[#1e293b] px-6 py-3 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#38bdf8]" />
          <h1 className="text-sm font-extrabold tracking-tight uppercase text-white">
            Device Digital Twin Command Center
          </h1>
        </div>

        {/* Demo Mode Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-[#020617] rounded-xl border border-[#1e293b]">
          <button
            onClick={() => onToggleDemoMode()}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              isDemoMode
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'text-[#64748b] hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>DEMO MODE</span>
          </button>
          <button
            onClick={() => onToggleDemoMode()}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              !isDemoMode
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-[#64748b] hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>REAL DEVICE MODE</span>
          </button>
        </div>
      </div>

      <div className="flex items-center bg-[#020617] p-1 rounded-xl border border-[#1e293b]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeType(tab.id)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isActive
                  ? 'bg-[#1976d2] text-white shadow-md'
                  : 'text-[#94a3b8] hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}

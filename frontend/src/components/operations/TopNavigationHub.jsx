import React, { useState, useEffect } from 'react';
import {
  Activity,
  Layers,
  Sparkles,
  RotateCcw,
  Maximize2,
  Minimize2,
  Compass,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Building2,
  Thermometer,
  Zap,
  TrendingUp,
  Cpu,
  Waves,
  Eye,
  Factory
} from 'lucide-react';

export default function TopNavigationHub({
  plantOverview,
  viewMode = 'OVERVIEW',
  onChangeViewMode,
  cameraPreset = 'overview',
  onChangeCameraPreset,
  isDroneTour = false,
  onToggleDroneTour,
  onResetCamera,
  overallHealth = 94.2,
  activeAlertCount = 12,
  onOpenEmergencyModal,
  isHologramVibration = false,
  onToggleHologramVibration,
  onOpenPartsStudio,
}) {
  const [timeUtc, setTimeUtc] = useState('10:24:35 AM');

  // Live UTC Clock updater
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeUtc(
        now.toLocaleTimeString('en-US', {
          hour12: true,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const viewModes = ['OVERVIEW', 'FLOOR 1', 'FLOOR 2', 'FLOOR 3', 'UTILITIES'];

  return (
    <header className="absolute top-0 left-0 right-0 z-40 pointer-events-auto select-none font-sans flex flex-col">
      {/* 1. Main Header Bar */}
      <div className={`backdrop-blur-md border-b px-5 py-2 shadow-sm flex items-center justify-between transition-colors duration-300 ${
        isHologramVibration 
          ? 'bg-[#020617]/95 border-[#1e293b] text-white' 
          : 'bg-white/95 border-[#d8e6ff] text-[#0f172a]'
      }`}>
        {/* Left: Branding & Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1976d2] to-[#0d47a1] flex items-center justify-center text-white shadow-sm font-bold text-sm">
              TM
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight">
                  TwinMind
                </span>
                <span className="text-xs font-bold text-[#1976d2] uppercase tracking-wider">
                  Ai
                </span>
                <span className={`text-[10px] font-medium border-l pl-1.5 ml-1 ${isHologramVibration ? 'border-[#334155] text-[#94a3b8]' : 'border-[#cbd5e1] text-[#64748b]'}`}>
                  Industrial Command Center
                </span>
              </div>
              <div className={`text-[10px] font-semibold flex items-center gap-1.5 ${isHologramVibration ? 'text-[#94a3b8]' : 'text-[#64748b]'}`}>
                <span>Munich GigaFactory Campus 04</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-500 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: PRIMARY TWIN VIEW OPTIONS */}
        <div className="flex items-center p-1 rounded-2xl border shadow-inner transition-all bg-[#0f172a]/5 dark:bg-[#0f172a] border-[#cbd5e1] dark:border-[#1e293b] gap-1">
          {/* OPTION 1: REALISTIC FACTORY CAMPUS */}
          <button
            onClick={() => onToggleHologramVibration?.(false)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
              !isHologramVibration
                ? 'bg-[#1976d2] text-white shadow-md ring-2 ring-[#1976d2]/30 scale-[1.02]'
                : 'text-[#64748b] hover:text-[#0f172a] hover:bg-black/5'
            }`}
          >
            <Factory className="w-3.5 h-3.5" />
            <span>FACTORY CAMPUS</span>
          </button>

          {/* OPTION 2: HOLOGRAM VIBRATION TWIN */}
          <button
            onClick={() => onToggleHologramVibration?.(true)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
              isHologramVibration
                ? 'bg-[#00c2ff] text-[#020617] shadow-md shadow-[#00c2ff]/30 ring-2 ring-[#00c2ff]/50 scale-[1.02] animate-pulse'
                : 'text-[#64748b] hover:text-[#00c2ff] hover:bg-black/5'
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            <span>HOLOGRAM VIBRATION</span>
          </button>

          {/* OPTION 3: INDIVIDUAL MACHINE & PARTS STUDIO */}
          {onOpenPartsStudio && (
            <button
              onClick={() => onOpenPartsStudio()}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md hover:from-cyan-400 hover:to-blue-500"
              title="Inspect Individual Machine Digital Twins with Component Breakdown"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>MACHINE & PARTS STUDIO</span>
            </button>
          )}
        </div>

        {/* Right: Drone Tour, Reset, UTC Clock */}
        <div className="flex items-center gap-3">
          {/* Sub-level View switcher (when in Realistic Factory mode) */}
          {!isHologramVibration && (
            <div className="flex items-center gap-1 bg-[#edf4ff] p-1 rounded-xl border border-[#d8e6ff]">
              {viewModes.map((mode) => {
                const isActive = viewMode === mode;
                return (
                  <button
                    key={mode}
                    onClick={() => onChangeViewMode?.(mode)}
                    className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition-all ${
                      isActive
                        ? 'bg-[#1976d2] text-white shadow-2xs'
                        : 'text-[#64748b] hover:text-[#0f172a]'
                    }`}
                  >
                    {mode}
                  </button>
                );
              })}
            </div>
          )}

          {/* 360 Drone Tour Button */}
          <button
            onClick={onToggleDroneTour}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              isDroneTour
                ? 'bg-[#1976d2] text-white border-[#1976d2] shadow-xs'
                : isHologramVibration
                ? 'bg-[#0f172a] hover:bg-[#1e293b] text-[#94a3b8] border-[#1e293b]'
                : 'bg-white hover:bg-[#edf4ff] text-[#64748b] border-[#d8e6ff]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>360° TOUR</span>
          </button>

          {/* Reset Camera View Button */}
          <button
            onClick={onResetCamera}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              isHologramVibration
                ? 'bg-[#0f172a] hover:bg-[#1e293b] text-[#94a3b8] border-[#1e293b]'
                : 'bg-white hover:bg-[#edf4ff] text-[#64748b] border-[#d8e6ff]'
            }`}
            title="Reset View to Overview"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET</span>
          </button>

          {/* UTC Clock Display */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold ${
            isHologramVibration
              ? 'bg-[#0f172a] border-[#1e293b] text-[#38bdf8]'
              : 'bg-[#edf4ff] border-[#d8e6ff] text-[#0f172a]'
          }`}>
            <Clock className="w-3.5 h-3.5 text-[#1976d2]" />
            <span>{timeUtc} UTC</span>
          </div>
        </div>
      </div>

      {/* 2. Secondary Sub-Bar with KPIs (Visible in Normal Mode) */}
      {!isHologramVibration && (
        <div className="bg-white/80 backdrop-blur-md border-b border-[#edf4ff] px-5 py-1.5 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider">
              REALISTIC INDUSTRIAL CAMPUS • DAYLIGHT TWIN
            </span>
          </div>

          {/* KPI Mini-Cards */}
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="text-[#64748b]">Plant Health:</span>
              <span className="font-extrabold text-emerald-600">
                {overallHealth}% Excellent
              </span>
            </div>

            <div className="w-px h-3 bg-[#cbd5e1]" />

            <div className="flex items-center gap-1.5">
              <span className="text-[#64748b]">OEE:</span>
              <span className="font-extrabold text-[#0f172a]">85.6%</span>
            </div>

            <div className="w-px h-3 bg-[#cbd5e1]" />

            <div className="flex items-center gap-1.5">
              <span className="text-[#64748b]">Production Rate:</span>
              <span className="font-extrabold text-[#0f172a]">
                1,245 u/h <span className="text-emerald-600 text-[10px]">(+38)</span>
              </span>
            </div>

            <div className="w-px h-3 bg-[#cbd5e1]" />

            <div className="flex items-center gap-1.5">
              <span className="text-[#64748b]">Active Assets:</span>
              <span className="font-extrabold text-[#0f172a]">246 / 258</span>
            </div>

            <div className="w-px h-3 bg-[#cbd5e1]" />

            <div className="flex items-center gap-1.5">
              <span className="text-[#64748b]">Energy:</span>
              <span className="font-extrabold text-[#0f172a]">24.8 MW</span>
            </div>

            <div className="w-px h-3 bg-[#cbd5e1]" />

            <div className="flex items-center gap-1.5">
              <span className="text-[#64748b]">Alerts:</span>
              <span className="font-extrabold text-rose-600">3 Crit</span>
              <span className="text-[#64748b]">/</span>
              <span className="font-extrabold text-amber-600">12 Warn</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

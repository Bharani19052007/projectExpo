import React from 'react';
import {
  Activity,
  Zap,
  Sliders,
  Sparkles,
  Waves,
  Eye,
  Radio,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Flame,
  X
} from 'lucide-react';

export default function HologramVibrationHUD({
  activeMetric = 'velocity',
  onChangeMetric,
  amplitudeScale = 1.0,
  onChangeAmplitudeScale,
  onExitHologram,
}) {
  const metrics = [
    { id: 'velocity', label: 'Velocity RMS', unit: 'mm/s' },
    { id: 'acceleration', label: 'Acceleration Peak', unit: 'g-pk' },
    { id: 'envelope', label: 'Demodulated Envelope', unit: 'gE' },
  ];

  return (
    <aside className="absolute top-[108px] left-1/2 -translate-x-1/2 z-40 pointer-events-auto select-none font-sans w-[820px] max-w-[94vw] animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="bg-[#020617]/90 backdrop-blur-xl border border-[#00c2ff]/50 rounded-2xl p-4 shadow-2xl text-white shadow-[#00c2ff]/10 flex flex-col gap-3">
        {/* Top Header Row */}
        <div className="flex items-center justify-between border-b border-[#1e293b] pb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#00c2ff]/15 border border-[#00c2ff]/40 text-[#00c2ff] animate-pulse">
              <Waves className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-wider text-white uppercase">
                  HOLOGRAM VIBRATION TWIN & FFT HARMONICS
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  LIVE 1000 Hz SAMPLING
                </span>
              </div>
              <span className="text-[10px] text-[#94a3b8]">
                Real-time 3D Tri-Axial Machine Harmonics • ISO 10816-3 Severity Zones
              </span>
            </div>
          </div>

          <button
            onClick={onExitHologram}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-all"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Return to Realistic View</span>
          </button>
        </div>

        {/* Controls & Scales Row */}
        <div className="grid grid-cols-12 gap-3 items-center">
          {/* 1. Metric Selector Tabs (5 cols) */}
          <div className="col-span-5 flex gap-1.5 p-1 bg-[#0f172a] rounded-xl border border-[#1e293b]">
            {metrics.map((m) => (
              <button
                key={m.id}
                onClick={() => onChangeMetric?.(m.id)}
                className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold transition-all ${
                  activeMetric === m.id
                    ? 'bg-[#00c2ff] text-[#020617] shadow-sm'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* 2. ISO 10816-3 Severity Legend (4 cols) */}
          <div className="col-span-4 flex items-center justify-between text-[9px] font-mono font-bold bg-[#0f172a] px-2.5 py-1.5 rounded-xl border border-[#1e293b]">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              &lt;1.8 (Good)
            </span>
            <span className="flex items-center gap-1 text-[#00c2ff]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00c2ff]" />
              1.8-2.8
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              2.8-4.5
            </span>
            <span className="flex items-center gap-1 text-rose-500">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              &gt;4.5 (Alert)
            </span>
          </div>

          {/* 3. Amplitude Scale Slider (3 cols) */}
          <div className="col-span-3 flex items-center gap-2 bg-[#0f172a] px-2.5 py-1.5 rounded-xl border border-[#1e293b]">
            <span className="text-[10px] text-[#94a3b8] font-bold shrink-0">
              Scale: {amplitudeScale.toFixed(1)}x
            </span>
            <input
              type="range"
              min="0.5"
              max="3.5"
              step="0.1"
              value={amplitudeScale}
              onChange={(e) => onChangeAmplitudeScale?.(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-[#1e293b] rounded-lg appearance-none cursor-pointer accent-[#00c2ff]"
            />
          </div>
        </div>
      </div>
    </aside>
  );
}

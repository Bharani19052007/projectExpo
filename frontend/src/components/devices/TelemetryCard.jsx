import React from 'react';

export default function TelemetryCard({ title, value, unit, icon: Icon, color = 'blue' }) {
  const colorMap = {
    blue: 'text-[#38bdf8] bg-[#38bdf8]/10 border-[#38bdf8]/20',
    emerald: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    amber: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    rose: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
    slate: 'text-slate-300 bg-slate-300/10 border-slate-400/20',
  };

  const theme = colorMap[color] || colorMap.blue;

  return (
    <div className={`flex items-center justify-between p-3 rounded-xl border ${theme} backdrop-blur-md`}>
      <div className="flex items-center gap-3">
        {Icon && <Icon className="w-5 h-5 opacity-80" />}
        <span className="text-xs font-semibold uppercase tracking-wider opacity-80">{title}</span>
      </div>
      <div className="font-mono font-bold">
        <span className="text-lg">
          {value !== null && value !== undefined ? value : 'N/A'}
        </span>
        {unit && value !== null && value !== undefined && (
          <span className="text-xs ml-1 opacity-70">{unit}</span>
        )}
      </div>
    </div>
  );
}

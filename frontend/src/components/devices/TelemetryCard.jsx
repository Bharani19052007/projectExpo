import React from 'react';

export default function TelemetryCard({ title, value, unit, icon: Icon, color = 'blue', subtext, tooltip }) {
  const colorMap = {
    blue: 'text-[#38bdf8] bg-[#38bdf8]/10 border-[#38bdf8]/20',
    emerald: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    amber: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    rose: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
    slate: 'text-slate-300 bg-slate-300/10 border-slate-400/20',
  };

  const theme = colorMap[color] || colorMap.blue;

  return (
    <div className={`flex flex-col justify-between p-3 rounded-xl border ${theme} backdrop-blur-md relative group`} title={tooltip}>
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2.5">
          {Icon && <Icon className="w-4 h-4 opacity-80 shrink-0" />}
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-85">{title}</span>
        </div>
        <div className="font-mono font-bold flex items-baseline">
          <span className="text-sm">{value}</span>
          {unit && <span className="text-[9px] ml-0.5 opacity-70">{unit}</span>}
        </div>
      </div>
      {subtext && (
        <div className="text-[9px] text-right font-mono opacity-60 mt-1">
          {subtext}
        </div>
      )}
    </div>
  );
}

import React from 'react';

export default function DeviceStatusBadge({ status }) {
  const statusConfig = {
    normal: { color: 'bg-emerald-500', text: 'text-emerald-400', label: 'NORMAL' },
    warning: { color: 'bg-amber-500', text: 'text-amber-400', label: 'WARNING' },
    critical: { color: 'bg-rose-500', text: 'text-rose-400', label: 'CRITICAL' },
    offline: { color: 'bg-slate-500', text: 'text-slate-400', label: 'OFFLINE' },
  };

  const config = statusConfig[status?.toLowerCase()] || statusConfig.offline;

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 shadow-inner w-fit`}>
      <div className={`w-2 h-2 rounded-full ${config.color} animate-pulse`} />
      <span className={`text-[10px] font-bold tracking-wider ${config.text}`}>
        {config.label}
      </span>
    </div>
  );
}

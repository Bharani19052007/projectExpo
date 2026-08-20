import React from 'react';

export default function LaptopAlerts({ telemetry }) {
  return (
    <div className="bg-[#0a0f1d]/60 border border-[#1e293b] rounded-2xl p-4 backdrop-blur-md h-full">
      <h3 className="text-sm font-bold text-slate-300 uppercase mb-3">Alerts & Logs</h3>
      <div className="text-slate-400 text-xs">
        No active alerts.
      </div>
    </div>
  );
}

import React from 'react';

export default function LaptopTelemetryPanel({ telemetry }) {
  return (
    <div className="bg-[#0a0f1d]/60 border border-[#1e293b] rounded-2xl p-4 backdrop-blur-md h-full">
      <h3 className="text-sm font-bold text-slate-300 uppercase mb-3">Telemetry Data</h3>
      <div className="text-slate-400 text-xs">
        {telemetry ? 'Telemetry active' : 'No telemetry data available'}
      </div>
    </div>
  );
}

import React from 'react';
import {
  BrainCircuit,
  ShieldAlert,
  AlertTriangle,
  Clock,
  Wrench,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import {
  topRiskPredictions,
  initialAlarms,
  initialWorkOrders,
} from '../../data/plantAssetsData';

export default function RightIntelligencePanel({
  onSelectAsset,
  onResolveAlarm,
  onCreateWorkOrder,
}) {
  return (
    <aside className="absolute top-[108px] right-3.5 bottom-28 w-[300px] z-30 pointer-events-auto select-none font-sans flex flex-col gap-3">
      {/* 1. AI INTELLIGENCE & HEALTH GAUGE */}
      <div className="glass-card-white rounded-2xl p-3.5 shadow-md border border-[#d8e6ff]">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#edf4ff]">
          <h2 className="text-xs font-bold font-sans tracking-wide text-[#0f172a] uppercase flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#1976d2]" />
            AI INTELLIGENCE
          </h2>
        </div>

        {/* AI Health Score Donut Gauge */}
        <div className="flex items-center justify-between py-1 mb-2">
          <div className="flex items-center gap-1.5 text-xs text-[#64748b] font-medium">
            <BrainCircuit className="w-4 h-4 text-[#1976d2]" />
            <span>AI Health Score</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full border-4 border-emerald-500 flex items-center justify-center font-extrabold text-sm text-[#0f172a] shadow-xs">
              88
            </div>
            <span className="text-xs font-bold text-emerald-600">Good</span>
          </div>
        </div>

        {/* Top Risk Predictions List */}
        <div className="space-y-2 pt-1 border-t border-[#edf4ff]">
          <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">
            TOP RISK PREDICTIONS
          </span>

          {topRiskPredictions.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectAsset?.(item.id)}
              className="p-2 rounded-xl bg-white hover:bg-[#f8faff] border border-[#edf4ff] transition-all cursor-pointer flex items-center justify-between shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: item.riskColor }}
                />
                <div>
                  <div className="text-xs font-bold text-[#0f172a]">
                    {item.name}
                  </div>
                  <div className="text-[10px] text-[#64748b]">
                    RUL: {item.rulDays} days
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                  style={{
                    color: item.riskColor,
                    backgroundColor: `${item.riskColor}15`,
                    border: `1px solid ${item.riskColor}30`,
                  }}
                >
                  Risk: {item.riskLevel}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. RECENT ALERTS */}
      <div className="glass-card-white rounded-2xl p-3.5 shadow-md border border-[#d8e6ff]">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#edf4ff]">
          <h2 className="text-xs font-bold font-sans tracking-wide text-[#0f172a] uppercase flex items-center gap-1.5">
            <span className="w-1.5 h-3.5 bg-[#dc2626] rounded-full" />
            RECENT ALERTS
          </h2>
        </div>

        <div className="space-y-2">
          {initialAlarms.map((alm) => (
            <div
              key={alm.id}
              onClick={() => onSelectAsset?.(alm.assetId)}
              className="p-2 rounded-xl bg-white hover:bg-[#fff5f5] border border-[#fecaca]/50 transition-all cursor-pointer flex items-center justify-between shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md bg-[#fee2e2] text-[#dc2626]">
                  <AlertTriangle className="w-3 h-3" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0f172a]">
                    {alm.title}
                  </div>
                  <div className="text-[10px] text-[#64748b]">
                    {alm.assetName}
                  </div>
                </div>
              </div>

              <span className="text-[10px] font-medium text-[#64748b]">
                {alm.timeAgo}
              </span>
            </div>
          ))}
        </div>

        <button className="w-full mt-2 pt-1 text-center text-[11px] font-bold text-[#1976d2] hover:underline flex items-center justify-center gap-1">
          <span>View All Alerts</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* 3. MAINTENANCE SCHEDULE */}
      <div className="glass-card-white rounded-2xl p-3.5 shadow-md border border-[#d8e6ff] flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#edf4ff]">
          <h2 className="text-xs font-bold font-sans tracking-wide text-[#0f172a] uppercase flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-[#1976d2]" />
            MAINTENANCE SCHEDULE
          </h2>
        </div>

        <div className="space-y-2 overflow-y-auto custom-scrollbar flex-1 pr-0.5">
          {initialWorkOrders.map((wo) => (
            <div
              key={wo.id}
              onClick={() => onSelectAsset?.(wo.assetId)}
              className="p-2 rounded-xl bg-white hover:bg-[#f8faff] border border-[#edf4ff] transition-all cursor-pointer flex items-center justify-between shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md bg-[#edf4ff] text-[#1976d2]">
                  <Wrench className="w-3 h-3" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0f172a]">
                    {wo.assetName}
                  </div>
                  <div className="text-[10px] text-[#64748b]">{wo.task}</div>
                </div>
              </div>

              <span className="text-[10px] font-bold text-[#1976d2] bg-[#edf4ff] px-1.5 py-0.5 rounded border border-[#d8e6ff]">
                {wo.dueDate}
              </span>
            </div>
          ))}
        </div>

        <button className="w-full mt-2 pt-1 text-center text-[11px] font-bold text-[#1976d2] hover:underline flex items-center justify-center gap-1">
          <span>View All Work Orders</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </aside>
  );
}

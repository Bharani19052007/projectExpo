import React, { useState } from 'react';
import {
  BrainCircuit,
  Sparkles,
  AlertTriangle,
  Info,
  ShieldAlert,
  Send,
  Wrench,
  CheckCircle2
} from 'lucide-react';

export default function RightIntelligencePanel({
  alarms = [],
  workOrders = [],
  selectedAsset,
  onSelectAsset,
  onResolveAlarm,
  onCreateWorkOrder,
}) {
  const [activeTab, setActiveTab] = useState('ALERTS'); // 'ALERTS' | 'COPILOT' | 'ORDERS'
  const [copilotInput, setCopilotInput] = useState('');
  const [copilotHistory, setCopilotHistory] = useState([
    {
      sender: 'AI',
      text: 'TwinMind Neural Engine online. Real-time telemetry synchronized across 28 industrial plant assets. High-risk harmonic resonance active on COMP-SCREW-01 (Bearing cage micro-fatigue). Suggested action: Derate RPM by 15% and schedule inspection.',
      timestamp: '07:18:24',
    },
  ]);

  const plantSummaryKPIs = [
    { label: 'Health', value: '95.2%', percent: 95.2, color: '#00b8ff' },
    { label: 'Utilization', value: '78.6%', percent: 78.6, color: '#1e88e5' },
    { label: 'Efficiency', value: '91.3%', percent: 91.3, color: '#42a5f5' },
    { label: 'OEE', value: '89.4%', percent: 89.4, color: '#0284c7' },
  ];

  const handleSendPrompt = (e) => {
    e?.preventDefault();
    if (!copilotInput.trim()) return;

    const userMsg = copilotInput.trim();
    setCopilotHistory((prev) => [
      ...prev,
      {
        sender: 'USER',
        text: userMsg,
        timestamp: new Date().toTimeString().substring(0, 8),
      },
    ]);
    setCopilotInput('');

    setTimeout(() => {
      let aiResponse = `Analyzing "${userMsg}" across live facility telemetry...`;
      if (userMsg.toLowerCase().includes('compressor') || userMsg.toLowerCase().includes('comp')) {
        aiResponse =
          'COMP-SCREW-01 vibration is 6.8 mm/s RMS (threshold: 4.5 mm/s). AI diagnosis: Bearing cage micro-fatigue. Prescriptive recommendation: Derate speed by 15% and divert load to Standby Unit B.';
      } else if (userMsg.toLowerCase().includes('reactor') || userMsg.toLowerCase().includes('temp')) {
        aiResponse =
          'REACT-CAT-01 bed temperature is stable at 196.0 °C. Quench hydrogen flow is optimal at 42.0 m³/h. Thermal profile nominal.';
      } else {
        aiResponse =
          'Overall plant health is 95.2%. 1 Critical anomaly (COMP-SCREW-01), 1 Warning (ROB-WELD-01). Power grid and cooling utilities are nominal.';
      }

      setCopilotHistory((prev) => [
        ...prev,
        {
          sender: 'AI',
          text: aiResponse,
          timestamp: new Date().toTimeString().substring(0, 8),
        },
      ]);
    }, 500);
  };

  return (
    <div className="absolute top-20 right-3.5 bottom-24 w-[340px] z-20 pointer-events-auto flex flex-col gap-3 overflow-y-auto custom-scrollbar pl-1 select-none">
      {/* ======================================================== */}
      {/* 1. AI PREDICTIVE INTELLIGENCE CARD */}
      {/* ======================================================== */}
      <div className="glass-card-white rounded-2xl p-4 shadow-sm border border-[#d8e6ff] flex-1 flex flex-col min-h-[360px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#edf4ff] text-[#1e88e5]">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <h2 className="text-xs font-bold font-sans tracking-wide text-[#1e293b] uppercase">
              AI PREDICTIVE INTELLIGENCE
            </h2>
          </div>
          <span className="text-[10px] font-bold text-[#15803d] bg-[#dcfce7] px-2 py-0.5 rounded-full border border-[#bbf7d0] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#16a34a]" />
            NEURAL 99.4%
          </span>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-[#edf4ff] p-1 rounded-xl border border-[#d8e6ff] mb-3">
          <button
            onClick={() => setActiveTab('ALERTS')}
            className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'ALERTS'
                ? 'bg-white text-[#1e88e5] shadow-xs'
                : 'text-[#64748b] hover:text-[#1e293b]'
            }`}
          >
            Alerts ({alarms.length || 4})
          </button>
          <button
            onClick={() => setActiveTab('COPILOT')}
            className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'COPILOT'
                ? 'bg-white text-[#1e88e5] shadow-xs'
                : 'text-[#64748b] hover:text-[#1e293b]'
            }`}
          >
            AI Copilot
          </button>
          <button
            onClick={() => setActiveTab('ORDERS')}
            className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'ORDERS'
                ? 'bg-white text-[#1e88e5] shadow-xs'
                : 'text-[#64748b] hover:text-[#1e293b]'
            }`}
          >
            Orders ({workOrders.length || 3})
          </button>
        </div>

        {/* Tab 1: Live Alert Feed */}
        {activeTab === 'ALERTS' && (
          <div className="space-y-2.5 overflow-y-auto custom-scrollbar flex-1 pr-0.5">
            {/* Top High-Risk Prediction Banner */}
            <div className="rounded-xl p-3 bg-[#fff5f5] border border-[#fecaca] shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#b91c1c]">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#ef4444]" />
                  HIGH-RISK PREDICTION
                </span>
                <span className="text-[9px] font-bold bg-[#fee2e2] text-[#b91c1c] px-1.5 py-0.5 rounded border border-[#fca5a5]">
                  RUL: 48h
                </span>
              </div>
              <p className="text-[11px] font-sans text-[#475569] leading-relaxed">
                <strong className="text-[#1e293b]">COMP-SCREW-01:</strong> Harmonic frequency spike indicates bearing cage micro-fatigue. Expected failure in 48 hours without intervention.
              </p>
              <div className="flex items-center justify-end gap-2 mt-2.5 pt-2 border-t border-[#fee2e2]">
                <button
                  onClick={() => onSelectAsset?.('COMP-SCREW-01')}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-[#1e88e5] hover:bg-[#edf4ff] transition-all"
                >
                  Inspect 3D
                </button>
                <button
                  onClick={() => onResolveAlarm?.('ALM-001')}
                  className="px-3 py-1 rounded-lg text-[11px] font-bold bg-[#dcfce7] hover:bg-[#bbf7d0] text-[#15803d] border border-[#86efac] shadow-xs transition-all"
                >
                  Apply AI Fix
                </button>
              </div>
            </div>

            {/* Warning Alert: ROB-WELD-01 */}
            <div className="rounded-xl p-3 bg-white border border-[#fef3c7] hover:border-[#fde68a] transition-all">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[9px] font-bold uppercase bg-[#fef3c7] text-[#b45309] px-1.5 py-0.5 rounded border border-[#fde68a]">
                  WARNING
                </span>
                <span className="text-xs font-bold text-[#1e293b]">ROB-WELD-01</span>
              </div>
              <p className="text-[11px] font-sans text-[#475569] leading-relaxed">
                Elevated vibration harmonic at 206 Hz on Axis 3 reduction gearbox (4.6 mm/s).
              </p>
              <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-[#f8faff]">
                <button
                  onClick={() => onSelectAsset?.('ROB-WELD-01')}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-[#1e88e5] hover:bg-[#edf4ff] transition-all"
                >
                  Inspect 3D
                </button>
                <button
                  onClick={() => onResolveAlarm?.('ALM-002')}
                  className="px-3 py-1 rounded-lg text-[11px] font-bold bg-[#dcfce7] hover:bg-[#bbf7d0] text-[#15803d] border border-[#86efac] shadow-xs transition-all"
                >
                  Apply AI Fix
                </button>
              </div>
            </div>

            {/* Info Alert: TANK-CYL-01 */}
            <div className="rounded-xl p-3 bg-white border border-[#e0f2fe] hover:border-[#bae6fd] transition-all">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[9px] font-bold uppercase bg-[#e0f2fe] text-[#0369a1] px-1.5 py-0.5 rounded border border-[#bae6fd]">
                  INFO
                </span>
                <span className="text-xs font-bold text-[#1e293b]">TANK-CYL-01</span>
              </div>
              <p className="text-[11px] font-sans text-[#475569] leading-relaxed">
                Crude storage level reached 76.5% of gross capacity (114,750 bbl).
              </p>
              <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-[#f8faff]">
                <button
                  onClick={() => onSelectAsset?.('TANK-CYL-01')}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-[#1e88e5] hover:bg-[#edf4ff] transition-all"
                >
                  Inspect 3D
                </button>
                <button
                  onClick={() => onResolveAlarm?.('ALM-003')}
                  className="px-3 py-1 rounded-lg text-[11px] font-bold bg-[#dcfce7] hover:bg-[#bbf7d0] text-[#15803d] border border-[#86efac] shadow-xs transition-all"
                >
                  Apply AI Fix
                </button>
              </div>
            </div>

            {/* Info Alert: SUB-XFRM-01 */}
            <div className="rounded-xl p-3 bg-white border border-[#e0f2fe] hover:border-[#bae6fd] transition-all">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[9px] font-bold uppercase bg-[#e0f2fe] text-[#0369a1] px-1.5 py-0.5 rounded border border-[#bae6fd]">
                  INFO
                </span>
                <span className="text-xs font-bold text-[#1e293b]">SUB-XFRM-01</span>
              </div>
              <p className="text-[11px] font-sans text-[#475569] leading-relaxed">
                Transformer load shifted: active draw 8.4 MVA (21.0% capacity).
              </p>
              <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-[#f8faff]">
                <button
                  onClick={() => onSelectAsset?.('SUB-XFRM-01')}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-[#1e88e5] hover:bg-[#edf4ff] transition-all"
                >
                  Inspect 3D
                </button>
                <button
                  onClick={() => onResolveAlarm?.('ALM-004')}
                  className="px-3 py-1 rounded-lg text-[11px] font-bold bg-[#dcfce7] hover:bg-[#bbf7d0] text-[#15803d] border border-[#86efac] shadow-xs transition-all"
                >
                  Apply AI Fix
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: AI Copilot Feed */}
        {activeTab === 'COPILOT' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-2 space-y-2.5 custom-scrollbar">
              {copilotHistory.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    item.sender === 'USER' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div className="text-[10px] font-semibold text-[#94a3b8] mb-1">
                    {item.sender === 'AI' ? 'TwinMind AI' : 'Operator'} • {item.timestamp}
                  </div>
                  <div
                    className={`p-2.5 rounded-xl text-xs leading-relaxed max-w-[90%] ${
                      item.sender === 'USER'
                        ? 'bg-[#1e88e5] text-white rounded-br-none'
                        : 'bg-[#f8faff] text-[#1e293b] border border-[#d8e6ff] rounded-bl-none'
                    }`}
                  >
                    {item.text}
                  </div>
                </div>
              ))}
            </div>

            <form
              onSubmit={handleSendPrompt}
              className="p-2 border-t border-[#edf4ff] flex items-center gap-1.5"
            >
              <input
                type="text"
                placeholder="Ask TwinMind Copilot..."
                value={copilotInput}
                onChange={(e) => setCopilotInput(e.target.value)}
                className="flex-1 bg-[#f8faff] border border-[#d8e6ff] rounded-xl px-3 py-1.5 text-xs text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:border-[#1e88e5]"
              />
              <button
                type="submit"
                className="p-2 bg-[#1e88e5] hover:bg-[#1565c0] text-white rounded-xl shadow-xs transition-all"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        {/* Tab 3: Maintenance Orders */}
        {activeTab === 'ORDERS' && (
          <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar p-1">
            {workOrders.map((wo) => (
              <div
                key={wo.id}
                className="p-2.5 rounded-xl bg-[#f8faff] border border-[#d8e6ff] space-y-1 text-xs"
              >
                <div className="flex justify-between items-center font-bold text-[#1e293b]">
                  <span>{wo.id}</span>
                  <span className="text-[9px] bg-[#dbeafe] text-[#1e88e5] px-1.5 py-0.5 rounded">
                    {wo.priority}
                  </span>
                </div>
                <div className="text-[#475569]">{wo.title}</div>
                <div className="text-[10px] text-[#94a3b8] pt-1 flex justify-between">
                  <span>Asset: {wo.assetId}</span>
                  <span>Assigned: {wo.assignedTo}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 2. PLANT SUMMARY CARD (4 CIRCULAR DONUTS) */}
      {/* ======================================================== */}
      <div className="glass-card-white rounded-2xl p-4 shadow-sm border border-[#d8e6ff]">
        <h2 className="text-xs font-bold font-sans tracking-wide text-[#1e293b] uppercase mb-3 flex items-center gap-1.5">
          <span className="w-1.5 h-3.5 bg-[#1e88e5] rounded-full" />
          PLANT SUMMARY
        </h2>

        <div className="grid grid-cols-4 gap-2 text-center">
          {plantSummaryKPIs.map((kpi, idx) => {
            const radius = 20;
            const circumference = 2 * Math.PI * radius;
            const strokeDashoffset =
              circumference - (kpi.percent / 100) * circumference;

            return (
              <div key={idx} className="flex flex-col items-center">
                <div className="relative w-13 h-13 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 50 50">
                    <circle
                      cx="25"
                      cy="25"
                      r={radius}
                      stroke="#edf4ff"
                      strokeWidth="4"
                      fill="transparent"
                    />
                    <circle
                      cx="25"
                      cy="25"
                      r={radius}
                      stroke={kpi.color}
                      strokeWidth="4"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                      style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-bold font-sans text-[#1e293b]">
                      {kpi.value}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-[#64748b] mt-1">
                  {kpi.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

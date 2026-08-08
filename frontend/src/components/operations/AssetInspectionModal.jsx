import React, { useState } from 'react';
import {
  X,
  Activity,
  BrainCircuit,
  Sliders,
  FileText,
  ShieldAlert,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Wrench
} from 'lucide-react';

export default function AssetInspectionModal({
  asset,
  onClose,
  onUpdateSetpoint,
  onTriggerLocalEStop,
  onCalibrateSensors,
  onCreateWorkOrder,
}) {
  const [activeTab, setActiveTab] = useState('TELEMETRY');
  const [targetSetpoint, setTargetSetpoint] = useState(
    asset?.primaryMetric?.value || 100
  );
  const [isCalibrating, setIsCalibrating] = useState(false);

  if (!asset) return null;

  const isCritical = asset.status === 'CRITICAL' || asset.status === 'EMERGENCY';
  const isWarning = asset.status === 'WARNING' || asset.status === 'DEGRADED';

  const handleCalibrate = () => {
    setIsCalibrating(true);
    setTimeout(() => {
      setIsCalibrating(false);
      onCalibrateSensors?.(asset.id);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto flex items-center justify-end p-4 bg-slate-900/30 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Main White Glassmorphism Modal */}
      <div className="w-full max-w-2xl h-[90vh] glass-card-white rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300 border border-[#d8e6ff]">
        {/* Header Bar */}
        <div className="p-4 border-b border-[#edf4ff] bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                isCritical ? 'bg-[#ef4444]' : isWarning ? 'bg-[#f59e0b]' : 'bg-[#22c55e]'
              }`}
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold font-sans text-[#1e293b] tracking-tight">
                  {asset.name}
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#edf4ff] text-[#1e88e5] border border-[#d8e6ff]">
                  {asset.tag || asset.id}
                </span>
              </div>
              <div className="text-xs font-sans text-[#64748b] mt-0.5">
                {asset.category} • Zone: {asset.zone || 'Refinery Complex'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right font-sans">
              <div className="text-[10px] text-[#94a3b8] uppercase font-semibold">Health Score</div>
              <div
                className={`text-sm font-bold ${
                  isCritical ? 'text-[#ef4444]' : isWarning ? 'text-[#f59e0b]' : 'text-[#1e88e5]'
                }`}
              >
                {asset.healthScore}%
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#f8faff] hover:bg-[#edf4ff] text-[#64748b] hover:text-[#1e293b] border border-[#d8e6ff] transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-4 gap-1 p-2 bg-[#f8faff] border-b border-[#edf4ff]">
          {[
            { id: 'TELEMETRY', label: 'TELEMETRY', icon: Activity },
            { id: 'AI_PREDICT', label: 'AI DIAGNOSTIC', icon: BrainCircuit },
            { id: 'CONTROLS', label: 'CONTROLS', icon: Sliders },
            { id: 'SPECS', label: 'EQUIPMENT', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-white text-[#1e88e5] shadow-xs border border-[#d8e6ff]'
                    : 'text-[#64748b] hover:text-[#1e293b]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-white">
          {/* 1. Telemetry */}
          {activeTab === 'TELEMETRY' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {asset.sensors?.map((sensor, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[#f8faff] rounded-xl space-y-2 border border-[#e8f1ff]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#475569]">
                        {sensor.name}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          sensor.status === 'CRITICAL'
                            ? 'bg-[#fee2e2] text-[#b91c1c]'
                            : sensor.status === 'WARNING'
                            ? 'bg-[#fef3c7] text-[#b45309]'
                            : 'bg-[#dcfce7] text-[#15803d]'
                        }`}
                      >
                        {sensor.status || 'NORMAL'}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-black text-[#1e293b]">
                        {sensor.value}
                      </span>
                      <span className="text-xs font-medium text-[#64748b]">{sensor.unit}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] font-mono text-[#94a3b8]">
                        <span>Min: {sensor.min || 0}</span>
                        <span>Max: {sensor.max || 100}</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#e2edff] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#1e88e5]"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(
                                10,
                                (((sensor.value || 50) - (sensor.min || 0)) /
                                  ((sensor.max || 100) - (sensor.min || 0))) *
                                  100
                              )
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Time Series Real-Time Waveform */}
              <div className="p-4 bg-[#f8faff] rounded-xl space-y-2 border border-[#e8f1ff]">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#1e293b]">REAL-TIME OSCILLATION BUFFER (20s)</span>
                  <span className="text-[#1e88e5]">100Hz SAMPLING</span>
                </div>

                <div className="h-28 w-full bg-white rounded-xl p-2 flex items-center justify-center relative overflow-hidden border border-[#d8e6ff]">
                  <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 40">
                    <defs>
                      <linearGradient id="modalLightWave" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1e88e5" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#1e88e5" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <line x1="0" y1="10" x2="100" y2="10" stroke="#e2edff" strokeWidth="0.8" strokeDasharray="2 2" />
                    <line x1="0" y1="20" x2="100" y2="20" stroke="#e2edff" strokeWidth="0.8" strokeDasharray="2 2" />
                    <line x1="0" y1="30" x2="100" y2="30" stroke="#e2edff" strokeWidth="0.8" strokeDasharray="2 2" />
                    <path
                      d="M 0 20 Q 10 8, 20 20 T 40 20 T 60 14 T 80 26 T 100 20 L 100 40 L 0 40 Z"
                      fill="url(#modalLightWave)"
                    />
                    <path
                      d="M 0 20 Q 10 8, 20 20 T 40 20 T 60 14 T 80 26 T 100 20"
                      fill="none"
                      stroke="#1e88e5"
                      strokeWidth="1.8"
                    />
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* 2. AI Diagnostics */}
          {activeTab === 'AI_PREDICT' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-[#d8e6ff] bg-[#f8faff]">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs font-bold text-[#1e293b]">
                    <BrainCircuit className="w-4 h-4 text-[#1e88e5]" />
                    PREDICTIVE FAILURE RISK
                  </span>
                  <span className="text-sm font-black text-[#dc2626]">
                    {asset.anomalyProbability || 12}% RISK
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 font-sans">
                  <div className="bg-white p-2.5 rounded-lg border border-[#e2edff]">
                    <div className="text-[10px] text-[#64748b]">Remaining Useful Life</div>
                    <div className="text-sm font-bold text-[#1e88e5]">
                      {asset.rul || '2,400 hours'}
                    </div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-[#e2edff]">
                    <div className="text-[10px] text-[#64748b]">AI Confidence</div>
                    <div className="text-sm font-bold text-[#15803d]">99.2%</div>
                  </div>
                </div>
              </div>

              {/* Prescriptive Recommendations */}
              <div className="p-4 rounded-xl border border-[#d8e6ff] bg-[#f8faff] space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#1e88e5] uppercase">
                  <Sparkles className="w-4 h-4" />
                  AI Prescriptive Recommendations
                </div>

                <div className="space-y-2 text-xs text-[#334155]">
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-white border border-[#e2edff]">
                    <CheckCircle2 className="w-4 h-4 text-[#16a34a] shrink-0 mt-0.5" />
                    <span>Schedule ultrasonic acoustic scan during upcoming Alpha shift.</span>
                  </div>
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-white border border-[#e2edff]">
                    <CheckCircle2 className="w-4 h-4 text-[#16a34a] shrink-0 mt-0.5" />
                    <span>Verify lubrication oil viscosity and particle contamination filter.</span>
                  </div>
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-white border border-[#e2edff]">
                    <CheckCircle2 className="w-4 h-4 text-[#16a34a] shrink-0 mt-0.5" />
                    <span>Auto-derate operational setpoint by 10% if temperature exceeds threshold.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. Controls */}
          {activeTab === 'CONTROLS' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#f8faff] border border-[#d8e6ff] rounded-xl space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-[#1e293b]">
                  <span>OPERATIONAL SETPOINT TARGET</span>
                  <span className="text-[#1e88e5]">
                    {targetSetpoint} {asset.primaryMetric?.unit || 'RPM'}
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="5000"
                  value={targetSetpoint}
                  onChange={(e) => setTargetSetpoint(Number(e.target.value))}
                  className="w-full accent-[#1e88e5] cursor-pointer"
                />

                <div className="flex justify-end">
                  <button
                    onClick={() => onUpdateSetpoint?.(asset.id, targetSetpoint)}
                    className="px-4 py-2 bg-[#1e88e5] hover:bg-[#1565c0] text-white text-xs font-bold rounded-xl shadow-xs transition-all"
                  >
                    Apply New Setpoint
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleCalibrate}
                  disabled={isCalibrating}
                  className="p-3 bg-[#f8faff] hover:bg-white border border-[#d8e6ff] rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-[#1e293b] transition-all"
                >
                  <RotateCcw className={`w-4 h-4 text-[#1e88e5] ${isCalibrating ? 'animate-spin' : ''}`} />
                  {isCalibrating ? 'Calibrating...' : 'Recalibrate IIoT Sensors'}
                </button>

                <button
                  onClick={() =>
                    onCreateWorkOrder?.({
                      id: `WO-${Date.now().toString().slice(-4)}`,
                      assetId: asset.id,
                      title: `Inspection for ${asset.name}`,
                      priority: isCritical ? 'CRITICAL' : 'MEDIUM',
                      assignedTo: 'Crew Alpha',
                    })
                  }
                  className="p-3 bg-[#f8faff] hover:bg-white border border-[#d8e6ff] rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-[#1e293b] transition-all"
                >
                  <Wrench className="w-4 h-4 text-[#d97706]" />
                  Dispatch Work Order
                </button>
              </div>

              {/* Local E-Stop */}
              <div className="p-4 bg-[#fff5f5] border border-[#fecaca] rounded-xl space-y-2">
                <div className="text-xs font-bold text-[#b91c1c] flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" />
                  LOCAL EMERGENCY ISOLATION
                </div>
                <p className="text-xs text-[#475569]">
                  Immediately trip safety interlocks, de-energize drive motors, and isolate suction/discharge valves.
                </p>
                <button
                  onClick={() => onTriggerLocalEStop?.(asset.id)}
                  className="w-full py-2.5 bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs font-bold rounded-xl shadow-xs transition-all"
                >
                  TRIP & ISOLATE ASSET
                </button>
              </div>
            </div>
          )}

          {/* 4. Specs */}
          {activeTab === 'SPECS' && (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#f8faff] border border-[#d8e6ff] rounded-xl space-y-1">
                <div className="text-[#94a3b8] uppercase text-[10px] font-semibold">Manufacturer & Model</div>
                <div className="text-[#1e293b] font-bold">
                  {asset.specs?.manufacturer || 'Siemens Energy AG'} • {asset.specs?.model || 'Industrial Series 400'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#f8faff] border border-[#d8e6ff] rounded-xl space-y-1">
                  <div className="text-[#94a3b8] uppercase text-[10px] font-semibold">Serial Number</div>
                  <div className="text-[#1e88e5] font-bold">
                    {asset.specs?.serial || 'SN-849204-DE'}
                  </div>
                </div>

                <div className="p-3 bg-[#f8faff] border border-[#d8e6ff] rounded-xl space-y-1">
                  <div className="text-[#94a3b8] uppercase text-[10px] font-semibold">P&ID Drawing</div>
                  <div className="text-[#1e88e5] font-bold">
                    {asset.specs?.pid || 'PID-104-DWG-04'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

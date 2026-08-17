import React, { useState } from 'react';
import {
  X,
  Activity,
  Shield,
  AlertTriangle,
  Clock,
  Wrench,
  Sparkles,
  ChevronRight,
  Sliders,
  Play,
  RotateCcw,
  CheckCircle2,
  Layers,
  Thermometer,
  Gauge,
  Zap,
  Settings,
  Cpu
} from 'lucide-react';

export default function AssetInspectionModal({
  asset,
  selectedComponent,
  onSelectComponent,
  onClose,
}) {
  if (!asset) return null;

  const [activeTab, setActiveTab] = useState('components'); // 'components' | 'telemetry' | 'ai' | 'controls'
  const [speedSetpoint, setSpeedSetpoint] = useState(asset.speedRpm || 1250);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [showToast, setShowToast] = useState(null);

  const activeComp =
    selectedComponent || (asset.components && asset.components[0]) || null;

  const handleCreateWO = () => {
    setShowToast(`Work order generated for ${asset.name} - ${activeComp?.name || 'Inspection'}`);
    setTimeout(() => setShowToast(null), 3500);
  };

  const handleRunCalibration = () => {
    setIsCalibrating(true);
    setTimeout(() => {
      setIsCalibrating(false);
      setShowToast(`AI self-test & calibration completed successfully for ${asset.name}`);
      setTimeout(() => setShowToast(null), 3500);
    }, 1800);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-[520px] bg-white/95 backdrop-blur-xl border-l border-[#d8e6ff] shadow-2xl z-50 flex flex-col font-sans select-none animate-in slide-in-from-right duration-250">
      {/* Toast alert */}
      {showToast && (
        <div className="absolute top-4 left-4 right-4 bg-[#0f172a] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xl border border-[#38bdf8] flex items-center gap-2 z-50 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{showToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="px-6 py-4 border-b border-[#edf4ff] flex items-center justify-between bg-[#f8faff]/80">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#edf4ff] text-[#1976d2] border border-[#d8e6ff]">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-[#0f172a]">
                {asset.name}
              </h2>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {asset.status}
              </span>
            </div>
            <p className="text-xs text-[#64748b] font-medium">
              {asset.displayName}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-xl text-[#64748b] hover:text-[#0f172a] hover:bg-[#edf4ff] transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Machine Quick Stats */}
      <div className="px-6 py-3 bg-[#edf4ff]/50 border-b border-[#edf4ff] grid grid-cols-4 gap-2 text-center text-xs">
        <div className="bg-white p-2 rounded-xl border border-[#d8e6ff]">
          <span className="text-[10px] font-bold text-[#64748b] block">HEALTH</span>
          <span className="text-sm font-extrabold text-emerald-600">
            {asset.healthScore}%
          </span>
        </div>
        <div className="bg-white p-2 rounded-xl border border-[#d8e6ff]">
          <span className="text-[10px] font-bold text-[#64748b] block">TEMP</span>
          <span className="text-sm font-extrabold text-[#0f172a]">
            {asset.temperature} {asset.tempUnit || '°C'}
          </span>
        </div>
        <div className="bg-white p-2 rounded-xl border border-[#d8e6ff]">
          <span className="text-[10px] font-bold text-[#64748b] block">VIBRATION</span>
          <span className="text-sm font-extrabold text-[#0f172a]">
            {asset.vibration} {asset.vibUnit || 'mm/s'}
          </span>
        </div>
        <div className="bg-white p-2 rounded-xl border border-[#d8e6ff]">
          <span className="text-[10px] font-bold text-[#64748b] block">AI RUL</span>
          <span className="text-sm font-extrabold text-[#1976d2]">
            {asset.rulDays}d
          </span>
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="px-6 border-b border-[#edf4ff] flex gap-4 bg-white">
        {[
          { id: 'components', label: 'Component Twins' },
          { id: 'telemetry', label: 'Sensors & Telemetry' },
          { id: 'ai', label: 'AI Diagnostics' },
          { id: 'controls', label: 'Setpoints & Actuation' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-[#1976d2] text-[#1976d2]'
                : 'border-transparent text-[#64748b] hover:text-[#0f172a]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {/* ======================================================== */}
        {/* TAB 1: COMPONENT DIGITAL TWINS */}
        {/* ======================================================== */}
        {activeTab === 'components' && (
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block mb-2">
                INTERNAL MACHINE SUB-COMPONENTS (5-LEVEL DIGITAL TWIN)
              </span>

              <div className="space-y-2">
                {asset.components?.map((comp) => {
                  const isSelected = activeComp?.id === comp.id;
                  const isWarning = comp.status === 'WARNING' || comp.aiRisk === 'MEDIUM' || comp.aiRisk === 'HIGH';

                  return (
                    <div
                      key={comp.id}
                      onClick={() => onSelectComponent?.(comp)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#edf4ff] border-[#1976d2] shadow-sm'
                          : 'bg-white hover:bg-[#f8faff] border-[#d8e6ff]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-extrabold text-[#0f172a]">
                          {comp.name}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isWarning
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {comp.health}% Health
                        </span>
                      </div>

                      <div className="text-[11px] text-[#64748b] mb-2">
                        {comp.type} • RUL: {comp.rulDays} days • Risk: {comp.aiRisk}
                      </div>

                      {/* Component Live Telemetry */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-white/70 p-2 rounded-xl border border-[#edf4ff]">
                        <div>
                          <span className="text-[#64748b]">Temp:</span>{' '}
                          <span className="font-bold text-[#0f172a]">
                            {comp.temp} °C
                          </span>
                        </div>
                        <div>
                          <span className="text-[#64748b]">Vibration:</span>{' '}
                          <span className="font-bold text-[#0f172a]">
                            {comp.vibration} mm/s
                          </span>
                        </div>
                      </div>

                      {/* AI Component Recommendation */}
                      {comp.recommendation && (
                        <div className="mt-2 text-[11px] text-[#1976d2] bg-[#edf4ff]/60 p-2 rounded-xl border border-[#d8e6ff] flex items-start gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>{comp.recommendation}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: SENSORS & TELEMETRY */}
        {/* ======================================================== */}
        {activeTab === 'telemetry' && (
          <div className="space-y-4">
            <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">
              IIOT SENSOR CHANNELS & TELEMETRY
            </span>

            <div className="space-y-2">
              {asset.sensors?.map((sensor) => (
                <div
                  key={sensor.id}
                  className="p-3 rounded-2xl bg-white border border-[#d8e6ff] flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-[#0f172a]">
                      {sensor.name}
                    </div>
                    <div className="text-[10px] font-mono text-[#64748b]">
                      {sensor.id}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-extrabold text-[#0f172a]">
                      {sensor.value} {sensor.unit}
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600">
                      {sensor.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: AI DIAGNOSTICS */}
        {/* ======================================================== */}
        {activeTab === 'ai' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#edf4ff] border border-[#d8e6ff]">
              <div className="flex items-center gap-2 mb-2 text-[#1976d2] font-bold text-xs">
                <Sparkles className="w-4 h-4" />
                <span>AI PREDICTIVE DIAGNOSIS</span>
              </div>
              <p className="text-xs text-[#0f172a] leading-relaxed">
                {asset.aiDiagnosis}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <div className="flex items-center gap-2 mb-2 text-emerald-700 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>RECOMMENDED ACTION</span>
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed">
                {asset.aiRecommendation}
              </p>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: CONTROLS & SETPOINTS */}
        {/* ======================================================== */}
        {activeTab === 'controls' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white border border-[#d8e6ff] space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[#0f172a]">Speed Setpoint</span>
                <span className="text-[#1976d2] font-mono">{speedSetpoint} RPM</span>
              </div>
              <input
                type="range"
                min="500"
                max="3000"
                step="50"
                value={speedSetpoint}
                onChange={(e) => setSpeedSetpoint(Number(e.target.value))}
                className="w-full h-2 bg-[#edf4ff] rounded-lg appearance-none cursor-pointer accent-[#1976d2]"
              />
            </div>

            <button
              onClick={handleRunCalibration}
              disabled={isCalibrating}
              className="w-full py-2.5 rounded-xl bg-[#1976d2] hover:bg-[#1565c0] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
            >
              {isCalibrating ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  <span>Calibrating Sensors & Spindle...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Run AI Self-Diagnostic Test</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-[#edf4ff] bg-[#f8faff] flex items-center gap-3">
        <button
          onClick={handleCreateWO}
          className="flex-1 py-2.5 rounded-xl bg-[#1976d2] hover:bg-[#1565c0] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
        >
          <Wrench className="w-4 h-4" />
          <span>Generate Work Order</span>
        </button>

        <button
          onClick={onClose}
          className="px-5 py-2.5 rounded-xl bg-white border border-[#d8e6ff] text-[#64748b] hover:text-[#0f172a] text-xs font-bold transition-all hover:bg-[#edf4ff]"
        >
          Close
        </button>
      </div>
    </div>
  );
}

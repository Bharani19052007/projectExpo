import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Activity, 
  Layers, 
  Flame, 
  Sparkles, 
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search, 
  Cpu, 
  Eye, 
  Wrench, 
  Clock, 
  Thermometer, 
  Gauge, 
  Zap, 
  Layers3, 
  X, 
  AlertTriangle, 
  Loader2, 
  CheckCircle2, 
  RefreshCw, 
  Library,
  Sliders,
  Play,
  RotateCcw,
  Maximize2,
  Minimize2,
  Radio,
  FileText,
  ShieldCheck,
  Power
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { allIndustrialMachines, refMachineComponentsData } from '../../data/mockData';
import { getMachineConfig } from '../../machines/index';
import { useDeviceTelemetry } from '../../services/deviceTelemetry';
import MotorViewer from '../3d/MotorViewer';

// Visual Machine Category metadata
const machineIcons = {
  'MOBILE_001': '📱',
  'MOBILE_002': '📱',
  'MOBILE_003': '📱',
  'MOBILE-TWIN-001': '📱',
  'SMARTPHONE-TWIN': '📱',
  'MOTOR-M-15': '⚡',
  'SIEM-CNC-5AXIS': '⚙️',
  'ABB-ROB-CELL-04': '🦾',
  'CLEAVER-BOILER-500': '🏭',
  'INGERSOLL-COMP-200': '💨',
  'KSB-PUMP-STATION': '💧',
  'PRESS-45T-02': '🔨',
  'SIEM-UNIT1-2026': '🔄',
  'SIEM-UNIT2-PKG': '📦',
  'BOSCH-SMART-CELL': '🧠',
  'SCHN-CONV-SORT': '🛤️',
  'KUKA-WELD-CELL': '🏎️',
};

export default function DigitalTwinPage({ 
  setActiveTab, 
  selectedMachine: propSelectedMachine, 
  onSelectMachine,
  isMachineLoading: propIsLoading,
  loadingStage: propLoadingStage,
  onSwitchMachine
}) {
  // Machine Library Dropdown & State (Fallback to local state if props omitted)
  const [localMachine, setLocalMachine] = useState(allIndustrialMachines[0]);
  const [localIsLoading, setLocalIsLoading] = useState(false);
  const [localLoadingStage, setLocalLoadingStage] = useState('');

  const selectedMachine = propSelectedMachine || localMachine || allIndustrialMachines[0];
  const isMachineLoading = propIsLoading !== undefined ? propIsLoading : localIsLoading;
  const loadingStage = propLoadingStage !== undefined ? propLoadingStage : localLoadingStage;

  // Retrieve dedicated per-machine configuration from machines registry
  const activeMachineConfig = getMachineConfig(selectedMachine.id);

  // Live Socket.IO Mobile Telemetry Stream for Connected Smartphone Twins
  const liveMobileList = useDeviceTelemetry('MOBILE', false);
  const liveMobileTelemetry = liveMobileList.find((d) => d.id === selectedMachine.id || d.id === 'MOBILE_001') || liveMobileList[0];

  // 3D Overlays & Controls
  const [viewMode, setViewMode] = useState('CAD'); // 'CAD' | 'EXPLODED' | 'THERMAL' | 'VIBRATION'
  const [selectedComponent, setSelectedComponent] = useState(null); // Default null: Clean full machine focus
  const [isInspectOpen, setIsInspectOpen] = useState(true);
  const [isDigitalTwinView, setIsDigitalTwinView] = useState(true); // Default true for Real Machine (LEFT) + Holographic Twin (RIGHT)
  const [isSimulatingFailure, setIsSimulatingFailure] = useState(false); // Default OFF
  const [treeSearch, setTreeSearch] = useState('');
  const [activeRightTab, setActiveRightTab] = useState('TELEMETRY'); // 'TELEMETRY' | 'HISTORY' | 'AI' | 'CONTROLS'
  const [explosionDistance, setExplosionDistance] = useState(1.0);
  const [toastMessage, setToastMessage] = useState(null);
  const [isCalibrating, setIsCalibrating] = useState(false);

  // Auto-reset component selection when machine changes
  useEffect(() => {
    setSelectedComponent(null);
  }, [selectedMachine.id]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Supported Digital Twin Library Machine List
  const libraryMachines = allIndustrialMachines;

  // Handle Switching Machine from selector
  const handleSwitchMachine = (machineId) => {
    const nextMachine = allIndustrialMachines.find((m) => m.id === machineId);
    if (!nextMachine || nextMachine.id === selectedMachine.id) return;

    if (onSwitchMachine) {
      onSwitchMachine(nextMachine);
      return;
    }

    setSelectedComponent(null);
    setIsSimulatingFailure(false);
    setLocalIsLoading(true);

    // Smooth Sequential Loading Transition
    setLocalLoadingStage('Loading Digital Twin Mesh...');
    setTimeout(() => {
      setLocalLoadingStage('Streaming 100Hz IoT Sensors...');
      setTimeout(() => {
        setLocalLoadingStage('Synchronizing AI Physics Model...');
        setTimeout(() => {
          setLocalMachine(nextMachine);
          if (onSelectMachine) onSelectMachine(nextMachine);
          setTimeout(() => {
            setLocalIsLoading(false);
          }, 200);
        }, 250);
      }, 250);
    }, 250);
  };

  const activeComponents = activeMachineConfig?.components || selectedMachine?.components || refMachineComponentsData;

  const filteredTree = useMemo(() => {
    return (activeComponents || []).filter((c) =>
      (c?.name || '').toLowerCase().includes(treeSearch.toLowerCase()) ||
      (c?.partNumber || '').toLowerCase().includes(treeSearch.toLowerCase()) ||
      (c?.subsystem || '').toLowerCase().includes(treeSearch.toLowerCase())
    );
  }, [activeComponents, treeSearch]);

  const handleSelectComponent = (comp) => {
    setSelectedComponent(comp);
    if (!isInspectOpen) {
      setIsInspectOpen(true);
    }
  };

  const handleClearSelection = () => {
    setSelectedComponent(null);
  };

  const handleRunCalibration = () => {
    setIsCalibrating(true);
    setTimeout(() => {
      setIsCalibrating(false);
      showToast(`AI diagnostic self-calibration passed with 99.8% sensor fidelity for ${selectedMachine.name}`);
    }, 1800);
  };

  const handleCreateWorkOrder = () => {
    const compName = selectedComponent?.name || 'Full Machine Inspection';
    showToast(`Work Order #WO-${Math.floor(1000 + Math.random() * 9000)} generated for ${selectedMachine.name} (${compName})`);
  };

  // Active display component logic
  const baseComp = selectedComponent || (activeComponents && activeComponents[0]) || refMachineComponentsData[0];
  
  // Dynamic sensor values depending on Failure Simulation mode
  const activeMetrics = isSimulatingFailure && baseComp?.failureState
    ? { ...baseComp, ...baseComp.failureState }
    : baseComp || refMachineComponentsData[0];

  const dynamicTimelineData = useMemo(() => {
    if (selectedMachine.id.startsWith('MOBILE') && liveMobileTelemetry) {
      const baseTemp = Number(liveMobileTelemetry.temperature || 28.0);
      const baseBattery = Number(liveMobileTelemetry.battery || 23.0);
      return Array.from({ length: 10 }, (_, i) => ({
        time: `-${(9 - i) * 3}m`,
        temperature: Number((baseTemp - (9 - i) * 0.15 + (Math.random() * 0.3 - 0.15)).toFixed(1)),
        vibration: Number((0.1 + (Math.random() * 0.05)).toFixed(2)),
        health: Math.min(100, Math.max(80, Math.round(baseBattery * 0.2 + 76))),
      }));
    }
    return activeMetrics.timelineData || [];
  }, [selectedMachine.id, liveMobileTelemetry, activeMetrics.timelineData]);

  return (
    <div className="w-full h-full min-h-screen bg-[#0a0f1d] text-slate-100 flex flex-col font-sans select-none overflow-y-auto pb-16">
      
      {/* Toast Alert Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#0f172a] text-white px-5 py-3 rounded-2xl text-xs font-bold shadow-2xl border border-cyan-400/50 flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MACHINE SWITCHING LOADING TRANSITION OVERLAY */}
      {isMachineLoading && (
        <div className="fixed inset-0 z-50 bg-[#0a0f1d]/90 backdrop-blur-xl flex flex-col items-center justify-center text-center p-6 space-y-4 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-2xl shadow-cyan-500/30">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white tracking-wide">
              {loadingStage}
            </h3>
            <p className="text-xs text-cyan-300/70 mt-1">
              Constructing 3D CAD physics nodes & streaming real-time telemetry...
            </p>
          </div>
          <div className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 px-4 py-1.5 rounded-full border border-cyan-800">
            {selectedMachine.name}
          </div>
        </div>
      )}

      {/* 1. TOP HEADER & MACHINE SELECTOR RIBBON */}
      <div className="bg-[#0f172a]/90 backdrop-blur-md border-b border-slate-800/80 px-6 py-4 sticky top-0 z-40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Machine Info & Title */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-cyan-500/20 text-2xl font-bold">
              {machineIcons[selectedMachine.id] || '⚙️'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                  {selectedMachine.id}
                </span>
                {selectedMachine.id.startsWith('MOBILE') && liveMobileTelemetry?.online && (
                  <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded bg-emerald-950/90 text-emerald-300 border border-emerald-700 flex items-center gap-1.5 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                    LIVE SOCKET.IO STREAM
                  </span>
                )}
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${
                  isSimulatingFailure
                    ? 'bg-red-950/80 text-red-400 border-red-800 animate-pulse'
                    : selectedMachine.status === 'WARNING'
                    ? 'bg-amber-950/80 text-amber-400 border-amber-800'
                    : 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${isSimulatingFailure ? 'bg-red-500 animate-ping' : selectedMachine.status === 'WARNING' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                  {isSimulatingFailure ? 'ANOMALY SIMULATION' : (selectedMachine.id.startsWith('MOBILE') && liveMobileTelemetry ? `${liveMobileTelemetry.status?.toUpperCase() || 'ONLINE'}` : selectedMachine.status)}
                </span>
                <span className="text-slate-400 text-xs">• {selectedMachine.id.startsWith('MOBILE') && liveMobileTelemetry?.name ? `${liveMobileTelemetry.name} (Socket Port 4000)` : selectedMachine.location}</span>
              </div>
              <h1 className="text-lg font-black text-white tracking-tight mt-1 flex items-center gap-2">
                {selectedMachine.id.startsWith('MOBILE') && liveMobileTelemetry?.name ? `${liveMobileTelemetry.name} (Connected Phone Twin)` : selectedMachine.name}
              </h1>
            </div>
          </div>

          {/* 3D Mode & View Overlays */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800">
              {[
                { id: 'CAD', label: '3D CAD Normal', icon: Box },
                { id: 'EXPLODED', label: 'Exploded Parts', icon: Layers },
                { id: 'THERMAL', label: 'Thermal Heatmap', icon: Flame },
                { id: 'VIBRATION', label: 'Vibration Nodes', icon: Activity },
              ].map((mode) => {
                const Icon = mode.icon;
                const isActive = viewMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-cyan-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{mode.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* 2. FAST MACHINE SWITCHER CAROUSEL BAR */}
        <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            Select Machine:
          </span>
          {libraryMachines.map((m) => {
            const isSelected = m.id === selectedMachine.id;
            return (
              <button
                key={m.id}
                onClick={() => handleSwitchMachine(m.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border shrink-0 ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/60 shadow-md shadow-cyan-500/10 font-bold ring-1 ring-cyan-400/30'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span>{machineIcons[m.id] || '⚙️'}</span>
                <span className="truncate max-w-[160px]">{m.name.split('(')[0].split('-')[0].trim()}</span>
                {m.status === 'WARNING' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* 3. QUICK COMPONENT PART CHIPS */}
        <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
            Parts ({activeComponents.length}):
          </span>
          <button
            onClick={handleClearSelection}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 border ${
              !selectedComponent
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
            }`}
          >
            All Assembly
          </button>
          {activeComponents.map((comp) => {
            const isSelected = selectedComponent?.id === comp.id;
            return (
              <button
                key={comp.id}
                onClick={() => handleSelectComponent(comp)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all shrink-0 border ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-sm'
                    : 'bg-slate-900/90 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${
                  comp.status === 'WARNING' ? 'bg-amber-400' : comp.status === 'CRITICAL' ? 'bg-red-400' : 'bg-emerald-400'
                }`} />
                <span className="truncate max-w-[140px]">{comp.name}</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* 4. MAIN WORKSPACE GRID */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Component Hierarchy & Part Breakdown Tree */}
        {isInspectOpen && (
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-4 shadow-xl space-y-3">
              
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                    Component Parts ({activeComponents.length})
                  </h2>
                </div>
                <button
                  onClick={() => setIsInspectOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Collapse Tree"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>

              {/* Filter Search Box */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={treeSearch}
                  onChange={(e) => setTreeSearch(e.target.value)}
                  placeholder="Filter parts (e.g. Stator, Rotor)..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900 border border-slate-700/80 rounded-xl outline-none focus:border-cyan-400 text-slate-100 placeholder-slate-500"
                />
              </div>

              {/* Component Parts List */}
              <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1">
                {filteredTree.map((comp) => {
                  const isSelected = selectedComponent?.id === comp.id;
                  const isFailed = isSimulatingFailure && (isSelected || comp.id.includes('bearing') || comp.id.includes('front'));
                  const currentHealth = isFailed && comp.failureState ? comp.failureState.healthScore : comp.healthScore;

                  return (
                    <button
                      key={comp.id}
                      onClick={() => handleSelectComponent(comp)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all border ${
                        isSelected
                          ? isFailed
                            ? 'bg-red-950/80 text-white border-red-500 shadow-md font-bold'
                            : 'bg-cyan-500/20 text-cyan-200 border-cyan-400/80 shadow-md font-bold ring-1 ring-cyan-400/40'
                          : 'bg-slate-900/80 hover:bg-slate-800/90 text-slate-300 border-slate-800/80'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${
                            isFailed
                              ? 'bg-red-400 animate-ping'
                              : comp.status === 'WARNING'
                              ? 'bg-amber-400 animate-pulse'
                              : 'bg-emerald-400'
                          }`} />
                          <span className="truncate text-xs font-semibold">{comp.name}</span>
                        </div>
                        <span className={`text-[10px] block truncate mt-0.5 pl-4 ${isSelected ? 'text-cyan-300/80' : 'text-slate-500'}`}>
                          {comp.subsystem}
                        </span>
                      </div>
                      <span className={`text-[10px] font-mono shrink-0 px-2 py-0.5 rounded ${
                        isSelected 
                          ? 'bg-cyan-900/60 text-cyan-300 border border-cyan-700' 
                          : isFailed
                          ? 'bg-red-900/50 text-red-300 font-bold border border-red-700'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {currentHealth}%
                      </span>
                    </button>
                  );
                })}
              </div>

            </div>
          </div>
        )}

        {/* CENTER COLUMN: 3D REAL-TIME DIGITAL TWIN CANVAS */}
        <div className={`${
          isInspectOpen ? 'lg:col-span-5' : 'lg:col-span-8'
        } h-[600px] w-full transition-all duration-300 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-[#080d19] relative`}>
          <MotorViewer 
            viewMode={viewMode}
            setViewMode={setViewMode}
            selectedComponent={selectedComponent}
            setSelectedComponent={setSelectedComponent}
            isInspectOpen={isInspectOpen}
            setIsInspectOpen={setIsInspectOpen}
            isDigitalTwinView={isDigitalTwinView}
            setIsDigitalTwinView={setIsDigitalTwinView}
            isSimulatingFailure={isSimulatingFailure}
            setIsSimulatingFailure={setIsSimulatingFailure}
            activeMachineName={selectedMachine.name}
            selectedMachineId={selectedMachine.id}
            components={activeComponents}
            telemetry={selectedMachine?.id?.startsWith('MOBILE') ? liveMobileTelemetry : null}
          />
        </div>

        {/* RIGHT COLUMN: Part Inspection, Sensor Telemetry & AI Diagnostic Inspector */}
        <div className={`${isInspectOpen ? 'lg:col-span-4' : 'lg:col-span-4'} space-y-4`}>
            
            <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
              
              {/* Part Header */}
              <div className="pb-3 border-b border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                    {activeMetrics.subsystem}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      activeMetrics.status === 'CRITICAL' || isSimulatingFailure
                        ? 'bg-red-950 text-red-400 border-red-800 animate-pulse'
                        : activeMetrics.status === 'WARNING' 
                        ? 'bg-amber-950 text-amber-400 border-amber-800' 
                        : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                    }`}>
                      {isSimulatingFailure ? 'SIMULATED FAULT' : activeMetrics.status}
                    </span>
                    {selectedComponent && (
                      <button
                        onClick={handleClearSelection}
                        className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                        title="Clear part focus"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <h2 className="text-base font-black text-white mt-2">
                  {activeMetrics.name}
                </h2>
                <p className="text-xs font-mono text-slate-400 mt-0.5 truncate">
                  {activeMetrics.partNumber}
                </p>
              </div>

              {/* Health Score & Failure Probability Gauge */}
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                isSimulatingFailure
                  ? 'bg-gradient-to-r from-red-950/60 to-slate-900 border-red-700/60'
                  : 'bg-gradient-to-r from-slate-900 to-cyan-950/30 border-slate-800'
              }`}>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Health Score</span>
                  <div className="text-2xl font-black font-mono text-white mt-0.5">
                    <span className={activeMetrics.healthScore < 60 ? 'text-red-400 font-black' : activeMetrics.healthScore > 90 ? 'text-emerald-400' : 'text-amber-400'}>
                      {activeMetrics.healthScore}
                    </span>
                    <span className="text-xs text-slate-500 font-sans"> / 100</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Failure Probability</span>
                  <div className={`text-xl font-bold font-mono mt-0.5 ${activeMetrics.failureProbability > 50 ? 'text-red-400 animate-pulse' : 'text-cyan-400'}`}>
                    {activeMetrics.failureProbability}%
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex border-b border-slate-800 text-xs font-semibold">
                <button
                  onClick={() => setActiveRightTab('TELEMETRY')}
                  className={`pb-2 px-3 border-b-2 transition-colors ${
                    activeRightTab === 'TELEMETRY'
                      ? 'border-cyan-400 text-cyan-400 font-bold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Telemetry
                </button>
                <button
                  onClick={() => setActiveRightTab('AI')}
                  className={`pb-2 px-3 border-b-2 transition-colors ${
                    activeRightTab === 'AI'
                      ? 'border-cyan-400 text-cyan-400 font-bold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  AI Insights
                </button>
                <button
                  onClick={() => setActiveRightTab('HISTORY')}
                  className={`pb-2 px-3 border-b-2 transition-colors ${
                    activeRightTab === 'HISTORY'
                      ? 'border-cyan-400 text-cyan-400 font-bold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Maintenance
                </button>
                <button
                  onClick={() => setActiveRightTab('CONTROLS')}
                  className={`pb-2 px-3 border-b-2 transition-colors ${
                    activeRightTab === 'CONTROLS'
                      ? 'border-cyan-400 text-cyan-400 font-bold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Controls
                </button>
              </div>

              {/* TAB 1: Live Component Metrics */}
              {activeRightTab === 'TELEMETRY' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    
                    {/* Temperature */}
                    <div className={`p-3 rounded-xl border ${isSimulatingFailure ? 'bg-red-950/60 border-red-700' : 'bg-slate-900 border-slate-800'}`}>
                      <div className="text-slate-400 text-[10px] flex items-center gap-1">
                        <Thermometer className="w-3.5 h-3.5 text-amber-400" /> {selectedMachine.id.startsWith('MOBILE') ? 'SoC / Battery Temp' : 'Temperature'}
                      </div>
                      <div className={`font-bold font-mono text-sm mt-1 ${isSimulatingFailure ? 'text-red-400' : 'text-white'}`}>
                        {selectedMachine.id.startsWith('MOBILE') && liveMobileTelemetry?.temperature ? `${Number(liveMobileTelemetry.temperature).toFixed(1)}°C` : `${activeMetrics.temperature}°C`}
                      </div>
                    </div>

                    {/* Battery or Vibration */}
                    {selectedMachine.id.startsWith('MOBILE') ? (
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="text-slate-400 text-[10px] flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 text-emerald-400" /> Battery Level
                        </div>
                        <div className="font-bold text-emerald-400 font-mono text-sm mt-1 flex items-center gap-1.5">
                          <span>{Math.round(liveMobileTelemetry?.battery ?? 23)}%</span>
                          {liveMobileTelemetry?.charging && (
                            <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-700">CHARGING</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className={`p-3 rounded-xl border ${isSimulatingFailure ? 'bg-red-950/60 border-red-700' : 'bg-slate-900 border-slate-800'}`}>
                        <div className="text-slate-400 text-[10px] flex items-center gap-1">
                          <Activity className="w-3.5 h-3.5 text-red-400" /> Vibration RMS
                        </div>
                        <div className={`font-bold font-mono text-sm mt-1 ${isSimulatingFailure ? 'text-red-400' : 'text-white'}`}>
                          {activeMetrics.vibration} mm/s
                        </div>
                      </div>
                    )}

                    {/* CPU Load or Speed */}
                    {selectedMachine.id.startsWith('MOBILE') ? (
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="text-slate-400 text-[10px] flex items-center gap-1">
                          <Cpu className="w-3.5 h-3.5 text-cyan-400" /> CPU Load
                        </div>
                        <div className="font-bold text-cyan-300 font-mono text-sm mt-1">
                          {liveMobileTelemetry?.cpu ? `${Number(liveMobileTelemetry.cpu).toFixed(1)}%` : '19.2%'}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="text-slate-400 text-[10px] flex items-center gap-1">
                          <Gauge className="w-3.5 h-3.5 text-blue-400" /> Rotational Speed
                        </div>
                        <div className="font-bold text-white font-mono text-sm mt-1">{activeMetrics.rpm || '1,480 RPM'}</div>
                      </div>
                    )}

                    {/* RAM or Pressure */}
                    {selectedMachine.id.startsWith('MOBILE') ? (
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="text-slate-400 text-[10px] flex items-center gap-1">
                          <Layers3 className="w-3.5 h-3.5 text-purple-400" /> RAM Memory
                        </div>
                        <div className="font-bold text-purple-300 font-mono text-sm mt-1">
                          {liveMobileTelemetry?.ram ? `${Number(liveMobileTelemetry.ram).toFixed(1)}%` : '44.5%'}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="text-slate-400 text-[10px] flex items-center gap-1">
                          <Layers3 className="w-3.5 h-3.5 text-cyan-400" /> Pressure
                        </div>
                        <div className="font-bold text-white font-mono text-sm mt-1">{activeMetrics.pressure || 'Nominal'}</div>
                      </div>
                    )}

                    {/* Network / Current */}
                    {selectedMachine.id.startsWith('MOBILE') ? (
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="text-slate-400 text-[10px] flex items-center gap-1">
                          <Radio className="w-3.5 h-3.5 text-blue-400" /> Network Stream
                        </div>
                        <div className="font-bold text-blue-300 font-mono text-xs mt-1 truncate">
                          {liveMobileTelemetry?.online ? 'Socket.IO (100Hz)' : 'Wi-Fi Nominal'}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="text-slate-400 text-[10px] flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 text-purple-400" /> Motor Current
                        </div>
                        <div className="font-bold text-white font-mono text-sm mt-1">{activeMetrics.current || '28.5 A'}</div>
                      </div>
                    )}

                    {/* RUL */}
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-slate-400 text-[10px] flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-emerald-400" /> {selectedMachine.id.startsWith('MOBILE') ? 'Battery RUL' : 'Remaining RUL'}
                      </div>
                      <div className={`font-bold font-mono text-sm mt-1 ${activeMetrics.rulHours < 200 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {activeMetrics.rulHours} hrs
                      </div>
                    </div>

                  </div>

                  {/* Status Notes */}
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Last Maintenance:</span>
                      <span className="font-mono font-semibold text-slate-200">{activeMetrics.lastMaintenanceDate || '2026-04-10'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Next Scheduled:</span>
                      <span className="font-mono font-semibold text-amber-400">{activeMetrics.nextMaintenanceDate || '2027-04-10'}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                      Status: <span className="text-cyan-300">{activeMetrics.maintenanceStatus || 'Nominal Operation'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: AI Root Cause Diagnosis & Recommendation */}
              {activeRightTab === 'AI' && (
                <div className="space-y-3">
                  <div className={`p-4 rounded-xl border space-y-2 ${
                    isSimulatingFailure ? 'bg-red-950/60 border-red-800' : 'bg-cyan-950/40 border-cyan-800/80'
                  }`}>
                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                      <Sparkles className={`w-4 h-4 ${isSimulatingFailure ? 'text-red-400' : 'text-cyan-400'}`} />
                      <span>AI Predictive Root Cause Diagnosis</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {activeMetrics.aiDiagnosis || 'All physical harmonic vibration baselines and thermal signatures match optimal neural simulation curve.'}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                      <Wrench className="w-4 h-4 text-amber-400" />
                      <span>Recommended Maintenance Action</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {activeMetrics.aiRecommendation || 'Continue standard continuous condition monitoring at 100Hz IoT telemetry sample rate.'}
                    </p>
                  </div>

                  <button
                    onClick={handleCreateWorkOrder}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Wrench className="w-4 h-4" />
                    <span>Create AI Work Order</span>
                  </button>
                </div>
              )}

              {/* TAB 3: Maintenance History */}
              {activeRightTab === 'HISTORY' && (
                <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                  {activeMetrics.maintenanceHistory && activeMetrics.maintenanceHistory.length > 0 ? (
                    activeMetrics.maintenanceHistory.map((log) => (
                      <div key={log.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                        <div className="flex items-center justify-between font-mono font-bold text-white">
                          <span className="text-cyan-400">{log.id}</span>
                          <span className="text-slate-400 font-normal">{log.date}</span>
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-300 font-medium">
                          <span>{log.type} ({log.technician})</span>
                          <span className="font-mono font-semibold text-emerald-400">{log.cost}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-tight pt-1">
                          {log.details}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-400 bg-slate-900 rounded-xl border border-slate-800">
                      No prior work orders logged for this specific component.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: Controls & Calibration */}
              {activeRightTab === 'CONTROLS' && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-white block">AI Self-Diagnostic Test</span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Run automated neural sensor calibration, impedance sweep, and frequency response analysis.
                    </p>
                    <button
                      onClick={handleRunCalibration}
                      disabled={isCalibrating}
                      className="w-full mt-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700 flex items-center justify-center gap-2"
                    >
                      {isCalibrating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                          <span>Calibrating Physics Engine...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 text-emerald-400" />
                          <span>Run Diagnostic Calibration</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-white block">Part Failure Simulation</span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Trigger severe bearing thermal runaway & rotor unbalance to test emergency automated interlocks.
                    </p>
                    <button
                      onClick={() => setIsSimulatingFailure(!isSimulatingFailure)}
                      className={`w-full mt-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                        isSimulatingFailure
                          ? 'bg-red-600 text-white shadow-lg shadow-red-500/30 animate-pulse'
                          : 'bg-red-950/60 text-red-300 hover:bg-red-900 border border-red-800'
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span>{isSimulatingFailure ? 'Stop Anomaly Simulation' : 'Trigger Component Failure Fault'}</span>
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>

      </div>

      {/* 5. BOTTOM SECTION: Real-Time Sensor Telemetry Timeline Graph */}
      <div className="mx-6 bg-[#0f172a] rounded-2xl border border-slate-800 p-5 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white">
              Real-Time Sensor Telemetry Timeline: <span className="text-cyan-400">{activeMetrics.name}</span>
            </h3>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Temp (°C)
            </span>
            <span className="flex items-center gap-1.5 text-red-400">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" /> Vibration (mm/s)
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Health (%)
            </span>
          </div>
        </div>

        <div className="h-52 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dynamicTimelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#0a0f1d', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
              <Line type="monotone" dataKey="temperature" stroke="#f59e0b" strokeWidth={2.5} name="Temp (°C)" dot={false} />
              <Line type="monotone" dataKey="vibration" stroke="#ef4444" strokeWidth={2.5} name="Vibration (mm/s)" dot={false} />
              <Line type="monotone" dataKey="health" stroke="#10b981" strokeWidth={2} name="Health (%)" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}

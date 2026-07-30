import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Activity, 
  Layers, 
  Flame, 
  Sparkles, 
  ChevronLeft,
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
  Library
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
import MotorViewer from '../3d/MotorViewer';

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

  const selectedMachine = propSelectedMachine || localMachine;
  const isMachineLoading = propIsLoading !== undefined ? propIsLoading : localIsLoading;
  const loadingStage = propLoadingStage !== undefined ? propLoadingStage : localLoadingStage;

  // Retrieve dedicated per-machine configuration from machines registry
  const activeMachineConfig = getMachineConfig(selectedMachine.id);

  // 3D Overlays & Controls
  const [viewMode, setViewMode] = useState('CAD'); // CAD, THERMAL, EXPLODED, VIBRATION
  const [selectedComponent, setSelectedComponent] = useState(null); // Default null: Clean full machine focus

  // Auto-reset component selection when machine changes
  useEffect(() => {
    setSelectedComponent(null);
  }, [selectedMachine.id]);
  const [isInspectOpen, setIsInspectOpen] = useState(false);
  const [isDigitalTwinView, setIsDigitalTwinView] = useState(true); // Default true for Real Machine (LEFT) + Holographic Twin (RIGHT)
  const [isSimulatingFailure, setIsSimulatingFailure] = useState(false); // Default OFF: Normal telemetry
  const [treeSearch, setTreeSearch] = useState('');
  const [activeRightTab, setActiveRightTab] = useState('TELEMETRY'); // TELEMETRY, HISTORY, AI

  // Supported Digital Twin Library Machine List (All 10 assets)
  const libraryMachines = allIndustrialMachines;

  // Handle Switching Machine from Digital Twin Library Dropdown
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

    // Sequential Loading Transition
    setLocalLoadingStage('Loading Digital Twin...');
    setTimeout(() => {
      setLocalLoadingStage('Connecting to IoT Sensors...');
      setTimeout(() => {
        setLocalLoadingStage('Synchronizing AI Model...');
        setTimeout(() => {
          setLocalLoadingStage('Loading 3D Assets...');
          setTimeout(() => {
            setLocalLoadingStage('Machine Ready');
            setLocalMachine(nextMachine);
            if (onSelectMachine) onSelectMachine(nextMachine);
            setTimeout(() => {
              setLocalIsLoading(false);
            }, 250);
          }, 300);
        }, 300);
      }, 300);
    }, 300);
  };

  const activeComponents = activeMachineConfig.components || selectedMachine.components || refMachineComponentsData;

  const filteredTree = activeComponents.filter((c) =>
    c.name.toLowerCase().includes(treeSearch.toLowerCase()) ||
    c.partNumber.toLowerCase().includes(treeSearch.toLowerCase()) ||
    c.subsystem.toLowerCase().includes(treeSearch.toLowerCase())
  );

  const handleSelectComponent = (comp) => {
    setSelectedComponent(comp);
    if (!isInspectOpen) {
      setIsInspectOpen(true);
    }
  };

  const handleClearSelection = () => {
    setSelectedComponent(null);
  };

  // Active display component logic
  const baseComp = selectedComponent || activeComponents[0];
  
  // Dynamic sensor values depending on Failure Simulation mode
  const activeMetrics = isSimulatingFailure && baseComp.failureState
    ? { ...baseComp, ...baseComp.failureState }
    : baseComp;

  return (
    <div className="space-y-6 pb-12 relative">
      
      {/* MACHINE SWITCHING LOADING TRANSITION OVERLAY */}
      {isMachineLoading && (
        <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center text-center p-6 space-y-3 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xl shadow-blue-500/30">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {loadingStage}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Configuring 3D physics mesh & streaming live sensor nodes...
            </p>
          </div>
          <div className="text-[11px] font-mono font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            {selectedMachine.name}
          </div>
        </div>
      )}

      {/* Top Header Bar with ▼ DIGITAL TWIN LIBRARY Dropdown Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 text-white shadow-md shadow-blue-500/20">
            <Library className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                {selectedMachine.id}
              </span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                isSimulatingFailure
                  ? 'bg-red-100 text-red-800 border-red-200'
                  : 'bg-amber-100 text-amber-800 border-amber-200'
              }`}>
                <span className={`w-2 h-2 rounded-full animate-ping ${isSimulatingFailure ? 'bg-red-500' : 'bg-amber-500'}`} />
                STATUS: {isSimulatingFailure ? 'SIMULATED FAILURE' : selectedMachine.status}
              </span>
              <span className="text-slate-400 text-xs">• {selectedMachine.location}</span>
            </div>

            {/* ▼ DIGITAL TWIN LIBRARY DROPDOWN SELECTOR */}
            <div className="relative mt-1">
              <select
                value={selectedMachine.id}
                onChange={(e) => handleSwitchMachine(e.target.value)}
                className="appearance-none pr-8 bg-transparent text-lg font-bold text-slate-900 cursor-pointer outline-none hover:text-blue-600 transition-colors truncate max-w-xl"
              >
                {libraryMachines.map((machine) => (
                  <option key={machine.id} value={machine.id} className="text-slate-800 text-xs py-1">
                    ▼ Digital Twin Library: {machine.name} ({machine.id})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 3D Overlay Mode Controls */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
          <span className="text-xs font-semibold text-slate-500 mr-1 shrink-0">3D Overlay:</span>
          {[
            { id: 'CAD', label: '3D CAD Normal', icon: Box },
            { id: 'EXPLODED', label: 'Exploded View', icon: Layers },
            { id: 'THERMAL', label: 'Thermal Heatmap', icon: Flame },
            { id: 'VIBRATION', label: 'Vibration Nodes', icon: Activity },
          ].map((mode) => {
            const Icon = mode.icon;
            const isActive = viewMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT SIDEBAR: Machine Components Hierarchy Tree (Toggled by "Inspect Components") */}
        {isInspectOpen && (
          <div className="lg:col-span-3 space-y-4 transition-all">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
              
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-blue-600" />
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Components ({activeComponents.length})
                  </h2>
                </div>
                <button
                  onClick={() => setIsInspectOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  title="Close Component Panel"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>

              {/* Filter Search Box */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={treeSearch}
                  onChange={(e) => setTreeSearch(e.target.value)}
                  placeholder="Filter components..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-slate-800"
                />
              </div>

              {/* Component List */}
              <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
                {filteredTree.map((comp) => {
                  const isSelected = selectedComponent?.id === comp.id;
                  const isFailed = isSimulatingFailure && (isSelected || comp.id.includes('front') || comp.id.includes('bearing'));
                  const currentHealth = isFailed && comp.failureState ? comp.failureState.healthScore : comp.healthScore;

                  return (
                    <button
                      key={comp.id}
                      onClick={() => handleSelectComponent(comp)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                        isSelected
                          ? isFailed
                            ? 'bg-red-600 text-white shadow-md shadow-red-500/20 font-bold'
                            : 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-bold'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/60'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${
                            isFailed
                              ? 'bg-red-400 animate-ping'
                              : comp.status === 'WARNING'
                              ? 'bg-amber-500 animate-pulse'
                              : 'bg-emerald-500'
                          }`} />
                          <span className="truncate text-xs font-semibold">▶ {comp.name}</span>
                        </div>
                        <span className={`text-[10px] block truncate mt-0.5 pl-3.5 ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                          {comp.subsystem}
                        </span>
                      </div>
                      <span className={`text-[10px] font-mono shrink-0 px-2 py-0.5 rounded ${
                        isSelected 
                          ? 'bg-white/20 text-white' 
                          : isFailed
                          ? 'bg-red-100 text-red-700 font-bold'
                          : 'bg-slate-200/70 text-slate-700'
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

        {/* CENTER 3D CANVAS (SYNCHRONIZED REAL MACHINE + BLUE HOLOGRAPHIC DIGITAL TWIN) */}
        <div className={`${
          isInspectOpen 
            ? selectedComponent ? 'lg:col-span-5' : 'lg:col-span-9'
            : selectedComponent ? 'lg:col-span-8' : 'lg:col-span-12'
        } h-[520px] w-full transition-all duration-300`}>
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
          />
        </div>

        {/* RIGHT PANEL: Displays Information ONLY for Selected Component */}
        {(selectedComponent || isInspectOpen) && (
          <div className="lg:col-span-4 space-y-4 transition-all">
            
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              
              {/* Header & Component Name */}
              <div className="pb-3 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    {activeMetrics.subsystem}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      activeMetrics.status === 'CRITICAL' || isSimulatingFailure
                        ? 'bg-red-100 text-red-800 border-red-200 animate-pulse'
                        : activeMetrics.status === 'WARNING' 
                        ? 'bg-amber-100 text-amber-800 border-amber-200' 
                        : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    }`}>
                      {isSimulatingFailure ? 'SIMULATED FAILURE' : activeMetrics.status}
                    </span>
                    {selectedComponent && (
                      <button
                        onClick={handleClearSelection}
                        className="text-slate-400 hover:text-slate-600 p-0.5 rounded-lg hover:bg-slate-100"
                        title="Clear selection"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <h2 className="text-base font-extrabold text-slate-900 mt-2">
                  {activeMetrics.name}
                </h2>
                <p className="text-xs font-mono text-slate-500 mt-0.5">
                  {activeMetrics.partNumber}
                </p>
              </div>

              {/* Health Score & Failure Probability Gauge */}
              <div className={`flex items-center justify-between p-3.5 rounded-xl border ${
                isSimulatingFailure
                  ? 'bg-gradient-to-r from-red-50 to-amber-50/50 border-red-200'
                  : 'bg-gradient-to-r from-slate-50 to-blue-50/30 border-slate-200'
              }`}>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Health Score</span>
                  <div className="text-2xl font-extrabold font-mono text-slate-900 mt-0.5">
                    <span className={activeMetrics.healthScore < 60 ? 'text-red-600 font-black' : activeMetrics.healthScore > 90 ? 'text-emerald-600' : 'text-amber-600'}>
                      {activeMetrics.healthScore}
                    </span>
                    <span className="text-xs text-slate-400 font-sans"> / 100</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Failure Probability</span>
                  <div className={`text-lg font-bold font-mono mt-0.5 ${activeMetrics.failureProbability > 50 ? 'text-red-600' : 'text-slate-900'}`}>
                    {activeMetrics.failureProbability}%
                  </div>
                </div>
              </div>

              {/* Inspector Sub-Tabs */}
              <div className="flex border-b border-slate-200 text-xs font-semibold">
                <button
                  onClick={() => setActiveRightTab('TELEMETRY')}
                  className={`pb-2 px-3 border-b-2 transition-colors ${
                    activeRightTab === 'TELEMETRY'
                      ? 'border-blue-600 text-blue-600 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Telemetry Metrics
                </button>
                <button
                  onClick={() => setActiveRightTab('HISTORY')}
                  className={`pb-2 px-3 border-b-2 transition-colors ${
                    activeRightTab === 'HISTORY'
                      ? 'border-blue-600 text-blue-600 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Maintenance History
                </button>
                <button
                  onClick={() => setActiveRightTab('AI')}
                  className={`pb-2 px-3 border-b-2 transition-colors ${
                    activeRightTab === 'AI'
                      ? 'border-blue-600 text-blue-600 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  AI Diagnosis
                </button>
              </div>

              {/* TAB 1: Live Component Metrics Grid */}
              {activeRightTab === 'TELEMETRY' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    
                    {/* Temperature */}
                    <div className={`p-2.5 rounded-xl border ${isSimulatingFailure ? 'bg-red-50/60 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="text-slate-500 text-[10px] flex items-center gap-1">
                        <Thermometer className="w-3 h-3 text-amber-500" /> Temperature
                      </div>
                      <div className={`font-bold font-mono mt-1 ${isSimulatingFailure ? 'text-red-600 text-sm' : 'text-slate-900'}`}>
                        {activeMetrics.temperature}°C
                      </div>
                    </div>

                    {/* Pressure */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-slate-500 text-[10px] flex items-center gap-1">
                        <Layers3 className="w-3 h-3 text-cyan-500" /> Pressure
                      </div>
                      <div className="font-bold text-slate-900 font-mono mt-1">{activeMetrics.pressure}</div>
                    </div>

                    {/* RPM */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-slate-500 text-[10px] flex items-center gap-1">
                        <Gauge className="w-3 h-3 text-blue-500" /> RPM (Speed)
                      </div>
                      <div className="font-bold text-slate-900 font-mono mt-1">{activeMetrics.rpm}</div>
                    </div>

                    {/* Vibration */}
                    <div className={`p-2.5 rounded-xl border ${isSimulatingFailure ? 'bg-red-50/60 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="text-slate-500 text-[10px] flex items-center gap-1">
                        <Activity className="w-3 h-3 text-red-500" /> Vibration RMS
                      </div>
                      <div className={`font-bold font-mono mt-1 ${isSimulatingFailure ? 'text-red-600 text-sm' : 'text-slate-900'}`}>
                        {activeMetrics.vibration} mm/s
                      </div>
                    </div>

                    {/* Current */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-slate-500 text-[10px] flex items-center gap-1">
                        <Zap className="w-3 h-3 text-purple-500" /> Current (A)
                      </div>
                      <div className="font-bold text-slate-900 font-mono mt-1">{activeMetrics.current}</div>
                    </div>

                    {/* Remaining Useful Life */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-slate-500 text-[10px] flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-500" /> Remaining RUL
                      </div>
                      <div className={`font-bold font-mono mt-1 ${activeMetrics.rulHours < 100 ? 'text-red-600' : 'text-blue-600'}`}>
                        {activeMetrics.rulHours} hrs
                      </div>
                    </div>

                  </div>

                  {/* Maintenance Dates Summary */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Last Maintenance:</span>
                      <span className="font-mono font-semibold text-slate-800">{activeMetrics.lastMaintenanceDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Next Scheduled:</span>
                      <span className="font-mono font-semibold text-amber-700">{activeMetrics.nextMaintenanceDate}</span>
                    </div>
                    <div className="text-[11px] font-medium text-slate-600 pt-1 border-t border-slate-200/80">
                      Status: {activeMetrics.maintenanceStatus}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Maintenance History Logs */}
              {activeRightTab === 'HISTORY' && (
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {activeMetrics.maintenanceHistory && activeMetrics.maintenanceHistory.length > 0 ? (
                    activeMetrics.maintenanceHistory.map((log) => (
                      <div key={log.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                        <div className="flex items-center justify-between font-mono font-bold text-slate-900">
                          <span className="text-blue-600">{log.id}</span>
                          <span className="text-slate-400 font-normal">{log.date}</span>
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-600 font-medium">
                          <span>{log.type} Service ({log.technician})</span>
                          <span className="font-mono font-semibold">{log.cost}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-tight pt-1">
                          {log.details}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                      No past work order logs recorded for this component.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: Component AI Diagnosis & Maintenance Recommendation */}
              {activeRightTab === 'AI' && (
                <div className="space-y-3">
                  {/* AI Diagnosis */}
                  <div className={`p-3.5 rounded-xl border space-y-1.5 ${
                    isSimulatingFailure ? 'bg-red-50 border-red-200' : 'bg-blue-50/50 border-blue-200'
                  }`}>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <Sparkles className={`w-4 h-4 ${isSimulatingFailure ? 'text-red-600' : 'text-blue-600'}`} />
                      <span>AI Diagnostic Root Cause</span>
                    </div>
                    <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                      {activeMetrics.aiDiagnosis}
                    </p>
                  </div>

                  {/* Maintenance Recommendation */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <Wrench className="w-4 h-4 text-amber-600" />
                      <span>Recommended Maintenance Action</span>
                    </div>
                    <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                      {activeMetrics.aiRecommendation}
                    </p>
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

      </div>

      {/* BOTTOM SECTION: Selected Subsystem Sensor History Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-900">
              Sensor History Timeline for: <span className="text-blue-600">{activeMetrics.name}</span>
            </h3>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-amber-600">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Temp (°C)
            </span>
            <span className="flex items-center gap-1.5 text-red-600">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Vibration (mm/s)
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Health (%)
            </span>
          </div>
        </div>

        <div className="h-56 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={activeMetrics.timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
              <Line type="monotone" dataKey="temperature" stroke="#f59e0b" strokeWidth={2.5} name="Temp (°C)" />
              <Line type="monotone" dataKey="vibration" stroke="#ef4444" strokeWidth={2.5} name="Vibration (mm/s)" />
              <Line type="monotone" dataKey="health" stroke="#10b981" strokeWidth={2} name="Health (%)" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}

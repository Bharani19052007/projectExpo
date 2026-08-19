import React from 'react';
import { 
  Home, 
  Cpu, 
  Factory, 
  Smartphone, 
  Library, 
  Activity, 
  Zap, 
  TrendingUp, 
  Clock, 
  Wrench, 
  ArrowUpRight,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell,
  CartesianGrid 
} from 'recharts';
import { 
  dashboardKPIs, 
  manufacturingLines, 
  hourlySensorTrends, 
  machineHealthDistribution, 
  alertsList 
} from '../../data/mockData';

export default function HomePage({ setActiveModule, setSelectedMachine }) {
  
  const quickActions = [
    {
      title: 'Machine Twin Studio',
      description: 'Inspect deep 3D CAD component meshes, trace real-time IoT sensors, and run failure diagnostic simulations.',
      icon: Cpu,
      module: 'MACHINES',
      glowColor: 'group-hover:border-cyan-500/50 group-hover:shadow-cyan-500/20',
      iconGlow: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      tag: 'PRIMARY'
    },
    {
      title: 'Factory Campus Twin',
      description: 'Fly through the 3D factory floor, track overall equipment effectiveness (OEE), and monitor live line load balances.',
      icon: Factory,
      module: 'FACTORY',
      glowColor: 'group-hover:border-blue-600/50 group-hover:shadow-blue-600/20',
      iconGlow: 'bg-blue-600/10 text-blue-400 border-blue-600/30',
      tag: '3D LAYOUT'
    },
    {
      title: 'Device command twin',
      description: 'Stream live mobile and client socket sensor data directly into interactive 3D holographic smartphone and laptop twins.',
      icon: Smartphone,
      module: 'DEVICES',
      glowColor: 'group-hover:border-purple-600/50 group-hover:shadow-purple-600/20',
      iconGlow: 'bg-purple-600/10 text-purple-400 border-purple-600/30',
      tag: 'SOCKET.IO'
    },
    {
      title: 'Digital Twin Catalog',
      description: 'Explore the complete index of enterprise assets, check machine status reports, and generate predictive work orders.',
      icon: Library,
      module: 'LIBRARY',
      glowColor: 'group-hover:border-emerald-500/50 group-hover:shadow-emerald-500/20',
      iconGlow: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      tag: 'ASSET INDEX'
    }
  ];

  const statCards = [
    {
      title: 'OEE Status',
      value: `${dashboardKPIs.productionEfficiency}%`,
      subtext: 'Optimal operating level',
      trend: '+2.1% shift gain',
      icon: TrendingUp,
      textColor: 'text-cyan-400',
      bgColor: 'bg-cyan-950/40 border-cyan-800/40'
    },
    {
      title: 'Running Assets',
      value: `${dashboardKPIs.running} / ${dashboardKPIs.totalMachines}`,
      subtext: 'Operational machines',
      trend: '6 lines active',
      icon: CheckCircle2,
      textColor: 'text-emerald-400',
      bgColor: 'bg-emerald-950/40 border-emerald-800/40'
    },
    {
      title: 'Alarms Active',
      value: `${alertsList.filter(a => a.severityCode === 'RED').length}`,
      subtext: 'Requires attention',
      trend: `${alertsList.filter(a => a.severityCode === 'YELLOW').length} active warnings`,
      icon: AlertTriangle,
      textColor: 'text-amber-400',
      bgColor: 'bg-amber-950/40 border-amber-800/40'
    },
    {
      title: 'Shift Energy Draw',
      value: `${dashboardKPIs.energyUsage} kWh`,
      subtext: 'Intelligent grid power',
      trend: '-4.2% off peak',
      icon: Zap,
      textColor: 'text-purple-400',
      bgColor: 'bg-purple-950/40 border-purple-800/40'
    }
  ];

  return (
    <div className="w-full h-full min-h-screen bg-[#0a0f1d] text-slate-100 p-6 overflow-y-auto pb-24 scrollbar-thin select-none">
      
      {/* 1. HERO BANNER */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-[#0f172a] p-6 lg:p-8 shadow-2xl mb-8">
        {/* Background Gradients */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-80 h-80 bg-gradient-to-tr from-purple-500/5 to-pink-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-mono font-bold tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                TwinMind Enterprise Operating System
              </span>
              <span className="text-xs text-slate-500 font-medium">• Live telemetry active</span>
            </div>
            
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight">
              Industrial Digital Twin <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent">
                Command & Simulation Center
              </span>
            </h1>
            
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Synthesizing real-time IoT telemetry, automated physics-based models, and NPU anomaly diagnostics into high-fidelity 3D environments. Open a studio cell to simulate component lifespans or inspect general plant health.
            </p>
          </div>

          <div className="shrink-0 flex flex-col items-start lg:items-end gap-2.5">
            <div className="text-left lg:text-right">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Core Diagnostic Engine</div>
              <div className="text-sm font-black text-emerald-400 mt-0.5 flex items-center gap-1.5 justify-start lg:justify-end">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
                SYSTEMS OPERATIONAL
              </div>
            </div>
            
            <button
              onClick={() => setActiveModule('MACHINES')}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-cyan-500/15 cursor-pointer"
            >
              <span>Initialize 3D Studio</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div 
              key={index} 
              className={`p-4 rounded-xl border flex items-center justify-between transition-all bg-[#0d1425] hover:bg-[#0e172b] border-slate-800/80 shadow-md`}
            >
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{card.title}</span>
                <div className="text-xl font-black mt-1 text-white font-mono">{card.value}</div>
                <div className="flex items-center gap-1 text-[10px] font-mono font-medium text-slate-400 mt-1">
                  <span className={card.textColor}>{card.trend}</span>
                  <span>•</span>
                  <span>{card.subtext}</span>
                </div>
              </div>
              <div className={`p-2.5 rounded-xl border ${card.bgColor} shrink-0`}>
                <Icon className={`w-5 h-5 ${card.textColor}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. CORE MODULE CHANNELS */}
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Core Operating Channels</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              onClick={() => setActiveModule(action.module)}
              className="group p-5 rounded-2xl border border-slate-800 bg-[#0d1324] hover:bg-[#0f172a] transition-all text-left flex flex-col justify-between h-[180px] shadow-lg cursor-pointer group-hover:scale-[1.01]"
            >
              <div className="flex items-center justify-between w-full">
                <div className={`p-2.5 rounded-xl border transition-all ${action.iconGlow}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                  {action.tag}
                </span>
              </div>
              
              <div className="mt-4">
                <h4 className="text-sm font-extrabold text-white group-hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  {action.title}
                  <ChevronRight className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-cyan-400" />
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-normal line-clamp-2">
                  {action.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* 4. REAL-TIME TELEMETRY & ALERT HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Plant Trends (2 Cols) */}
        <div className="lg:col-span-2 bg-[#0f172a] rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                24-Hour Telemetry Trend (Temp vs Load)
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Plant-wide real-time dynamic thermal and energy load curves
              </p>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-mono font-bold">
              <span className="flex items-center gap-1.5 text-blue-400">
                <span className="w-2 h-2 rounded-full bg-blue-500 shadow-sm shadow-blue-500/20" /> Temperature (°C)
              </span>
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/20" /> Load (kW)
              </span>
            </div>
          </div>

          <div className="h-60 w-full font-mono text-[10px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlySensorTrends} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="glowBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="glowCyan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" tickLine={false} />
                <YAxis stroke="#64748b" tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0d1324', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px', fontFamily: 'monospace' }}
                />
                <Area type="monotone" dataKey="temperature" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#glowBlue)" name="Temp" />
                <Area type="monotone" dataKey="load" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#glowCyan)" name="Load" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Line Status List (1 Col) */}
        <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-purple-400" />
              Manufacturing Line OEE
            </h3>
            <p className="text-[10px] text-slate-500 mb-4">Live efficiency stats per production section</p>
            
            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {manufacturingLines.map((line) => {
                const isWarning = line.status === 'WARNING';
                const isCritical = line.status === 'CRITICAL';
                
                return (
                  <div 
                    key={line.id} 
                    className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/40 text-xs flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-400">
                          {line.id}
                        </span>
                        <span className="font-bold text-white">{line.name}</span>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.2 rounded-full border ${
                        isCritical 
                          ? 'bg-red-950 text-red-400 border-red-800 animate-pulse' 
                          : isWarning 
                          ? 'bg-amber-950 text-amber-400 border-amber-800' 
                          : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                      }`}>
                        {line.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Line Health: <strong className="text-white font-mono">{line.health}%</strong></span>
                      <span>OEE: <strong className="text-white font-mono">{line.oee}%</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* 5. RECENT ALERTS FEED & PREDICTIVE WORK ORDERS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        
        {/* Active Alerts Feed */}
        <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Active Severity Alerts</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500">{alertsList.length} triggers total</span>
          </div>

          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
            {alertsList.slice(0, 3).map((alert) => {
              const isRed = alert.severityCode === 'RED';
              const isOrange = alert.severityCode === 'ORANGE';
              const isYellow = alert.severityCode === 'YELLOW';

              return (
                <div 
                  key={alert.id}
                  className="p-3 rounded-xl border border-slate-800 bg-slate-950/40 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.2 rounded text-[9px] font-bold border ${
                        isRed ? 'bg-red-950 text-red-400 border-red-800 animate-pulse' :
                        isOrange ? 'bg-orange-950 text-orange-400 border-orange-800' :
                        isYellow ? 'bg-amber-950 text-amber-400 border-amber-800' :
                        'bg-emerald-950 text-emerald-400 border-emerald-800'
                      }`}>
                        {alert.severity}
                      </span>
                      <span className="font-mono font-bold text-white">{alert.machineId}</span>
                      <span className="text-slate-500 text-[10px]">• {alert.line}</span>
                    </div>
                    <div className="font-semibold text-slate-200">{alert.title}</div>
                    <p className="text-[10px] text-slate-400 leading-normal">
                      {alert.description}
                    </p>
                  </div>

                  <button 
                    onClick={() => setActiveModule('MACHINES')}
                    className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-400 hover:text-cyan-300 text-[10px] font-bold cursor-pointer"
                  >
                    Inspect
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Predictive Maintenance Schedules */}
        <div className="bg-[#0f172a] rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Predictive Work Orders</h3>
              </div>
              <span className="text-[9px] font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">AI PROJECTION</span>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-900/60 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-cyan-300">MOTOR-M-15 • Front Bearing Assembly</span>
                  <span className="text-[9px] font-bold px-2 py-0.2 rounded bg-amber-500 text-slate-950 font-mono">240h RUL</span>
                </div>
                <p className="text-slate-400 text-[10px] leading-normal">
                  Elevated high-speed vibration envelope (3.6mm/s) indicates outer race fatigue. Scheduled SKF bearing replacement.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-850 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-300">SIEM-UNIT1-2026 • Converter Drive Shaft</span>
                  <span className="text-[9px] font-bold px-2 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">168h RUL</span>
                </div>
                <p className="text-slate-400 text-[10px] leading-normal">
                  Thermal alignment drift detected. Scheduled laser recalibration and coupling inspection.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
            <span>Active planned orders: <strong>2 Windows</strong></span>
            <span className="font-semibold text-cyan-400">TwinMind AI Engine v2.4</span>
          </div>
        </div>

      </div>

    </div>
  );
}

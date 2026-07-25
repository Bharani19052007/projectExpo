import React from 'react';
import { 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Zap, 
  TrendingUp, 
  Clock, 
  Wrench, 
  ArrowUpRight,
  ShieldAlert,
  Sliders,
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
  alertsList, 
  digitalTwinAsset 
} from '../../data/mockData';

export default function DashboardPage({ setActiveTab }) {
  const kpiCards = [
    {
      title: 'Total Monitored Machines',
      value: dashboardKPIs.totalMachines,
      unit: 'Assets',
      subtext: 'Across 6 active plant lines',
      icon: Activity,
      borderColor: 'border-blue-200',
      bgColor: 'bg-blue-50/50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Running Normally',
      value: dashboardKPIs.running,
      unit: `(${((dashboardKPIs.running / dashboardKPIs.totalMachines) * 100).toFixed(1)}%)`,
      subtext: 'Optimal operating limits',
      icon: CheckCircle2,
      borderColor: 'border-emerald-200',
      bgColor: 'bg-emerald-50/50',
      iconColor: 'text-emerald-600',
    },
    {
      title: 'Warning State',
      value: dashboardKPIs.warning,
      unit: 'Machines',
      subtext: 'Requires PM inspection',
      icon: AlertTriangle,
      borderColor: 'border-amber-200',
      bgColor: 'bg-amber-50/50',
      iconColor: 'text-amber-600',
    },
    {
      title: 'Critical Alarm',
      value: dashboardKPIs.critical,
      unit: 'Offline',
      subtext: 'Action required immediately',
      icon: XCircle,
      borderColor: 'border-red-200',
      bgColor: 'bg-red-50/50',
      iconColor: 'text-red-600',
    },
    {
      title: 'Overall Efficiency (OEE)',
      value: `${dashboardKPIs.productionEfficiency}%`,
      unit: dashboardKPIs.efficiencyTrend,
      subtext: 'vs 85.0% target baseline',
      icon: TrendingUp,
      borderColor: 'border-cyan-200',
      bgColor: 'bg-cyan-50/50',
      iconColor: 'text-cyan-600',
    },
    {
      title: 'Total Energy Usage',
      value: `${dashboardKPIs.energyUsage}`,
      unit: 'kWh',
      subtext: `${dashboardKPIs.energyTrend} reduction this shift`,
      icon: Zap,
      borderColor: 'border-purple-200',
      bgColor: 'bg-purple-50/50',
      iconColor: 'text-purple-600',
    },
  ];

  return (
    <div className="space-y-6 pb-10">
      
      {/* Top Banner / Factory Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-cyan-300 border border-cyan-400/30 text-[11px] font-mono font-semibold">
              GIGAFACTORY 04 - MUNICH PLANT
            </span>
            <span className="text-slate-400 text-xs">• Shift B</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
            Smart Manufacturing Digital Twin Dashboard
          </h1>
          <p className="text-slate-300 text-xs max-w-2xl">
            Real-time IoT telemetry, AI anomaly detection, and predictive health monitoring across 48 heavy industrial assets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab('digital-twin')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-semibold shadow-md shadow-blue-500/30 transition-all hover:scale-[1.02]"
          >
            <Activity className="w-4 h-4" />
            <span>Launch 3D Digital Twin</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div 
              key={idx}
              className={`p-4 rounded-xl bg-white border ${card.borderColor} shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 tracking-tight leading-tight">
                  {card.title}
                </span>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <Icon className={`w-4 h-4 ${card.iconColor}`} />
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    {card.value}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {card.unit}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                  {card.subtext}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Plant Line Overview Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Manufacturing Line Operating Status
            </h2>
            <p className="text-xs text-slate-500">
              Live status, OEE rating, and electrical load across 6 production sections
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">Auto-refreshed: Live (1s)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {manufacturingLines.map((line) => {
            const isWarning = line.status === 'WARNING';
            const isCritical = line.status === 'CRITICAL';

            return (
              <div 
                key={line.id} 
                className={`p-4 rounded-xl border transition-all ${
                  isCritical 
                    ? 'border-red-300 bg-red-50/40' 
                    : isWarning 
                    ? 'border-amber-300 bg-amber-50/30' 
                    : 'border-slate-200 bg-slate-50/40 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                      {line.id}
                    </span>
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {line.name}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isCritical 
                      ? 'bg-red-100 text-red-700 border-red-200 animate-pulse' 
                      : isWarning 
                      ? 'bg-amber-100 text-amber-800 border-amber-200' 
                      : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                  }`}>
                    {line.status}
                  </span>
                </div>

                <div className="space-y-2 mt-3 text-xs">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Machine Health Score</span>
                    <span className="font-mono font-bold text-slate-900">{line.health}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        line.health > 90 ? 'bg-emerald-500' : line.health > 70 ? 'bg-amber-500' : 'bg-red-500'
                      }`} 
                      style={{ width: `${line.health}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-slate-500 pt-1 text-[11px]">
                    <span>Line OEE: <strong className="text-slate-800">{line.oee}%</strong></span>
                    <span>Load: <strong className="text-slate-800">{line.currentLoad}%</strong></span>
                  </div>
                </div>

                {isWarning && (
                  <button 
                    onClick={() => setActiveTab('digital-twin')}
                    className="mt-3 w-full py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-semibold flex items-center justify-center gap-1 shadow-sm"
                  >
                    <span>Inspect Target Twin (MTR-8842-X)</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts Section: Temperature/Load Trend & Health Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Temperature & Load Trend Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                24-Hour Telemetry Trend (Temperature °C vs Electrical Load kW)
              </h3>
              <p className="text-xs text-slate-500">
                Plant-wide thermal evolution and electrical demand timeline
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-blue-600">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Temp (°C)
              </span>
              <span className="flex items-center gap-1.5 text-cyan-600">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Load (kW)
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlySensorTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="tempGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="loadGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="temperature" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#tempGlow)" name="Temperature (°C)" />
                <Area type="monotone" dataKey="load" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#loadGlow)" name="Load (kW)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Machine Health Donut Chart (1 Col) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Machine Health Distribution
            </h3>
            <p className="text-xs text-slate-500">
              Fleet condition classification
            </p>
          </div>

          <div className="h-48 w-full flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={machineHealthDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {machineHealthDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            {machineHealthDistribution.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 font-medium">{item.name}</span>
                </div>
                <span className="font-mono font-bold text-slate-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Row: Recent Alerts Table & Scheduled Maintenance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Industrial Alerts Table */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <h3 className="text-sm font-bold text-slate-900">Recent Critical & Warning Alerts</h3>
            </div>
            <button 
              onClick={() => setActiveTab('alerts')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View All Alerts ({alertsList.length})
            </button>
          </div>

          <div className="space-y-3">
            {alertsList.slice(0, 3).map((alert) => {
              const isRed = alert.severityCode === 'RED';
              const isYellow = alert.severityCode === 'YELLOW';
              const isOrange = alert.severityCode === 'ORANGE';

              return (
                <div 
                  key={alert.id}
                  className="p-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        isRed ? 'bg-red-100 text-red-700 border-red-200' :
                        isOrange ? 'bg-orange-100 text-orange-700 border-orange-200' :
                        isYellow ? 'bg-amber-100 text-amber-700 border-amber-200' :
                        'bg-emerald-100 text-emerald-700 border-emerald-200'
                      }`}>
                        {alert.severity}
                      </span>
                      <span className="font-mono font-bold text-slate-900">{alert.machineId}</span>
                      <span className="text-slate-400">• {alert.line}</span>
                    </div>
                    <div className="font-semibold text-slate-800">{alert.title}</div>
                    <div className="text-slate-500 text-[11px] leading-tight line-clamp-1">
                      {alert.description}
                    </div>
                  </div>

                  <button 
                    onClick={() => setActiveTab('digital-twin')}
                    className="shrink-0 p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-blue-50 text-blue-600 text-xs font-medium"
                    title="Inspect Asset Digital Twin"
                  >
                    Inspect
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scheduled Maintenance Box */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Upcoming Predictive Maintenance</h3>
              </div>
              <span className="text-xs text-slate-400">AI Planned</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-blue-900">MTR-8842-X • Drive End Bearing</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-600 text-white">In 2 Days</span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  Scheduled SKF 6314-C3 bearing replacement & synthetic Klüberplex grease replenishment.
                </p>
                <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1">
                  <span>Assigned: Dipl.-Ing. H. Schmidt</span>
                  <span>Est. Downtime: 1.5 hrs</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">ROB-404 • Axis-5 Harmonic Drive Check</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">In 5 Days</span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Routine grease analysis and backlash calibration test on Welding Line 2.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Total Planned Maintenance Windows: <strong>4 Work Orders</strong></span>
            <button onClick={() => setActiveTab('ai-assistant')} className="text-blue-600 font-semibold hover:underline">
              Ask AI Assistant
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}

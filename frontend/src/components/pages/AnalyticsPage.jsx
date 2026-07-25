import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Zap, 
  Clock, 
  Activity, 
  ShieldCheck, 
  DollarSign,
  PieChart as PieIcon,
  Sliders,
  ChevronRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  AreaChart,
  Area 
} from 'recharts';
import { analyticsOverview } from '../../data/mockData';

export default function AnalyticsPage() {
  const oee = analyticsOverview.oee;
  const stats = analyticsOverview.predictiveStats;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-500/20">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              Manufacturing Intelligence & OEE Analytics
            </h1>
            <p className="text-slate-500 text-xs">
              Overall Equipment Effectiveness, Downtime Pareto, and Energy Consumption
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
            Plant OEE Benchmark: <strong>85.0% (Exceeded at 84.6%)</strong>
          </span>
        </div>
      </div>

      {/* Top Section: OEE Gauges Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Overall Equipment Effectiveness (OEE) Framework
            </h2>
            <p className="text-xs text-slate-500">
              World-class manufacturing KPI metrics breakdown (OEE = Availability × Performance × Quality)
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
            Overall: {oee.overall}%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Overall OEE Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-blue-950 text-white shadow-md flex flex-col justify-between">
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">Overall OEE</span>
            <div className="my-2">
              <span className="text-4xl font-extrabold tracking-tight">{oee.overall}%</span>
              <div className="text-[10px] text-slate-300 mt-1">Industry Standard: {oee.industryBenchmark}%</div>
            </div>
            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-400" style={{ width: `${oee.overall}%` }} />
            </div>
          </div>

          {/* Availability */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 font-bold">1. Availability</span>
                <span className="font-mono font-bold text-slate-900">{oee.availability}%</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Operating Time / Planned Production Time</p>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-blue-600" style={{ width: `${oee.availability}%` }} />
            </div>
          </div>

          {/* Performance */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 font-bold">2. Performance</span>
                <span className="font-mono font-bold text-slate-900">{oee.performance}%</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Actual Cycle Speed / Ideal Cycle Time</p>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-cyan-500" style={{ width: `${oee.performance}%` }} />
            </div>
          </div>

          {/* Quality */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 font-bold">3. Quality</span>
                <span className="font-mono font-bold text-slate-900">{oee.quality}%</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Good Units Produced / Total Units Started</p>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${oee.quality}%` }} />
            </div>
          </div>

        </div>
      </div>

      {/* Middle Section: Downtime Pareto Chart & Energy Consumption */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Downtime Pareto Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Machine Downtime Pareto Analysis (Hours Lost)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Categorized downtime causes across all 6 plant lines this month
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsOverview.downtimePareto} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis dataKey="cause" type="category" stroke="#64748b" fontSize={10} width={130} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
                <Bar dataKey="hours" fill="#3b82f6" radius={[0, 6, 6, 0]} name="Downtime (Hours)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Energy Consumption Trend Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Monthly Energy Consumption (kWh) & Cost Trend
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Electrical power consumption and associated carbon footprint
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsOverview.energyConsumption}>
                <defs>
                  <linearGradient id="energyGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
                <Area type="monotone" dataKey="energyKwh" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#energyGlow)" name="Energy (kWh)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Bottom Section: Predictive Maintenance Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-semibold">Mean Time Between Failures</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">{stats.mtbfHours} <span className="text-xs font-sans text-slate-500">hours</span></div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1">↑ +14% reliability gain</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-semibold">Mean Time To Repair (MTTR)</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">{stats.mttrHours} <span className="text-xs font-sans text-slate-500">hours</span></div>
          <div className="text-[10px] text-blue-600 font-semibold mt-1">↓ -18% repair duration</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-semibold">AI Anomaly Accuracy</div>
          <div className="text-2xl font-extrabold text-cyan-600 mt-1 font-mono">{stats.anomalyAccuracy}%</div>
          <div className="text-[10px] text-slate-400 mt-1">Validated on 1,200 fault patterns</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-semibold">Prevented Catastrophic Cost</div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1 font-mono">{stats.savedCostYtd}</div>
          <div className="text-[10px] text-slate-400 mt-1">14 catastrophic failures avoided YTD</div>
        </div>

      </div>

    </div>
  );
}

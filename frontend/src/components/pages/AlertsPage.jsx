import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Filter, 
  Search, 
  Clock, 
  Wrench, 
  ExternalLink, 
  Check, 
  X,
  ChevronRight
} from 'lucide-react';
import { alertsList } from '../../data/mockData';

export default function AlertsPage({ setActiveTab }) {
  const [alerts, setAlerts] = useState(alertsList);
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const severities = ['ALL', 'CRITICAL', 'HIGH', 'WARNING', 'INFO'];

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSeverity = selectedSeverity === 'ALL' || alert.severity === selectedSeverity;
    const matchesSearch = 
      alert.machineId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.line.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  const handleAcknowledge = (id) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'ACKNOWLEDGED' } : a))
    );
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-red-600 to-amber-600 text-white shadow-md shadow-red-500/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              Industrial Incident & Alert Management Hub
            </h1>
            <p className="text-slate-500 text-xs">
              Real-time anomaly queues with severity indicators and AI recommended actions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-red-700 bg-red-50 px-3 py-1.5 rounded-xl border border-red-200">
            Active Alerts: <strong>{alerts.filter(a => a.status !== 'RESOLVED').length} Open</strong>
          </span>
        </div>
      </div>

      {/* Severity Color Indicators Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'CRITICAL (RED)', count: alerts.filter(a => a.severity === 'CRITICAL').length, color: 'border-red-300 bg-red-50 text-red-700', badge: 'bg-red-600' },
          { label: 'HIGH (ORANGE)', count: alerts.filter(a => a.severity === 'HIGH').length, color: 'border-orange-300 bg-orange-50 text-orange-700', badge: 'bg-orange-500' },
          { label: 'WARNING (YELLOW)', count: alerts.filter(a => a.severity === 'WARNING').length, color: 'border-amber-300 bg-amber-50 text-amber-800', badge: 'bg-amber-500' },
          { label: 'INFO (GREEN)', count: alerts.filter(a => a.severity === 'INFO').length, color: 'border-emerald-300 bg-emerald-50 text-emerald-700', badge: 'bg-emerald-500' },
        ].map((item, idx) => (
          <div key={idx} className={`p-3.5 rounded-xl border ${item.color} shadow-sm flex items-center justify-between`}>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${item.badge}`} />
              <span className="text-xs font-bold">{item.label}</span>
            </div>
            <span className="font-mono font-extrabold text-sm">{item.count}</span>
          </div>
        ))}
      </div>

      {/* Search & Severity Filter Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Machine ID, plant line, alert title..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-slate-800"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            {severities.map((sev) => (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
                  selectedSeverity === sev
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

        </div>

        {/* Alert Cards Stream */}
        <div className="space-y-3">
          {filteredAlerts.map((alert) => {
            const isRed = alert.severityCode === 'RED';
            const isOrange = alert.severityCode === 'ORANGE';
            const isYellow = alert.severityCode === 'YELLOW';
            const isGreen = alert.severityCode === 'GREEN';

            return (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border transition-all ${
                  isRed ? 'border-red-200 bg-red-50/40 hover:bg-red-50/70' :
                  isOrange ? 'border-orange-200 bg-orange-50/40 hover:bg-orange-50/70' :
                  isYellow ? 'border-amber-200 bg-amber-50/30 hover:bg-amber-50/60' :
                  'border-emerald-200 bg-emerald-50/30 hover:bg-emerald-50/60'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  
                  {/* Left Metadata */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        isRed ? 'bg-red-600 text-white border-red-700' :
                        isOrange ? 'bg-orange-500 text-white border-orange-600' :
                        isYellow ? 'bg-amber-500 text-white border-amber-600' :
                        'bg-emerald-600 text-white border-emerald-700'
                      }`}>
                        {alert.severity}
                      </span>

                      <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {alert.machineId}
                      </span>

                      <span className="text-slate-500 text-xs">• {alert.machineName} ({alert.line})</span>
                      <span className="text-slate-400 text-xs font-mono">[{alert.timestamp}]</span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">
                      {alert.title}
                    </h3>

                    <p className="text-slate-600 text-xs">
                      {alert.description}
                    </p>

                    {/* Recommended Action Card */}
                    <div className="p-2.5 rounded-lg bg-white/90 border border-slate-200 mt-2 text-xs space-y-0.5">
                      <span className="text-[10px] font-bold uppercase text-blue-700 block">
                        AI Recommended Action:
                      </span>
                      <p className="text-slate-800 font-medium">
                        {alert.recommendedAction}
                      </p>
                    </div>
                  </div>

                  {/* Right Action Triggers */}
                  <div className="flex md:flex-col items-center gap-2 shrink-0">
                    <button
                      onClick={() => setActiveTab('digital-twin')}
                      className="w-full py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1 shadow-sm"
                    >
                      <span>View Twin</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    {alert.status !== 'ACKNOWLEDGED' ? (
                      <button
                        onClick={() => handleAcknowledge(alert.id)}
                        className="w-full py-1.5 px-3 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Acknowledge</span>
                      </button>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200">
                        ACKNOWLEDGED
                      </span>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

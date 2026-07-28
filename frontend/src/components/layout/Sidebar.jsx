import React from 'react';
import { 
  LayoutDashboard, 
  Library,
  Box, 
  Bot, 
  FileText, 
  BarChart3, 
  AlertTriangle, 
  Radio, 
  Layers, 
  Activity,
  Zap,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      subtitle: 'Factory Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'digital-twin-library',
      label: 'Digital Twin Library',
      subtitle: 'Enterprise Asset Portal',
      icon: Library,
      badge: 'NEW',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      id: 'digital-twin',
      label: 'Digital Twin',
      subtitle: 'Interactive 3D Asset Viewer',
      icon: Box,
      badge: 'MAIN FEATURE',
      highlight: true,
    },
    {
      id: 'ai-assistant',
      label: 'AI Assistant',
      subtitle: 'Engineer Copilot',
      icon: Bot,
      badge: 'RAG ON',
    },
    {
      id: 'documents',
      label: 'Documents',
      subtitle: 'Manuals & SOP Hub',
      icon: FileText,
      badge: null,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      subtitle: 'OEE & Downtime Intelligence',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'alerts',
      label: 'Alerts',
      subtitle: 'Industrial Incident Queue',
      icon: AlertTriangle,
      badge: '6 OPEN',
      badgeColor: 'bg-red-100 text-red-700 border-red-200',
    },
  ];

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col justify-between h-[calc(100vh-57px)] sticky top-[57px]">
      
      {/* Navigation List */}
      <div className="p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Navigation Modules
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all duration-150 group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-semibold'
                  : item.highlight
                  ? 'bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 text-blue-900 border border-blue-200/80'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-2 rounded-lg ${
                  isActive 
                    ? 'bg-white/20 text-white' 
                    : item.highlight 
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 group-hover:bg-white group-hover:text-blue-600'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="text-xs tracking-tight">{item.label}</div>
                  <div className={`text-[10px] truncate ${
                    isActive ? 'text-blue-100' : 'text-slate-400'
                  }`}>
                    {item.subtitle}
                  </div>
                </div>
              </div>

              {item.badge && (
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                  isActive 
                    ? 'bg-white/20 text-white border-white/30'
                    : item.badgeColor || 'bg-cyan-100 text-cyan-800 border-cyan-200'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Industrial Protocol Status Box */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/80">
        <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              OPC-UA Telemetry
            </span>
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              CONNECTED
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Sensor Network Latency</span>
              <span className="font-mono text-slate-800 font-medium">12 ms</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 w-[92%]" />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
            <span>Active Data Stream:</span>
            <span className="font-mono font-bold text-slate-800">1,420 Hz</span>
          </div>
        </div>
      </div>

    </aside>
  );
}

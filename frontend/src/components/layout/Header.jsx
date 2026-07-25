import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Bell, 
  Search, 
  Globe, 
  ChevronDown, 
  ShieldCheck, 
  Clock, 
  Cpu, 
  LogOut,
  Lock,
  UserCheck
} from 'lucide-react';
import { plantInfo } from '../../data/mockData';

export default function Header({ activeTab, setActiveTab, alertCount = 6, currentUser, onSignOut }) {
  const [timeStr, setTimeStr] = useState('');
  const [selectedPlant, setSelectedPlant] = useState(plantInfo.name);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toISOString().substring(11, 19) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 lg:px-6 py-2.5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        
        {/* Left Section: Logo & Brand (v4.2 PRO badge removed as requested) */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 text-white shadow-md shadow-blue-500/20">
              <Cpu className="w-5 h-5 text-cyan-200 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  TwinMind<span className="text-blue-600">.AI</span>
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 tracking-wide">
                Enterprise Industrial Digital Twin Platform
              </p>
            </div>
          </div>

          {/* Plant Selector */}
          <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-200">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100/80 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 transition-colors">
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>{selectedPlant}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>4 Warnings</span>
            </div>
          </div>
        </div>

        {/* Center: Quick Search Bar */}
        <div className="hidden xl:flex items-center max-w-md w-full">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search assets (e.g. SIEM-UNIT1), SOP manuals, telemetry..."
              className="w-full pl-9 pr-12 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg text-slate-800 placeholder-slate-400 outline-none transition-all"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-medium text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded">
              ⌘K
            </span>
          </div>
        </div>

        {/* Right Section: UTC Clock, Alerts, Profile & Lock Control Station */}
        <div className="flex items-center gap-3">
          
          {/* UTC Clock Display */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-cyan-600" />
            <span>{timeStr || '14:15:32 UTC'}</span>
          </div>

          {/* Quick Alert Bell */}
          <button 
            onClick={() => setActiveTab('alerts')}
            className="relative p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
            title="Industrial Alerts"
          >
            <Bell className="w-4 h-4" />
            {alertCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold shadow-sm">
                {alertCount}
              </span>
            )}
          </button>

          {/* User Profile Chip (User name updated to Akash) */}
          <div className="relative border-l border-slate-200 pl-2">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 text-white font-black text-xs flex items-center justify-center shadow-sm">
                AK
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-bold text-slate-900 leading-tight flex items-center gap-1">
                  <span>Akash</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>
                <div className="text-[10px] font-semibold text-blue-600">
                  {currentUser?.role || 'Reliability Engineer'}
                </div>
              </div>
            </button>

            {/* Profile Menu Dropdown */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-50 text-xs space-y-1">
                <div className="px-3 py-2 border-b border-slate-100">
                  <div className="font-bold text-slate-900">Akash</div>
                  <div className="text-[10px] font-mono text-slate-500">{currentUser?.email || 'akash@twinmind.ai'}</div>
                  <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px]">
                    <UserCheck className="w-3 h-3" /> {currentUser?.role || 'Reliability Engineer'}
                  </div>
                </div>

                {onSignOut && (
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onSignOut();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 font-bold transition-colors"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Lock Control Station</span>
                  </button>
                )}
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}

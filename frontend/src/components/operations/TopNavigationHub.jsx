import React, { useState, useEffect } from 'react';
import {
  Activity,
  Box,
  BarChart2,
  FileText,
  Wrench,
  Search,
  Bell,
  HelpCircle,
  User,
  Radio,
  Layers,
  Thermometer
} from 'lucide-react';

export default function TopNavigationHub({
  plantOverview,
  viewMode,
  onChangeViewMode,
  cameraPreset,
  onChangeCameraPreset,
  isDroneTour,
  onToggleDroneTour,
  isAutoRotate,
  onToggleAutoRotate,
  isSimulating,
  onToggleSimulation,
  overallHealth = 95.2,
  activeAlertCount = 3,
}) {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [activeTab, setActiveTab] = useState('Overview');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toTimeString().substring(0, 8));
      setCurrentDate(
        now.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const navTabs = [
    { id: 'Overview', label: 'Overview', icon: Activity },
    { id: 'Assets', label: 'Assets', icon: Box },
    { id: 'Analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'Reports', label: 'Reports', icon: FileText },
    { id: 'Maintenance', label: 'Maintenance', icon: Wrench },
  ];

  return (
    <header className="absolute top-3.5 left-3.5 right-3.5 z-30 pointer-events-auto select-none">
      <div className="glass-card-white rounded-2xl px-5 py-3 shadow-md flex items-center justify-between gap-4 max-w-[1920px] mx-auto border border-[#d8e6ff]">
        {/* Left Section: Branding & Plant Info */}
        <div className="flex items-center gap-6">
          {/* Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#1e88e5] to-[#1565c0] text-white shadow-md shadow-blue-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight text-[#1e293b] flex items-center gap-1.5">
                <span>TWINMIND AI</span>
              </div>
              <p className="text-[11px] font-medium text-[#64748b]">
                Smart Operations Center
              </p>
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="hidden xl:block h-7 w-[1px] bg-[#e2edff]" />

          {/* Plant Selector */}
          <div className="hidden xl:block">
            <div className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider">
              Plant
            </div>
            <div className="text-xs font-bold text-[#1e293b]">GigaFactory 04</div>
            <div className="text-[10px] text-[#64748b]">
              Smart Refining & Manufacturing Complex
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="hidden 2xl:block h-7 w-[1px] bg-[#e2edff]" />

          {/* Time UTC */}
          <div className="hidden 2xl:block">
            <div className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider">
              Time (UTC)
            </div>
            <div className="text-xs font-bold text-[#1e293b] font-mono">
              {currentTime || '07:20:12'}
            </div>
            <div className="text-[10px] text-[#64748b]">{currentDate || 'May 16, 2025'}</div>
          </div>

          {/* Shift */}
          <div className="hidden 2xl:block">
            <div className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider">
              Shift
            </div>
            <div className="text-xs font-bold text-[#1e293b]">ALPHA</div>
            <div className="text-[10px] text-[#64748b]">06:00 - 14:00</div>
          </div>
        </div>

        {/* Center: Navigation View Tabs */}
        <div className="flex items-center gap-1 bg-[#edf4ff] p-1 rounded-xl border border-[#d8e6ff]">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'Overview') {
                    onChangeCameraPreset('overview');
                  } else if (tab.id === 'Assets') {
                    onChangeCameraPreset('refinery');
                  } else if (tab.id === 'Maintenance') {
                    onChangeCameraPreset('assembly');
                  }
                }}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#1e88e5] text-white shadow-sm font-bold'
                    : 'text-[#475569] hover:text-[#1e88e5] hover:bg-white/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#64748b]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Section: Live Stream, View Modes & User Avatar */}
        <div className="flex items-center gap-3.5">
          {/* Live Stream Indicator Pill */}
          <button
            onClick={onToggleSimulation}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#ecfdf5] border border-[#a7f3d0] text-[#065f46] shadow-sm transition-all hover:bg-[#d1fae5]"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#22c55e]" />
            </span>
            <div className="text-left">
              <div className="text-[10px] font-bold tracking-tight">LIVE STREAM</div>
              <div className="text-[9px] text-[#047857]">All Systems Online</div>
            </div>
          </button>

          {/* Quick View Mode Toggle Dropdown */}
          <div className="hidden lg:flex items-center gap-1 bg-[#edf4ff] p-1 rounded-xl border border-[#d8e6ff]">
            <button
              onClick={() => onChangeViewMode('CAD')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'CAD'
                  ? 'bg-white text-[#1e88e5] shadow-xs font-bold'
                  : 'text-[#64748b] hover:text-[#1e293b]'
              }`}
            >
              Daylight 3D
            </button>
            <button
              onClick={() => onChangeViewMode('HOLOGRAM')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'HOLOGRAM'
                  ? 'bg-white text-[#1e88e5] shadow-xs font-bold'
                  : 'text-[#64748b] hover:text-[#1e293b]'
              }`}
            >
              Hologram
            </button>
            <button
              onClick={() => onChangeViewMode('THERMAL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'THERMAL'
                  ? 'bg-white text-[#1e88e5] shadow-xs font-bold'
                  : 'text-[#64748b] hover:text-[#1e293b]'
              }`}
            >
              Thermal
            </button>
          </div>

          {/* Drone Tour Button */}
          <button
            onClick={onToggleDroneTour}
            className={`p-2 rounded-xl border transition-all ${
              isDroneTour
                ? 'bg-[#1e88e5] text-white border-[#1e88e5] shadow-sm'
                : 'bg-white text-[#64748b] hover:text-[#1e88e5] border-[#d8e6ff]'
            }`}
            title="360° Drone Tour"
          >
            <Radio className="w-4 h-4" />
          </button>

          {/* Action Icons */}
          <button className="p-2 rounded-xl bg-white hover:bg-[#edf4ff] text-[#64748b] hover:text-[#1e88e5] border border-[#d8e6ff] transition-all">
            <Search className="w-4 h-4" />
          </button>

          <button className="p-2 rounded-xl bg-white hover:bg-[#edf4ff] text-[#64748b] hover:text-[#1e88e5] border border-[#d8e6ff] relative transition-all">
            <Bell className="w-4 h-4" />
            {activeAlertCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#1e88e5] text-white text-[9px] font-bold flex items-center justify-center border-2 border-white shadow-xs">
                {activeAlertCount}
              </span>
            )}
          </button>

          <button className="p-2 rounded-xl bg-white hover:bg-[#edf4ff] text-[#64748b] hover:text-[#1e88e5] border border-[#d8e6ff] transition-all">
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* User Profile Avatar */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#e2edff]">
            <div className="w-8 h-8 rounded-full bg-[#1e88e5]/15 border border-[#1e88e5]/30 flex items-center justify-center text-[#1e88e5] font-bold text-xs">
              AD
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-xs font-bold text-[#1e293b] leading-none">Admin</div>
              <div className="text-[10px] text-[#64748b] leading-tight mt-0.5">
                Operations Lead
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

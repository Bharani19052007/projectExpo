import React, { useState } from 'react';
import {
  Search,
  Flame,
  Database,
  Wind,
  Cpu,
  Zap,
  Truck,
  TrendingUp,
  TrendingDown,
  Droplets,
  Activity,
  ChevronDown,
  ChevronRight,
  Cloud
} from 'lucide-react';

export default function LeftTelemetryPanel({
  assets = [],
  selectedAsset,
  onSelectAsset,
  onSelectSector,
  productionStats,
  utilitiesData,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSector, setExpandedSector] = useState(null);

  const sectors = [
    {
      id: 'refinery',
      name: 'Refinery & Hydrocracker',
      count: 12,
      icon: Flame,
      color: '#f97316',
      assetIds: ['REACT-CAT-01', 'COL-DIST-01', 'FURN-CRU-01', 'FLARE-STK-01'],
    },
    {
      id: 'storage',
      name: 'Storage Depot & Spheres',
      count: 8,
      icon: Database,
      color: '#3b82f6',
      assetIds: ['SPHERE-LPG-01', 'SPHERE-LPG-02', 'TANK-CYL-01', 'SILO-POLY-01'],
    },
    {
      id: 'utilities',
      name: 'Cooling & Steam Utilities',
      count: 6,
      icon: Wind,
      color: '#06b6d4',
      assetIds: ['COOL-TWR-01', 'BOILER-STM-01', 'COMP-AIR-01'],
    },
    {
      id: 'assembly',
      name: 'Robotic Assembly Unit',
      count: 5,
      icon: Cpu,
      color: '#8b5cf6',
      assetIds: ['ROB-WELD-01', 'CONV-MAIN-01', 'CNC-MILL-01', 'AUTO-PACK-01'],
    },
    {
      id: 'substation',
      name: 'Electrical Substation',
      count: 4,
      icon: Zap,
      color: '#eab308',
      assetIds: ['SUB-XFRM-01', 'GRID-PYL-01', 'SWITCH-HV-01'],
    },
    {
      id: 'logistics',
      name: 'Logistics & Fleets',
      count: 3,
      icon: Truck,
      color: '#10b981',
      assetIds: ['AGV-UNIT-01', 'AGV-UNIT-02', 'GANTRY-LOAD-01', 'TRUCK-DOCK-01'],
    },
  ];

  const filteredAssets = assets.filter((asset) => {
    return (
      asset.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.tag?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.id?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="absolute top-20 left-3.5 bottom-24 w-[330px] z-20 pointer-events-auto flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-1 select-none">
      {/* ======================================================== */}
      {/* 1. PLANT HEALTH OVERVIEW CARD */}
      {/* ======================================================== */}
      <div className="glass-card-white rounded-2xl p-4 shadow-sm border border-[#d8e6ff]">
        <h2 className="text-xs font-bold font-sans tracking-wide text-[#1e293b] uppercase mb-3 flex items-center gap-1.5">
          <span className="w-1.5 h-3.5 bg-[#1e88e5] rounded-full" />
          PLANT HEALTH OVERVIEW
        </h2>

        <div className="grid grid-cols-12 gap-3 items-center">
          {/* Left Donut Gauge */}
          <div className="col-span-5 flex flex-col items-center justify-center text-center">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  stroke="#e2edff"
                  strokeWidth="5"
                  fill="transparent"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  stroke="url(#healthGrad)"
                  strokeWidth="5"
                  strokeDasharray="163.36"
                  strokeDashoffset={163.36 * (1 - 0.952)}
                  strokeLinecap="round"
                  fill="transparent"
                />
                <defs>
                  <linearGradient id="healthGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00b8ff" />
                    <stop offset="100%" stopColor="#22c55e" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm font-black font-sans text-[#1e293b]">95.2%</span>
                <span className="text-[8px] font-medium text-[#64748b]">Overall Health</span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-[#15803d] bg-[#dcfce7] px-2 py-0.5 rounded-full mt-1.5 border border-[#bbf7d0]">
              Excellent
            </span>
          </div>

          {/* Right Metrics Progress Bars */}
          <div className="col-span-7 space-y-2 font-sans text-[11px]">
            <div>
              <div className="flex justify-between font-semibold text-[#475569] mb-0.5">
                <span>Utilization</span>
                <span className="font-bold text-[#1e293b]">78.6%</span>
              </div>
              <div className="w-full h-1.5 bg-[#edf4ff] rounded-full overflow-hidden">
                <div className="h-full bg-[#1e88e5] rounded-full" style={{ width: '78.6%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-[#475569] mb-0.5">
                <span>Efficiency</span>
                <span className="font-bold text-[#1e293b]">91.3%</span>
              </div>
              <div className="w-full h-1.5 bg-[#edf4ff] rounded-full overflow-hidden">
                <div className="h-full bg-[#00b8ff] rounded-full" style={{ width: '91.3%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-[#475569] mb-0.5">
                <span>Reliability</span>
                <span className="font-bold text-[#1e293b]">93.1%</span>
              </div>
              <div className="w-full h-1.5 bg-[#edf4ff] rounded-full overflow-hidden">
                <div className="h-full bg-[#3b82f6] rounded-full" style={{ width: '93.1%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-[#475569] mb-0.5">
                <span>Safety</span>
                <span className="font-bold text-[#1e293b]">96.5%</span>
              </div>
              <div className="w-full h-1.5 bg-[#edf4ff] rounded-full overflow-hidden">
                <div className="h-full bg-[#22c55e] rounded-full" style={{ width: '96.5%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. KEY PERFORMANCE INDICATORS CARD */}
      {/* ======================================================== */}
      <div className="glass-card-white rounded-2xl p-4 shadow-sm border border-[#d8e6ff]">
        <h2 className="text-xs font-bold font-sans tracking-wide text-[#1e293b] uppercase mb-3 flex items-center gap-1.5">
          <span className="w-1.5 h-3.5 bg-[#1e88e5] rounded-full" />
          KEY PERFORMANCE INDICATORS
        </h2>

        <div className="space-y-2.5 text-xs font-sans">
          {/* Production Output */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#f8faff] border border-[#e8f1ff] hover:bg-white transition-all">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#dbeafe] text-[#1e88e5]">
                <Activity className="w-3.5 h-3.5" />
              </div>
              <span className="font-medium text-[#475569]">Production Output</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#1e293b]">18,450 <span className="text-[10px] text-[#64748b] font-normal">bbl/hr</span></span>
              <span className="flex items-center text-[10px] font-bold text-[#15803d] bg-[#dcfce7] px-1.5 py-0.5 rounded border border-[#bbf7d0]">
                ▲ 8.4%
              </span>
            </div>
          </div>

          {/* Energy Consumption */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#f8faff] border border-[#e8f1ff] hover:bg-white transition-all">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#fef3c7] text-[#d97706]">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <span className="font-medium text-[#475569]">Energy Consumption</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#1e293b]">14.8 <span className="text-[10px] text-[#64748b] font-normal">MW</span></span>
              <span className="flex items-center text-[10px] font-bold text-[#15803d] bg-[#dcfce7] px-1.5 py-0.5 rounded border border-[#bbf7d0]">
                ▼ 3.2%
              </span>
            </div>
          </div>

          {/* Water Consumption */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#f8faff] border border-[#e8f1ff] hover:bg-white transition-all">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#e0f2fe] text-[#0284c7]">
                <Droplets className="w-3.5 h-3.5" />
              </div>
              <span className="font-medium text-[#475569]">Water Consumption</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#1e293b]">44 <span className="text-[10px] text-[#64748b] font-normal">m³/hr</span></span>
              <span className="flex items-center text-[10px] font-bold text-[#15803d] bg-[#dcfce7] px-1.5 py-0.5 rounded border border-[#bbf7d0]">
                ▼ 2.1%
              </span>
            </div>
          </div>

          {/* Carbon Emissions */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#f8faff] border border-[#e8f1ff] hover:bg-white transition-all">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#f1f5f9] text-[#475569]">
                <Cloud className="w-3.5 h-3.5" />
              </div>
              <span className="font-medium text-[#475569]">Carbon Emissions</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#1e293b]">126 <span className="text-[10px] text-[#64748b] font-normal">tCO₂/hr</span></span>
              <span className="flex items-center text-[10px] font-bold text-[#15803d] bg-[#dcfce7] px-1.5 py-0.5 rounded border border-[#bbf7d0]">
                ▼ 4.7%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. PLANT SECTORS CARD */}
      {/* ======================================================== */}
      <div className="glass-card-white rounded-2xl p-4 shadow-sm border border-[#d8e6ff] flex-1 flex flex-col min-h-[220px]">
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-xs font-bold font-sans tracking-wide text-[#1e293b] uppercase flex items-center gap-1.5">
            <span className="w-1.5 h-3.5 bg-[#1e88e5] rounded-full" />
            PLANT SECTORS
          </h2>
          <span className="text-[10px] font-bold text-[#1e88e5] bg-[#edf4ff] px-2 py-0.5 rounded-md border border-[#d8e6ff]">
            All (28) ▾
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative mb-2.5">
          <Search className="w-3.5 h-3.5 text-[#94a3b8] absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search sector, asset, equipment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#f8faff] border border-[#d8e6ff] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:border-[#1e88e5] transition-all"
          />
        </div>

        {/* Sectors List */}
        <div className="space-y-1.5 overflow-y-auto custom-scrollbar flex-1">
          {sectors.map((sector) => {
            const Icon = sector.icon;
            const isExpanded = expandedSector === sector.id;
            const sectorAssets = filteredAssets.filter(
              (a) => a.sector === `sec-${sector.id}` || sector.assetIds.includes(a.id)
            );

            return (
              <div key={sector.id} className="rounded-xl overflow-hidden border border-[#eaf2ff] bg-white transition-all">
                <button
                  onClick={() => {
                    setExpandedSector(isExpanded ? null : sector.id);
                    onSelectSector?.(sector.id);
                  }}
                  className="w-full p-2 flex items-center justify-between hover:bg-[#f5f9ff] transition-all text-left"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-[#edf4ff]" style={{ color: sector.color }}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#1e293b] leading-tight">
                        {sector.name}
                      </div>
                      <div className="text-[10px] text-[#64748b]">{sector.count} Assets</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
                    <ChevronRight
                      className={`w-3.5 h-3.5 text-[#94a3b8] transition-transform ${
                        isExpanded ? 'rotate-90' : ''
                      }`}
                    />
                  </div>
                </button>

                {/* Expanded Sub-Assets */}
                {isExpanded && (
                  <div className="p-1.5 space-y-1 bg-[#f8faff] border-t border-[#edf4ff]">
                    {sectorAssets.map((asset) => {
                      const isSelected = selectedAsset?.id === asset.id;
                      return (
                        <div
                          key={asset.id}
                          onClick={() => onSelectAsset(asset.id)}
                          className={`p-1.5 px-2 rounded-lg cursor-pointer flex items-center justify-between text-xs transition-all ${
                            isSelected
                              ? 'bg-[#1e88e5] text-white shadow-xs'
                              : 'hover:bg-white text-[#334155]'
                          }`}
                        >
                          <div className="truncate max-w-[170px]">
                            <div className="font-bold text-[11px]">{asset.name}</div>
                            <div className={`text-[9px] ${isSelected ? 'text-white/80' : 'text-[#64748b]'}`}>
                              {asset.tag || asset.id}
                            </div>
                          </div>
                          <span className="text-[10px] font-bold">
                            {asset.healthScore}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

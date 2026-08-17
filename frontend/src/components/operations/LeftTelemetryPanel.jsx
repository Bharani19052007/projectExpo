import React from 'react';
import {
  Factory,
  Layers,
  Cpu,
  Flame,
  Bot,
  Activity,
  Zap,
  Warehouse,
  FlaskConical,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Wrench,
  ChevronRight
} from 'lucide-react';
import { plantOverview } from '../../data/plantAssetsData';

export default function LeftTelemetryPanel({
  selectedSector,
  onSelectSector,
  selectedBuildingId,
  onSelectBuilding,
}) {
  const sectors = plantOverview.sectors;

  const getSectorIcon = (code) => {
    switch (code) {
      case 'BLD-01':
        return Factory;
      case 'BLD-02':
        return Bot;
      case 'BLD-03':
        return Cpu;
      case 'BLD-04':
        return Flame;
      case 'BLD-06':
        return Zap;
      case 'BLD-07':
        return Warehouse;
      case 'BLD-08':
        return FlaskConical;
      case 'BLD-09':
        return Truck;
      default:
        return Factory;
    }
  };

  return (
    <aside className="absolute top-[108px] left-3.5 bottom-28 w-[280px] z-30 pointer-events-auto select-none font-sans flex flex-col gap-3">
      {/* 1. PLANT OVERVIEW CARD */}
      <div className="glass-card-white rounded-2xl p-3.5 shadow-md border border-[#d8e6ff]">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#edf4ff]">
          <h2 className="text-xs font-bold font-sans tracking-wide text-[#0f172a] uppercase flex items-center gap-1.5">
            <span className="w-1.5 h-3.5 bg-[#1976d2] rounded-full" />
            PLANT OVERVIEW
          </h2>
        </div>

        {/* Campus Overview Aerial Preview */}
        <div className="w-full h-24 rounded-xl mb-3 overflow-hidden relative border border-[#d8e6ff] bg-gradient-to-br from-[#dbeafe] to-[#bfdbfe] flex items-center justify-center">
          <div className="absolute inset-0 bg-[#0f172a]/10 backdrop-blur-2xs" />
          <div className="relative text-center">
            <Factory className="w-8 h-8 text-[#1976d2] mx-auto mb-1 opacity-85" />
            <span className="text-[10px] font-bold text-[#0f172a]">
              Munich GigaFactory Campus
            </span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between py-0.5 border-b border-[#f1f5f9]">
            <span className="text-[#64748b]">Total Buildings</span>
            <span className="font-extrabold text-[#0f172a]">
              {plantOverview.totalBuildings}
            </span>
          </div>

          <div className="flex items-center justify-between py-0.5 border-b border-[#f1f5f9]">
            <span className="text-[#64748b]">Total Machines</span>
            <span className="font-extrabold text-[#0f172a]">
              {plantOverview.totalMachines}
            </span>
          </div>

          <div className="flex items-center justify-between py-0.5">
            <span className="text-[#64748b] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Running
            </span>
            <span className="font-bold text-emerald-600">
              {plantOverview.statusBreakdown.running}
            </span>
          </div>

          <div className="flex items-center justify-between py-0.5">
            <span className="text-[#64748b] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Idle
            </span>
            <span className="font-bold text-amber-600">
              {plantOverview.statusBreakdown.idle}
            </span>
          </div>

          <div className="flex items-center justify-between py-0.5">
            <span className="text-[#64748b] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              Maintenance
            </span>
            <span className="font-bold text-orange-600">
              {plantOverview.statusBreakdown.maintenance}
            </span>
          </div>

          <div className="flex items-center justify-between py-0.5">
            <span className="text-[#64748b] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Offline
            </span>
            <span className="font-bold text-rose-600">
              {plantOverview.statusBreakdown.offline}
            </span>
          </div>
        </div>
      </div>

      {/* 2. SECTORS LIST CARD */}
      <div className="glass-card-white rounded-2xl p-3.5 shadow-md border border-[#d8e6ff] flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#edf4ff]">
          <h2 className="text-xs font-bold font-sans tracking-wide text-[#0f172a] uppercase flex items-center gap-1.5">
            <span className="w-1.5 h-3.5 bg-[#1976d2] rounded-full" />
            SECTORS
          </h2>
        </div>

        {/* Scrollable Sector Items */}
        <div className="space-y-1.5 overflow-y-auto custom-scrollbar flex-1 pr-1">
          {sectors.map((sec) => {
            const Icon = getSectorIcon(sec.code);
            const isSelected =
              selectedSector === sec.cameraPreset ||
              selectedBuildingId === sec.buildingId;

            return (
              <div
                key={sec.id}
                onClick={() => {
                  onSelectSector?.(sec.cameraPreset);
                  if (sec.buildingId) onSelectBuilding?.(sec.buildingId);
                }}
                className={`p-2 rounded-xl transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-[#edf4ff] border border-[#1976d2] shadow-xs'
                    : 'bg-white hover:bg-[#f8faff] border border-[#edf4ff]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-[#edf4ff] text-[#1976d2]">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#0f172a]">
                      {sec.name}
                    </div>
                    <div className="text-[10px] text-[#64748b]">
                      {sec.assetCount} Assets
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-extrabold text-emerald-600">
                    {sec.health}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

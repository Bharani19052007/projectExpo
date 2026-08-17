import React, { useState, useMemo } from 'react';
import { 
  Library, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Box, 
  Cpu, 
  Activity, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink, 
  Building2, 
  MapPin, 
  Zap, 
  SlidersHorizontal,
  RefreshCw,
  Layers,
  Flame,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { allIndustrialMachines } from '../../data/mockData';

// Helper functions for enterprise asset metadata extraction & fallback defaults
function getCleanManufacturer(machine) {
  if (machine.manufacturer) {
    const mfg = machine.manufacturer;
    if (mfg.includes('Siemens')) return 'Siemens';
    if (mfg.includes('ABB')) return 'ABB';
    if (mfg.includes('Bosch')) return 'Bosch';
    if (mfg.includes('Schneider')) return 'Schneider';
    if (mfg.includes('Ingersoll')) return 'Ingersoll Rand';
    if (mfg.includes('KSB')) return 'KSB';
    if (mfg.includes('Cleaver')) return 'Cleaver-Brooks';
    if (mfg.includes('KUKA')) return 'KUKA';
    if (mfg.includes('Schuler')) return 'Schuler';
    return mfg;
  }
  if (machine.id.includes('SIEM') || machine.id.includes('MTR')) return 'Siemens';
  if (machine.id.includes('ABB')) return 'ABB';
  if (machine.id.includes('BOSCH')) return 'Bosch';
  if (machine.id.includes('SCHN')) return 'Schneider';
  if (machine.id.includes('INGERSOLL') || machine.id.includes('COMP')) return 'Ingersoll Rand';
  if (machine.id.includes('KSB') || machine.id.includes('PUMP')) return 'KSB';
  if (machine.id.includes('CLEAVER') || machine.id.includes('BOILER')) return 'Cleaver-Brooks';
  if (machine.id.includes('KUKA') || machine.id.includes('WELD')) return 'KUKA';
  if (machine.id.includes('PRESS') || machine.id.includes('SCHULER')) return 'Schuler';
  return 'Siemens';
}

function getPlantLocation(machine) {
  if (machine.plant) return machine.plant;
  const id = machine.id || '';
  if (id.includes('MTR') || id.includes('UNIT1') || id.includes('UNIT2')) return 'Munich HQ';
  if (id.includes('ABB') || id.includes('BOSCH')) return 'Stuttgart Plant';
  if (id.includes('SCHN')) return 'Berlin Hub';
  if (id.includes('COMP') || id.includes('INGERSOLL')) return 'Frankfurt Utility';
  if (id.includes('PUMP') || id.includes('KSB')) return 'Hamburg Station';
  if (id.includes('BOILER') || id.includes('CLEAVER')) return 'Cologne Plant';
  if (id.includes('CNC')) return 'Leipzig Machine Shop';
  if (id.includes('WELD') || id.includes('KUKA')) return 'Dresden Body Shop';
  if (id.includes('PRESS')) return 'Munich Press Hall';
  return 'Munich HQ';
}

function getRunningHours(machine) {
  if (machine.runningHours) return machine.runningHours;
  if (machine.operatingHours) return machine.operatingHours;
  const id = machine.id || '';
  if (id.includes('MTR')) return 12400;
  if (id.includes('UNIT1')) return 14280;
  if (id.includes('UNIT2')) return 8420;
  if (id.includes('ABB')) return 11800;
  if (id.includes('BOSCH')) return 21500;
  if (id.includes('SCHN')) return 8900;
  if (id.includes('COMP')) return 15400;
  if (id.includes('PUMP')) return 12600;
  if (id.includes('BOILER')) return 18200;
  if (id.includes('CNC')) return 9320;
  if (id.includes('WELD')) return 13800;
  if (id.includes('PRESS')) return 9800;
  return 12400;
}

function getLastMaintenance(machine) {
  if (machine.lastMaintenance) return machine.lastMaintenance;
  const id = machine.id || '';
  if (id.includes('MTR')) return '2026-04-10';
  if (id.includes('UNIT1')) return '2026-05-14';
  if (id.includes('UNIT2')) return '2026-04-10';
  if (id.includes('ABB')) return '2026-03-22';
  if (id.includes('BOSCH')) return '2026-06-01';
  if (id.includes('SCHN')) return '2026-02-18';
  if (id.includes('COMP')) return '2026-05-02';
  if (id.includes('PUMP')) return '2026-04-19';
  if (id.includes('BOILER')) return '2026-01-30';
  if (id.includes('CNC')) return '2026-06-15';
  if (id.includes('WELD')) return '2026-03-08';
  if (id.includes('PRESS')) return '2026-03-12';
  return '2026-05-01';
}

function getNextMaintenance(machine) {
  if (machine.nextMaintenance) return machine.nextMaintenance;
  const id = machine.id || '';
  if (id.includes('MTR')) return '2026-07-15';
  if (id.includes('UNIT1')) return '2026-07-28';
  if (id.includes('UNIT2')) return '2026-08-10';
  if (id.includes('ABB')) return '2026-08-22';
  if (id.includes('BOSCH')) return '2026-09-01';
  if (id.includes('SCHN')) return '2026-08-18';
  if (id.includes('COMP')) return '2026-11-02';
  if (id.includes('PUMP')) return '2026-10-19';
  if (id.includes('BOILER')) return '2026-07-30';
  if (id.includes('CNC')) return '2026-07-25';
  if (id.includes('WELD')) return '2026-08-08';
  if (id.includes('PRESS')) return '2026-10-05';
  return '2026-09-01';
}

function getCriticalAlertsCount(machine) {
  if (machine.criticalAlerts !== undefined) return machine.criticalAlerts;
  const status = (machine.status || '').toUpperCase();
  if (status === 'WARNING') return 1;
  if (status === 'CRITICAL') return 2;
  return 0;
}

function getStatusLabel(machine) {
  const status = (machine.status || '').toUpperCase();
  if (status === 'HEALTHY' || status === 'RUNNING') return 'Running';
  if (status === 'WARNING') return 'Warning';
  if (status === 'CRITICAL') return 'Critical';
  return machine.status || 'Running';
}

export default function DigitalTwinLibraryPage({ onOpenDigitalTwin }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedManufacturer, setSelectedManufacturer] = useState('ALL');
  const [selectedHealth, setSelectedHealth] = useState('ALL');
  const [selectedPlant, setSelectedPlant] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState('HEALTH_DESC');

  // Extract unique options for filter dropdowns dynamically
  const manufacturers = useMemo(() => {
    const set = new Set(allIndustrialMachines.map(m => getCleanManufacturer(m)).filter(Boolean));
    return ['ALL', ...Array.from(set)];
  }, []);

  const plants = useMemo(() => {
    const set = new Set(allIndustrialMachines.map(m => getPlantLocation(m)).filter(Boolean));
    return ['ALL', ...Array.from(set)];
  }, []);

  const categories = useMemo(() => {
    const set = new Set(allIndustrialMachines.map(m => m.category).filter(Boolean));
    return ['ALL', ...Array.from(set)];
  }, []);

  // Filter & Sort Logic
  const filteredMachines = useMemo(() => {
    return allIndustrialMachines.filter(machine => {
      const mfg = getCleanManufacturer(machine);
      const plant = getPlantLocation(machine);
      const statusLabel = getStatusLabel(machine);

      // Search Query
      const query = searchQuery.toLowerCase().trim();
      if (query) {
        const matchesName = machine.name.toLowerCase().includes(query);
        const matchesId = machine.id.toLowerCase().includes(query);
        const matchesMfg = mfg.toLowerCase().includes(query) || (machine.manufacturer || '').toLowerCase().includes(query);
        const matchesPlant = plant.toLowerCase().includes(query);
        const matchesLoc = machine.location?.toLowerCase().includes(query);
        const matchesCat = machine.category?.toLowerCase().includes(query);
        if (!matchesName && !matchesId && !matchesMfg && !matchesPlant && !matchesLoc && !matchesCat) {
          return false;
        }
      }

      // Manufacturer Filter
      if (selectedManufacturer !== 'ALL' && mfg !== selectedManufacturer) {
        return false;
      }

      // Plant Filter
      if (selectedPlant !== 'ALL' && plant !== selectedPlant) {
        return false;
      }

      // Category Filter
      if (selectedCategory !== 'ALL' && machine.category !== selectedCategory) {
        return false;
      }

      // Status Filter
      if (selectedStatus !== 'ALL') {
        if (selectedStatus.toUpperCase() !== statusLabel.toUpperCase()) {
          return false;
        }
      }

      // Health Filter
      if (selectedHealth !== 'ALL') {
        if (selectedHealth === 'OPTIMAL' && machine.healthScore < 90) return false;
        if (selectedHealth === 'DEGRADED' && (machine.healthScore < 70 || machine.healthScore >= 90)) return false;
        if (selectedHealth === 'WARNING' && machine.healthScore >= 70) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'HEALTH_DESC') return b.healthScore - a.healthScore;
      if (sortBy === 'HEALTH_ASC') return a.healthScore - b.healthScore;
      if (sortBy === 'HOURS_DESC') return getRunningHours(b) - getRunningHours(a);
      if (sortBy === 'HOURS_ASC') return getRunningHours(a) - getRunningHours(b);
      if (sortBy === 'CRITICALITY') return getCriticalAlertsCount(b) - getCriticalAlertsCount(a);
      if (sortBy === 'MAINTENANCE_RECENT') return new Date(getLastMaintenance(b)) - new Date(getLastMaintenance(a));
      return 0;
    });
  }, [searchQuery, selectedManufacturer, selectedHealth, selectedPlant, selectedStatus, selectedCategory, sortBy]);

  // Overall Statistics
  const totalAssetsCount = allIndustrialMachines.length;
  const runningCount = allIndustrialMachines.filter(m => getStatusLabel(m) === 'Running').length;
  const warningCount = allIndustrialMachines.filter(m => getStatusLabel(m) === 'Warning').length;
  const criticalCount = allIndustrialMachines.filter(m => getStatusLabel(m) === 'Critical').length;
  const avgHealth = Math.round(allIndustrialMachines.reduce((acc, m) => acc + m.healthScore, 0) / (totalAssetsCount || 1));

  const hasActiveFilters = searchQuery !== '' || selectedManufacturer !== 'ALL' || selectedHealth !== 'ALL' || selectedPlant !== 'ALL' || selectedStatus !== 'ALL' || selectedCategory !== 'ALL';

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedManufacturer('ALL');
    setSelectedHealth('ALL');
    setSelectedPlant('ALL');
    setSelectedStatus('ALL');
    setSelectedCategory('ALL');
    setSortBy('HEALTH_DESC');
  };

  // Visual background graphics helper for cards
  const getCardVisualTheme = (index) => {
    const themes = [
      { bg: 'from-cyan-950 via-slate-900 to-blue-950', border: 'border-cyan-500/40', icon: Box, accent: 'text-cyan-400' },
      { bg: 'from-blue-950 via-slate-900 to-indigo-950', border: 'border-blue-500/40', icon: Cpu, accent: 'text-blue-400' },
      { bg: 'from-slate-900 via-slate-900 to-slate-950', border: 'border-slate-700', icon: Layers, accent: 'text-slate-300' },
      { bg: 'from-purple-950 via-slate-900 to-indigo-950', border: 'border-purple-500/40', icon: Zap, accent: 'text-purple-400' },
      { bg: 'from-emerald-950 via-slate-900 to-teal-950', border: 'border-emerald-500/40', icon: ShieldCheck, accent: 'text-emerald-400' },
      { bg: 'from-amber-950 via-slate-900 to-orange-950', border: 'border-amber-500/40', icon: Flame, accent: 'text-amber-400' },
    ];
    return themes[index % themes.length];
  };

  return (
    <div className="w-full h-full min-h-screen overflow-y-auto bg-[#0a0f1d] text-slate-100 p-6 space-y-6 font-sans select-none pb-28 scrollbar-thin">
      
      {/* Enterprise Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0f172a] via-[#131d36] to-[#0f172a] text-white shadow-2xl border border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/15 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-xs font-bold uppercase tracking-wider mb-2">
              <Library className="w-3.5 h-3.5 text-cyan-400" />
              <span>Enterprise Digital Twin Asset Catalog</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
              Digital Twin Library & Asset Directory
            </h1>
            <p className="text-xs lg:text-sm text-slate-300 max-w-2xl mt-1">
              Explore all industrial equipment digital twins. Launch individual machine 3D studios with exploded component breakdowns, CAD thermal overlays, and real-time 100Hz IoT telemetry.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#080d19]/80 backdrop-blur-md p-3.5 rounded-2xl border border-slate-700/80 shrink-0 shadow-lg">
            <div className="text-center px-3 py-1">
              <div className="text-xs text-slate-400 font-medium">Total Assets</div>
              <div className="text-xl font-black text-white">{totalAssetsCount}</div>
            </div>
            <div className="text-center px-3 py-1 border-l border-slate-800">
              <div className="text-xs text-slate-400 font-medium">Running</div>
              <div className="text-xl font-black text-emerald-400">{runningCount}</div>
            </div>
            <div className="text-center px-3 py-1 border-l border-slate-800">
              <div className="text-xs text-slate-400 font-medium">Warnings</div>
              <div className="text-xl font-black text-amber-400">{warningCount}</div>
            </div>
            <div className="text-center px-3 py-1 border-l border-slate-800">
              <div className="text-xs text-slate-400 font-medium">Avg Health</div>
              <div className="text-xl font-black text-cyan-300">{avgHealth}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-xl space-y-4">
        
        {/* Top Row: Search Input + Sort Dropdown */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          
          {/* Search Bar */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Machine Name, ID (e.g. MOTOR-M-15, CNC, ROBOT), Manufacturer, or Location..."
              className="w-full pl-10 pr-8 py-2.5 bg-slate-900 border border-slate-700/80 focus:border-cyan-400 rounded-xl text-xs text-slate-100 placeholder-slate-400 outline-none transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white font-bold"
              >
                ×
              </button>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
              Sort By:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full md:w-auto bg-slate-900 hover:bg-slate-800 border border-slate-700 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-200 outline-none cursor-pointer"
            >
              <option value="HEALTH_DESC">Health Score (Highest First)</option>
              <option value="HEALTH_ASC">Health Score (Lowest First)</option>
              <option value="CRITICALITY">Criticality & Alerts</option>
              <option value="HOURS_DESC">Running Hours (Highest)</option>
              <option value="HOURS_ASC">Running Hours (Lowest)</option>
              <option value="MAINTENANCE_RECENT">Last Maintenance (Recent)</option>
            </select>
          </div>
        </div>

        {/* Bottom Row: Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-800">
          
          {/* Manufacturer Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Manufacturer
            </label>
            <select
              value={selectedManufacturer}
              onChange={(e) => setSelectedManufacturer(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 p-2 rounded-xl text-xs font-semibold text-slate-200 outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="ALL">All Manufacturers</option>
              {manufacturers.filter(m => m !== 'ALL').map(mfg => (
                <option key={mfg} value={mfg}>{mfg}</option>
              ))}
            </select>
          </div>

          {/* Plant Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Plant Location
            </label>
            <select
              value={selectedPlant}
              onChange={(e) => setSelectedPlant(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 p-2 rounded-xl text-xs font-semibold text-slate-200 outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="ALL">All Plants</option>
              {plants.filter(p => p !== 'ALL').map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Health Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Health Status
            </label>
            <select
              value={selectedHealth}
              onChange={(e) => setSelectedHealth(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 p-2 rounded-xl text-xs font-semibold text-slate-200 outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="ALL">All Health Scores</option>
              <option value="OPTIMAL">Optimal (&gt; 90%)</option>
              <option value="DEGRADED">Degraded (70% - 90%)</option>
              <option value="WARNING">Warning / Critical (&lt; 70%)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Current Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 p-2 rounded-xl text-xs font-semibold text-slate-200 outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="RUNNING">Running / Healthy</option>
              <option value="WARNING">Warning</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 p-2 rounded-xl text-xs font-semibold text-slate-200 outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {categories.filter(c => c !== 'ALL').map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters Summary & Reset Button */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
            <div className="text-slate-400">
              Showing <span className="font-bold text-cyan-400">{filteredMachines.length}</span> of {totalAssetsCount} industrial assets
            </div>
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-300 font-bold text-xs transition-colors border border-red-800"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* INDUSTRIAL MACHINE CARDS GRID */}
      {filteredMachines.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#0f172a] border border-slate-800 text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No Industrial Assets Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              No industrial machines matched your active search query or filter selection. Try clearing filters.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-cyan-600 text-white font-bold text-xs hover:bg-cyan-500 transition-colors shadow-md"
          >
            Clear Search & Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredMachines.map((machine, idx) => {
            const visualTheme = getCardVisualTheme(idx);
            const VisualIcon = visualTheme.icon;

            const mfg = getCleanManufacturer(machine);
            const plant = getPlantLocation(machine);
            const statusLabel = getStatusLabel(machine);
            const runningHours = getRunningHours(machine);
            const lastMaintenance = getLastMaintenance(machine);
            const nextMaintenance = getNextMaintenance(machine);
            const criticalAlerts = getCriticalAlertsCount(machine);

            const isRunning = statusLabel === 'Running';
            const isWarning = statusLabel === 'Warning';
            const isCritical = statusLabel === 'Critical';

            const healthBarColor = 
              machine.healthScore >= 90 ? 'bg-emerald-500' :
              machine.healthScore >= 80 ? 'bg-cyan-500' :
              machine.healthScore >= 70 ? 'bg-amber-500' : 'bg-red-500';

            const healthTextColor = 
              machine.healthScore >= 90 ? 'text-emerald-400 bg-emerald-950/80 border-emerald-800' :
              machine.healthScore >= 80 ? 'text-cyan-400 bg-cyan-950/80 border-cyan-800' :
              machine.healthScore >= 70 ? 'text-amber-400 bg-amber-950/80 border-amber-800' : 'text-red-400 bg-red-950/80 border-red-800';

            return (
              <div 
                key={machine.id}
                className="group bg-[#0f172a] rounded-3xl border border-slate-800 hover:border-cyan-500/60 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* MACHINE IMAGE / GRAPHIC HEADER BANNER */}
                <div className={`relative h-44 bg-gradient-to-br ${visualTheme.bg} p-5 text-white flex flex-col justify-between overflow-hidden border-b border-slate-800`}>
                  
                  {/* Decorative mesh background */}
                  <div className="absolute inset-0 opacity-15 pointer-events-none" style={{
                    backgroundImage: 'linear-gradient(rgba(56, 189, 248, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.1) 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                  }} />
                  <VisualIcon className="absolute -right-6 -bottom-6 w-36 h-36 opacity-10 pointer-events-none text-white" />

                  {/* Top Badges: ID & Status */}
                  <div className="relative z-10 flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-md text-cyan-300 border border-cyan-500/30">
                      {machine.id}
                    </span>

                    {/* Status Badge */}
                    <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full border flex items-center gap-1.5 shadow-sm backdrop-blur-md ${
                      isRunning 
                        ? 'bg-emerald-950/90 text-emerald-300 border-emerald-700' 
                        : isWarning 
                        ? 'bg-amber-950/90 text-amber-300 border-amber-700' 
                        : 'bg-red-950/90 text-red-300 border-red-700'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-red-400 animate-ping'}`} />
                      <span>{statusLabel}</span>
                    </span>
                  </div>

                  {/* Machine Title & Category */}
                  <div className="relative z-10 mt-auto">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300/80 bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm border border-cyan-500/20">
                      {machine.category || 'Industrial Digital Twin'}
                    </span>
                    <h3 className="text-base font-black text-white tracking-tight mt-1.5 leading-snug line-clamp-2 group-hover:text-cyan-300 transition-colors">
                      {machine.name}
                    </h3>
                  </div>
                </div>

                {/* CARD BODY CONTENT */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  
                  {/* Plant, Manufacturer, Location Specs */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase block">Manufacturer</span>
                      <span className="font-bold text-slate-200 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate">{mfg}</span>
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase block">Plant Location</span>
                      <span className="font-bold text-slate-200 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span className="truncate">{plant}</span>
                      </span>
                    </div>

                    <div className="col-span-2 pt-1 border-t border-slate-800 mt-1">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase block">Station / Cell</span>
                      <span className="font-mono text-slate-300 text-[11px] truncate block">
                        {machine.location}
                      </span>
                    </div>
                  </div>

                  {/* HEALTH SCORE & PROGRESS BAR */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-300 flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-cyan-400" />
                        Health Score:
                      </span>
                      <span className={`font-extrabold px-2 py-0.5 rounded-lg border text-xs ${healthTextColor}`}>
                        {machine.healthScore}%
                      </span>
                    </div>

                    {/* Health Progress Bar */}
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${healthBarColor}`} 
                        style={{ width: `${machine.healthScore}%` }}
                      />
                    </div>
                  </div>

                  {/* OPERATING METRICS & ALERTS GRID */}
                  <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                    
                    {/* Running Hours */}
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-medium">Running Hours</div>
                        <div className="font-mono font-bold text-slate-200">
                          {runningHours.toLocaleString()} hrs
                        </div>
                      </div>
                    </div>

                    {/* Critical Alerts */}
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-xl border ${criticalAlerts > 0 ? 'bg-amber-950/80 border-amber-800 text-amber-400' : 'bg-emerald-950/80 border-emerald-800 text-emerald-400'}`}>
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-medium">Alerts</div>
                        <div className={`font-mono font-bold ${criticalAlerts > 0 ? 'text-amber-400' : 'text-slate-200'}`}>
                          {criticalAlerts} {criticalAlerts === 1 ? 'Alert' : 'Active'}
                        </div>
                      </div>
                    </div>

                    {/* Last Maintenance */}
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-blue-400">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-medium">Last Service</div>
                        <div className="font-mono font-medium text-slate-300 text-[11px]">
                          {lastMaintenance}
                        </div>
                      </div>
                    </div>

                    {/* Next Maintenance */}
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-medium">Next Scheduled</div>
                        <div className="font-mono font-medium text-slate-300 text-[11px]">
                          {nextMaintenance}
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* CARD ACTION BUTTON */}
                  <div className="pt-3 border-t border-slate-800">
                    <button
                      onClick={() => onOpenDigitalTwin(machine)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs transition-all duration-200 shadow-lg shadow-cyan-500/20 group/btn"
                    >
                      <Box className="w-4 h-4 text-cyan-200 group-hover/btn:rotate-12 transition-transform" />
                      <span>Launch 3D Machine Studio</span>
                      <ChevronRight className="w-4 h-4 text-cyan-200 group-hover/btn:translate-x-1 transition-all" />
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

import React, { Suspense, useState, useCallback } from 'react';
import { Activity, Loader2, Factory, Smartphone, Cpu, Library, Sparkles } from 'lucide-react';
import DigitalTwinPage from './components/pages/DigitalTwinPage';
import IndustrialOperationsCenter from './components/operations/IndustrialOperationsCenter';
import DeviceCommandCenter from './components/devices/DeviceCommandCenter';
import DigitalTwinLibraryPage from './components/pages/DigitalTwinLibraryPage';
import { allIndustrialMachines } from './data/mockData';

function OperationsCenterLoader() {
  return (
    <div className="w-full h-full bg-[#0a0f1d] flex flex-col items-center justify-center text-center space-y-4 select-none">
      <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0f172a] border border-cyan-500/30 shadow-xl shadow-cyan-500/20">
        <Activity className="w-8 h-8 text-cyan-400 animate-pulse" />
      </div>
      <div>
        <h2 className="text-base font-extrabold tracking-tight text-white uppercase">
          Initializing TwinMind System
        </h2>
        <p className="text-xs font-medium text-slate-400 mt-1">
          Loading 3D Physics Mesh, Live Telemetry Bus & AI Diagnostic Engine...
        </p>
      </div>
      <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 bg-cyan-950/80 px-4 py-2 rounded-xl border border-cyan-800 shadow-sm">
        <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
        <span>CONNECTING REAL-TIME SENSORS (100Hz)...</span>
      </div>
    </div>
  );
}

export default function App() {
  // 'MACHINES' | 'FACTORY' | 'LIBRARY' | 'DEVICES'
  const [activeModule, setActiveModule] = useState('MACHINES');
  const [selectedMachine, setSelectedMachine] = useState(allIndustrialMachines[0]);

  const handleOpenDigitalTwin = useCallback((machine) => {
    setSelectedMachine(machine);
    setActiveModule('MACHINES');
  }, []);

  return (
    <div className="flex w-screen h-screen overflow-hidden bg-[#0a0f1d]">
      {/* Global Navigation Sidebar */}
      <div className="w-16 flex-shrink-0 bg-[#070b14] border-r border-slate-800 flex flex-col items-center py-4 z-50 justify-between">
        <div className="flex flex-col items-center gap-6">
          {/* Logo Badge */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 font-black text-sm">
            TM
          </div>
          
          {/* Module Switcher Icons */}
          <div className="flex flex-col gap-3">
            {/* 1. MACHINE & COMPONENT PARTS STUDIO (PRIMARY) */}
            <button
              onClick={() => setActiveModule('MACHINES')}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                activeModule === 'MACHINES'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/50 shadow-lg shadow-cyan-500/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
              title="Machine & Component Parts Digital Twin Studio"
            >
              <Cpu className="w-6 h-6" />
            </button>
            
            {/* 2. INDUSTRIAL FACTORY CAMPUS */}
            <button
              onClick={() => setActiveModule('FACTORY')}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                activeModule === 'FACTORY'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-400/50 shadow-lg shadow-blue-500/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
              title="Industrial Factory Campus Twin"
            >
              <Factory className="w-6 h-6" />
            </button>

            {/* 3. DIGITAL TWIN LIBRARY */}
            <button
              onClick={() => setActiveModule('LIBRARY')}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                activeModule === 'LIBRARY'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/50 shadow-lg shadow-cyan-500/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
              title="Digital Twin Catalog & Library"
            >
              <Library className="w-6 h-6" />
            </button>
            
            {/* 4. DEVICE COMMAND CENTER */}
            <button
              onClick={() => setActiveModule('DEVICES')}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                activeModule === 'DEVICES'
                  ? 'bg-purple-600/20 text-purple-400 border border-purple-400/50 shadow-lg shadow-purple-500/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
              title="Device Digital Twins (Phone, Laptop, Monitor)"
            >
              <Smartphone className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Bottom Status Dot */}
        <div className="flex flex-col items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" title="IoT Stream Active" />
          <span className="text-[9px] font-mono font-bold text-slate-500">100Hz</span>
        </div>
      </div>

      {/* Main Content Viewport */}
      <div className="flex-1 relative overflow-hidden">
        <Suspense fallback={<OperationsCenterLoader />}>
          {activeModule === 'MACHINES' && (
            <DigitalTwinPage
              selectedMachine={selectedMachine}
              onSelectMachine={setSelectedMachine}
              onSwitchMachine={setSelectedMachine}
            />
          )}

          {activeModule === 'FACTORY' && (
            <IndustrialOperationsCenter
              onOpenMachinePartsStudio={(machineId) => {
                const target = allIndustrialMachines.find((m) => m.id === machineId || m.id.includes(machineId));
                if (target) setSelectedMachine(target);
                setActiveModule('MACHINES');
              }}
            />
          )}

          {activeModule === 'LIBRARY' && (
            <DigitalTwinLibraryPage
              onOpenDigitalTwin={handleOpenDigitalTwin}
            />
          )}

          {activeModule === 'DEVICES' && (
            <DeviceCommandCenter 
              onOpenDigitalTwin={(device) => {
                const target = allIndustrialMachines.find(
                  (m) => m.id === device?.id || m.id === 'MOBILE_001' || m.id.includes(device?.id)
                ) || allIndustrialMachines[0];
                setSelectedMachine(target);
                setActiveModule('MACHINES');
              }}
            />
          )}
        </Suspense>
      </div>
    </div>
  );
}

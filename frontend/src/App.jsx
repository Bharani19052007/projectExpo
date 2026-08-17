import React, { Suspense, useState } from 'react';
import { Activity, Loader2, Factory, Smartphone } from 'lucide-react';
import IndustrialOperationsCenter from './components/operations/IndustrialOperationsCenter';
import DeviceCommandCenter from './components/devices/DeviceCommandCenter';

function OperationsCenterLoader() {
  return (
    <div className="w-full h-full bg-[#f5f9ff] flex flex-col items-center justify-center text-center space-y-4 select-none">
      <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-white border border-[#d8e6ff] shadow-xl shadow-blue-500/10">
        <Activity className="w-8 h-8 text-[#1976d2] animate-pulse" />
      </div>
      <div>
        <h2 className="text-base font-bold tracking-tight text-[#0f172a] uppercase">
          Initializing TwinMind System
        </h2>
        <p className="text-xs font-medium text-[#64748b] mt-1">
          Loading Digital Twin, Live Telemetry Bus & AI Engine...
        </p>
      </div>
      <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#1976d2] bg-white px-4 py-2 rounded-xl border border-[#d8e6ff] shadow-sm">
        <Loader2 className="w-4 h-4 animate-spin text-[#1976d2]" />
        <span>CONNECTING REAL-TIME SENSORS (100Hz)...</span>
      </div>
    </div>
  );
}

export default function App() {
  const [activeModule, setActiveModule] = useState('FACTORY'); // 'FACTORY' | 'DEVICES'

  return (
    <div className="flex w-screen h-screen overflow-hidden bg-[#0f172a]">
      {/* Global Navigation Sidebar */}
      <div className="w-16 flex-shrink-0 bg-[#0a0f1d] border-r border-[#1e293b] flex flex-col items-center py-4 z-50">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1976d2] to-[#0d47a1] flex items-center justify-center text-white shadow-lg shadow-blue-500/20 font-bold text-sm mb-6">
          TM
        </div>
        
        <div className="flex flex-col gap-3">
          <button
            onClick={() => setActiveModule('FACTORY')}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              activeModule === 'FACTORY'
                ? 'bg-[#1976d2]/20 text-[#38bdf8] border border-[#38bdf8]/30 shadow-lg shadow-blue-500/10'
                : 'text-[#64748b] hover:bg-white/5 hover:text-white'
            }`}
            title="Industrial Factory Twin"
          >
            <Factory className="w-6 h-6" />
          </button>
          
          <button
            onClick={() => setActiveModule('DEVICES')}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              activeModule === 'DEVICES'
                ? 'bg-[#1976d2]/20 text-[#38bdf8] border border-[#38bdf8]/30 shadow-lg shadow-blue-500/10'
                : 'text-[#64748b] hover:bg-white/5 hover:text-white'
            }`}
            title="Device Digital Twins"
          >
            <Smartphone className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden">
        <Suspense fallback={<OperationsCenterLoader />}>
          {activeModule === 'FACTORY' ? (
            <IndustrialOperationsCenter />
          ) : (
            <DeviceCommandCenter />
          )}
        </Suspense>
      </div>
    </div>
  );
}


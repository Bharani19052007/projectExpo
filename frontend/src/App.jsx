import React, { Suspense } from 'react';
import { Activity, Loader2 } from 'lucide-react';
import IndustrialOperationsCenter from './components/operations/IndustrialOperationsCenter';

function OperationsCenterLoader() {
  return (
    <div className="w-screen h-screen bg-slate-950 flex flex-col items-center justify-center text-center space-y-4 select-none">
      <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 shadow-2xl shadow-cyan-500/20">
        <Activity className="w-8 h-8 text-cyan-400 animate-pulse" />
      </div>
      <div>
        <h2 className="text-base font-mono font-bold tracking-wider text-slate-100 uppercase">
          Initializing TwinMind Industrial Operations Center
        </h2>
        <p className="text-xs font-mono text-slate-400 mt-1">
          Loading 3D Smart Factory Digital Twin, Live IIoT Telemetry Bus & Neural Physics Models...
        </p>
      </div>
      <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-4 py-2 rounded-xl border border-cyan-500/20">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>CONNECTING REAL-TIME SENSORS (100Hz)...</span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<OperationsCenterLoader />}>
      <IndustrialOperationsCenter />
    </Suspense>
  );
}


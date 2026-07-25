import React from 'react';
import { Html, useProgress } from '@react-three/drei';
import { Cpu } from 'lucide-react';

export default function Loader() {
  const { progress, item, loaded, total } = useProgress();

  return (
    <Html center>
      <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-xl text-center min-w-[240px]">
        <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white mb-3 shadow-md shadow-blue-500/20">
          <Cpu className="w-6 h-6 animate-pulse" />
          <div className="absolute inset-0 rounded-xl border-2 border-cyan-300/40 animate-ping" />
        </div>

        <h4 className="text-xs font-bold text-slate-900 tracking-tight">
          Loading 3D Digital Twin
        </h4>
        <p className="text-[10px] text-slate-500 font-mono mt-0.5">
          Siemens 1LE55 Industrial Motor GLB
        </p>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden border border-slate-200">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-200 rounded-full"
            style={{ width: `${progress.toFixed(0)}%` }}
          />
        </div>

        <div className="flex justify-between w-full text-[10px] font-mono text-slate-400 mt-1">
          <span>{progress.toFixed(0)}%</span>
          <span>{loaded} / {total || 1} Assets</span>
        </div>
      </div>
    </Html>
  );
}

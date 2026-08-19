import React from 'react';
import { 
  Activity, 
  Cpu, 
  Factory, 
  Sparkles, 
  Terminal,
  Zap, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Database,
  Layers,
  Network
} from 'lucide-react';

export default function LandingPage({ onGetStarted }) {
  const capabilities = [
    {
      title: 'High-Fidelity 3D CAD Engines',
      desc: 'Inspect detailed procedural machine meshes. Toggle split screens showing live-side CAD assemblies next to holographic blue telemetry duplicates.',
      icon: Layers,
      tag: 'WebGL'
    },
    {
      title: 'Real-Time Telemetry Socket',
      desc: 'Stream live mobile or client device sensor data at 100Hz (battery profiles, CPU load, and temperature values) directly into your digital twins.',
      icon: Network,
      tag: 'Socket.IO'
    },
    {
      title: 'Predictive Diagnostic models',
      desc: 'Utilize automated AI logic to monitor asset vibration and thermal thresholds, calculate remaining useful life, and flag warning limits.',
      icon: Zap,
      tag: 'Prognostics'
    },
    {
      title: 'Plant Line Balancers',
      desc: 'Get shift overview diagnostics for heavy machinery. Track overall equipment effectiveness (OEE) and live load draw across 6 plant areas.',
      icon: Factory,
      tag: 'OEE HUD'
    }
  ];

  return (
    <div className="w-full min-h-screen bg-[#060913] text-slate-100 flex flex-col justify-between p-6 relative overflow-y-auto scrollbar-thin select-none font-sans">
      
      {/* Background Neon Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-cyan-500/10 to-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-tr from-purple-500/10 to-pink-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header Bar */}
      <div className="relative z-10 flex items-center justify-between w-full max-w-7xl mx-auto py-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 font-black text-sm">
            TM
          </div>
          <span className="text-xs font-mono font-bold tracking-widest text-slate-400">TWINMIND AI</span>
        </div>
        
        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5 bg-slate-900/60 border border-slate-800 px-3 py-1 rounded-full text-[10px] text-slate-400">
            <ShieldCheck className={`w-3.5 h-3.5 ${typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'text-cyan-400' : 'text-slate-500'}`} />
            <span>{typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'SSL SECURE CONNECTION' : 'LOCAL DEV GATEWAY'}</span>
          </div>
          <span className="hidden sm:inline">v2.4.0-STABLE</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center max-w-5xl mx-auto px-4 py-8 space-y-12">
        
        {/* 1. HERO HEADER AREA */}
        <div className="space-y-6">
          {/* Animated Feature Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-mono font-bold uppercase tracking-wider animate-in fade-in duration-1000">
            <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '10s' }} />
            <span>Industry 4.0 Digital Twin Platform</span>
          </div>

          {/* Big Neon Headings */}
          <div className="space-y-4 animate-in fade-in duration-1000">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              Unifying Physical Assets With <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-400 bg-clip-text text-transparent">
                High-Fidelity 3D Simulation
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Experience real-time telemetry streaming, interactive component breakdown models, and neural network diagnostics. Connect your Vivo Y200e device via Socket.IO or explore the factory shop floor.
            </p>
          </div>

          {/* Action Button Area */}
          <div className="flex flex-col items-center gap-3 w-full max-w-xs mx-auto animate-in fade-in duration-1000">
            <button
              onClick={onGetStarted}
              className="group w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-black text-sm tracking-wider transition-all shadow-xl shadow-cyan-500/15 cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02]"
            >
              <span className="text-white text-xs font-mono font-bold tracking-widest uppercase">GET STARTED</span>
              <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1.5 transition-transform" />
            </button>
            <span className="text-[9px] font-mono text-slate-500">
              No credentials required • Sandbox environment active
            </span>
          </div>
        </div>

        {/* 2. PLATFORM CAPABILITIES GRID */}
        <div className="w-full space-y-6 pt-6 border-t border-slate-800/60 text-left">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Core Platform Capabilities</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {capabilities.map((cap, idx) => {
              const Icon = cap.icon;
              return (
                <div 
                  key={idx} 
                  className="p-5 rounded-2xl bg-[#090d16]/80 border border-slate-800/80 flex items-start gap-4 hover:border-slate-700 transition-all shadow-md"
                >
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400 shrink-0">
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">{cap.title}</h4>
                      <span className="text-[8px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-400">
                        {cap.tag}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      {cap.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. DIAGNOSTICS & SYSTEM STATUS TERMINAL */}
        <div className="w-full space-y-4 text-left">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center">System Integration Monitor</h3>
          
          <div className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 p-4 font-mono text-[10px] text-slate-300 shadow-xl space-y-2 max-w-3xl mx-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-900 text-slate-500">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                TWINMIND Core Diagnostics Terminal
              </span>
              <span>Node Connection Status</span>
            </div>
            
            <div className="space-y-1 pt-1.5 font-mono">
              <div className="flex justify-between items-center">
                <span>[Diagnostics] ✓ 3D WebGL Context</span>
                <span className="text-emerald-400 font-bold">READY</span>
              </div>
              <div className="flex justify-between items-center">
                <span>[Diagnostics] ✓ Real-Time Telemetry Engine</span>
                <span className="text-emerald-400 font-bold">ONLINE</span>
              </div>
              <div className="flex justify-between items-center">
                <span>[Diagnostics] ✓ Socket.IO Gateway</span>
                <span className="text-cyan-400 font-bold">ACTIVE (PORT 4000)</span>
              </div>
              <div className="flex justify-between items-center">
                <span>[Diagnostics] ✓ Digital Twin Engine</span>
                <span className="text-emerald-400 font-bold font-semibold text-[9px] uppercase tracking-wide px-1 rounded bg-slate-900 border border-slate-800">MOBILE_001 SYNCHRONIZED</span>
              </div>
              <div className="flex justify-between items-center">
                <span>[Diagnostics] ✓ AI Analytics Engine</span>
                <span className="text-emerald-400 font-bold">CALIBRATED (99.8%)</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Footer Credits */}
      <div className="relative z-10 w-full max-w-7xl mx-auto py-4 border-t border-slate-850 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] font-mono text-slate-500">
        <div>© 2026 TwinMind Systems AG. All Rights Reserved.</div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> API: Live</span>
          <span>•</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> WebSocket: Active</span>
        </div>
      </div>

    </div>
  );
}

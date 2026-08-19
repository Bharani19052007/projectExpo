import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Battery, Thermometer, Cpu, MemoryStick, Wifi, Sparkles, ArrowRight, Smartphone, AlertTriangle, Play } from 'lucide-react';
import SmartphoneTwinModel from '../3d/machines/SmartphoneTwinModel';
import TelemetryCard from './TelemetryCard';
import DeviceStatusBadge from './DeviceStatusBadge';
import { useDeviceTelemetry } from '../../services/deviceTelemetry';
import { smartphoneTwinComponents } from '../../machines/smartphoneTwin';

export default function MobileTwinView({ isDemoMode, setIsDemoMode, isExpoMode, setIsExpoMode, onOpenDigitalTwin }) {
  // Automatically switch off demo mode when real telemetry arrives
  const devices = useDeviceTelemetry('MOBILE', isDemoMode, () => {
    if (isDemoMode && setIsDemoMode) {
      console.log('[Telemetry Sync] Real device telemetry detected, exiting Demo Mode.');
      setIsDemoMode(false);
    }
  });

  const realDevice = devices.find(d => d.id === 'MOBILE_001') || devices[0];
  const isOnline = realDevice?.online;

  return (
    <div className="w-full h-full p-6 flex flex-col gap-6 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-700">
      
      {/* Platform Connectivity Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight uppercase text-white flex items-center gap-2.5">
            <Smartphone className="w-6 h-6 text-cyan-400" />
            Device Twins Management Center
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Inspect live streaming hardware twins. Selecting MOBILE_001 launches the interactive 3D component breakdown.
          </p>
        </div>

        {/* Global Connection Badge */}
        <div className="flex items-center gap-3">
          {isDemoMode ? (
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 text-xs font-bold font-mono">
              <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
              <span>⚠ DEMO / SIMULATED DATA</span>
            </div>
          ) : isOnline ? (
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-bold font-mono">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>● LIVE REAL DEVICE (100HZ)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-bold font-mono">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>● OFFLINE / STREAM DISCONNECTED</span>
            </div>
          )}

          {/* Demo mode quick switch button */}
          {!isOnline && (
            <button
              onClick={() => setIsDemoMode(!isDemoMode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                isDemoMode
                  ? 'bg-rose-950/40 border-rose-800 text-rose-300 hover:bg-rose-900/40'
                  : 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30'
              }`}
            >
              <Play className="w-3 h-3" />
              <span>{isDemoMode ? 'Stop Simulation' : 'Start Simulation'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Selector Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1 min-h-[600px] pb-12">
        {devices.map(device => {
          const isMobile001 = device.id === 'MOBILE_001';
          const isDeviceConnected = isMobile001 && (isOnline || isDemoMode);

          return (
            <div 
              key={device.id} 
              className={`flex flex-col rounded-2xl border transition-all duration-300 overflow-hidden shadow-2xl ${
                isDeviceConnected
                  ? 'bg-gradient-to-b from-[#0f172a] to-[#0a0f1d] border-cyan-500/40 hover:border-cyan-400 ring-1 ring-cyan-500/20'
                  : 'bg-[#0b0f19] border-slate-900 opacity-60 hover:opacity-80'
              }`}
            >
              {/* Card Header */}
              <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-black/30">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm tracking-wide text-white font-mono">{device.id}</span>
                    {isMobile001 && (
                      <span className="px-2 py-0.5 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-extrabold font-mono">
                        {isDemoMode ? 'DEMO NODE' : 'REAL DEVICE'}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 font-semibold mt-0.5">
                    {isMobile001 ? (device.model || "Vivo V2336") : device.name}
                  </span>
                </div>
                
                {isMobile001 ? (
                  <DeviceStatusBadge status={isDemoMode ? 'normal' : (isOnline ? 'normal' : 'offline')} />
                ) : (
                  <span className="px-2.5 py-1 text-[9px] font-mono font-bold bg-slate-900 border border-slate-800 text-slate-500 rounded-md">
                    OFFLINE
                  </span>
                )}
              </div>

              {/* 3D Viewport or Waiting Placeholder */}
              <div className="h-64 relative bg-gradient-to-b from-[#0a0f1d] to-[#080d19] border-b border-slate-800/80 flex flex-col justify-center items-center">
                {isDeviceConnected ? (
                  <>
                    <Canvas 
                      camera={{ position: [0, 0, 3.8], fov: 45 }}
                      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
                      onCreated={({ gl }) => {
                        gl.domElement.addEventListener('webglcontextlost', (e) => e.preventDefault(), false);
                      }}
                    >
                      <ambientLight intensity={1.8} />
                      <directionalLight position={[5, 10, 5]} intensity={2.0} />
                      <directionalLight position={[-5, -5, 2]} intensity={0.8} color="#38bdf8" />
                      <SmartphoneTwinModel 
                        telemetry={device} 
                        components={smartphoneTwinComponents}
                        isHologram={false}
                        viewMode="CAD"
                      />
                      <OrbitControls enableZoom={true} enablePan={false} maxPolarAngle={Math.PI / 1.4} minPolarAngle={Math.PI / 3.5} />
                    </Canvas>
                    <div className="absolute bottom-2 right-2 px-2.5 py-1 bg-black/60 border border-slate-800 rounded-lg text-[10px] text-cyan-300/80 backdrop-blur-md pointer-events-none font-mono">
                      {isDemoMode ? 'SIMULATED 3D TWIN' : 'REAL 3D TWIN • SYNCED'}
                    </div>
                  </>
                ) : isMobile001 ? (
                  // Offline Placeholder for MOBILE_001
                  <div className="p-6 text-center flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
                      <AlertTriangle className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-200">Device stream disconnected</h4>
                      <p className="text-[10px] text-slate-500 max-w-xs mx-auto mt-1">
                        Connect your Vivo V2336 to server socket on http://192.168.137.1:4000 or click to simulate local telemetry.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsDemoMode(true)}
                      className="mt-2 py-1.5 px-4 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-black text-[10px] tracking-widest hover:bg-cyan-500/30 flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>START DEMO DATA</span>
                    </button>
                  </div>
                ) : (
                  // Grayscale Waiting Placeholder for MOBILE_002 / 003
                  <div className="text-center flex flex-col items-center gap-2 text-slate-600">
                    <Smartphone className="w-10 h-10" />
                    <span className="text-[10px] font-mono uppercase tracking-widest font-bold">
                      WAITING FOR CONNECTION...
                    </span>
                    <span className="text-[9px] text-slate-700 font-mono">
                      Not registered on socket
                    </span>
                  </div>
                )}
              </div>
                {/* Telemetry Dashboard */}
              <div className="p-4 grid grid-cols-2 gap-2.5 bg-[#080d19] flex-1">
                <TelemetryCard 
                  title="Battery" 
                  value={isDeviceConnected ? device.battery : 0} 
                  unit="%" 
                  icon={Battery} 
                  color={!isDeviceConnected ? 'slate' : (device.battery < 20 ? 'rose' : (device.battery < 50 ? 'amber' : 'emerald'))}
                />
                <TelemetryCard 
                  title="Temp" 
                  value={isDeviceConnected ? device.temperature : 0} 
                  unit="°C" 
                  icon={Thermometer} 
                  color={!isDeviceConnected ? 'slate' : (device.temperature > 40 ? 'rose' : 'blue')}
                />
                <TelemetryCard 
                  title="APP CPU" 
                  value={isDeviceConnected ? Number(device.cpuUsage ?? device.cpu ?? 0).toFixed(1) : 0} 
                  unit="%" 
                  icon={Cpu} 
                  color={!isDeviceConnected ? 'slate' : ((device.cpuUsage ?? device.cpu ?? 0) > 80 ? 'rose' : 'blue')}
                  tooltip="CPU utilization of the TwinMind monitoring process. Values above 100% indicate usage across multiple CPU cores."
                />
                <TelemetryCard 
                  title="RAM Load" 
                  value={isDeviceConnected ? Number(device.ramUsage ?? device.ram ?? 0).toFixed(1) : 0} 
                  unit="%" 
                  icon={MemoryStick} 
                  color={!isDeviceConnected ? 'slate' : ((device.ramUsage ?? device.ram ?? 0) > 80 ? 'rose' : 'slate')}
                  subtext={isDeviceConnected && device.ramTotal ? (
                    device.ramTotal > 100000 
                      ? `${(device.ramUsed / (1024 * 1024)).toFixed(1)} GB / ${(device.ramTotal / (1024 * 1024)).toFixed(0)} GB`
                      : `${(device.ramUsed / 1024).toFixed(1)} GB / ${(device.ramTotal / 1024).toFixed(0)} GB`
                  ) : null}
                />
                <TelemetryCard 
                  title="Network" 
                  value={isDeviceConnected ? (device.network || "WiFi") : "N/A"} 
                  icon={Wifi} 
                  color="slate"
                />
                <TelemetryCard 
                  title="Charging" 
                  value={isDeviceConnected ? (device.charging ? 'YES' : 'NO') : "N/A"} 
                  icon={Battery} 
                  color={isDeviceConnected && device.charging ? 'emerald' : 'slate'}
                />
              </div>

              {/* Live socket state details bar */}
              {isMobile001 && (
                <div className="px-4 py-2 border-t border-slate-800/80 bg-black/20 flex justify-between items-center text-[10px] font-mono">
                  <span className={`font-bold flex items-center gap-1.5 ${isDemoMode ? 'text-amber-400' : (isOnline ? 'text-emerald-400 animate-pulse' : 'text-rose-400')}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isDemoMode ? 'bg-amber-400' : (isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500')}`} />
                    {isDemoMode ? '● SIMULATION ACTIVE' : (isOnline ? '● LIVE SOCKET.IO STREAM' : '● DISCONNECTED')}
                  </span>
                  <span className="text-slate-500">
                    {devices.lastUpdate ? `Last update: ${Math.round((Date.now() - devices.lastUpdate) / 1000)}s ago` : 'Last update: Never'}
                  </span>
                </div>
              )}
 
              {/* Action Button */}
              <div className="p-3 bg-[#0a0f1d] border-t border-slate-800/80">
                <button
                  disabled={!isDeviceConnected}
                  onClick={() => onOpenDigitalTwin && onOpenDigitalTwin(device)}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${
                    isDeviceConnected
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-cyan-500/25 cursor-pointer'
                      : 'bg-slate-900 border border-slate-950 text-slate-600 cursor-not-allowed shadow-none'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Open {device.id} in Digital Twin Studio</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


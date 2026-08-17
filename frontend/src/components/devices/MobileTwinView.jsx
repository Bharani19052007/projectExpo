import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { Battery, Thermometer, Cpu, MemoryStick, Wifi, Sparkles, ArrowRight, Smartphone } from 'lucide-react';
import SmartphoneTwinModel from '../3d/machines/SmartphoneTwinModel';
import TelemetryCard from './TelemetryCard';
import DeviceStatusBadge from './DeviceStatusBadge';
import { useDeviceTelemetry } from '../../services/deviceTelemetry';
import { smartphoneTwinComponents } from '../../machines/smartphoneTwin';

export default function MobileTwinView({ isDemoMode, onOpenDigitalTwin }) {
  const devices = useDeviceTelemetry('MOBILE', isDemoMode);

  return (
    <div className="w-full h-full p-6 flex flex-col gap-6 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight uppercase text-white flex items-center gap-2.5">
            <Smartphone className="w-6 h-6 text-cyan-400" />
            Connected Mobile Devices Digital Twin Hub
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Select any connected smartphone to inspect its live internal hardware telemetry in the 3D Digital Twin Studio.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-bold shadow-sm">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>SOCKET.IO REAL-TIME STREAM</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1 min-h-[600px] pb-12">
        {devices.map(device => {
          const isLiveConnected = Boolean(device.model || device.id === 'MOBILE_001');

          return (
            <div 
              key={device.id} 
              className={`flex flex-col rounded-2xl border transition-all duration-300 overflow-hidden shadow-2xl ${
                isLiveConnected
                  ? 'bg-gradient-to-b from-[#0f172a] to-[#0a0f1d] border-cyan-500/40 hover:border-cyan-400 ring-1 ring-cyan-500/20'
                  : 'bg-[#0f172a]/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-black/30">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm tracking-wide text-white font-mono">{device.id}</span>
                    {isLiveConnected && (
                      <span className="px-2 py-0.5 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-extrabold">
                        YOUR DEVICE
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 font-semibold mt-0.5">
                    {device.model || device.name || "Vivo Smartphone"}
                  </span>
                </div>
                <DeviceStatusBadge status={device.status} />
              </div>

              {/* 3D Viewport */}
              <div className="h-64 relative bg-gradient-to-b from-[#0a0f1d] to-[#080d19] border-b border-slate-800/80">
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
                  Interactive 3D • Drag to Orbit
                </div>
              </div>

              {/* Telemetry Dashboard */}
              <div className="p-4 grid grid-cols-2 gap-2.5 bg-[#080d19] flex-1">
                <TelemetryCard 
                  title="Battery" 
                  value={device.battery} 
                  unit="%" 
                  icon={Battery} 
                  color={device.battery < 20 ? 'rose' : (device.battery < 50 ? 'amber' : 'emerald')}
                />
                <TelemetryCard 
                  title="Temp" 
                  value={device.temperature} 
                  unit="°C" 
                  icon={Thermometer} 
                  color={device.temperature > 40 ? 'warning' : 'blue'}
                />
                <TelemetryCard 
                  title="CPU Usage" 
                  value={device.cpu} 
                  unit="%" 
                  icon={Cpu} 
                  color={device.cpu > 80 ? 'rose' : 'blue'}
                />
                <TelemetryCard 
                  title="RAM Load" 
                  value={device.ram} 
                  unit="%" 
                  icon={MemoryStick} 
                  color={device.ram > 80 ? 'amber' : 'slate'}
                />
                <TelemetryCard 
                  title="Network" 
                  value={device.network || "Wi-Fi"} 
                  icon={Wifi} 
                  color="slate"
                />
                <TelemetryCard 
                  title="Charging" 
                  value={device.charging ? 'YES' : 'NO'} 
                  icon={Battery} 
                  color={device.charging ? 'emerald' : 'slate'}
                />
              </div>

              {/* Action Button: Open in Full 3D Digital Twin Studio */}
              <div className="p-3 bg-[#0a0f1d] border-t border-slate-800">
                <button
                  onClick={() => onOpenDigitalTwin && onOpenDigitalTwin(device)}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${
                    isLiveConnected
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-cyan-500/25'
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
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

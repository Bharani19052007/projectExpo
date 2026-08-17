import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { Battery, Thermometer, Cpu, MemoryStick, Wifi } from 'lucide-react';
import MobilePhone from '../3d/MobilePhone';
import TelemetryCard from './TelemetryCard';
import DeviceStatusBadge from './DeviceStatusBadge';
import { useDeviceTelemetry } from '../../services/deviceTelemetry';

export default function MobileTwinView({ isDemoMode }) {
  const devices = useDeviceTelemetry('MOBILE', isDemoMode);

  return (
    <div className="w-full h-full p-6 flex flex-col gap-6 overflow-y-auto overflow-x-hidden">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight uppercase">Mobile Devices</h2>
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-bold">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          LIVE TELEMETRY
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1 min-h-[600px]">
        {devices.map(device => (
          <div key={device.id} className="flex flex-col bg-[#0f172a]/50 rounded-2xl border border-[#1e293b] overflow-hidden shadow-xl">
            {/* Header */}
            <div className="p-4 border-b border-[#1e293b] flex items-center justify-between bg-black/20">
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-wide text-white">{device.id}</span>
                <span className="text-xs text-slate-400 font-medium">{device.model || device.name}</span>
              </div>
              <DeviceStatusBadge status={device.status} />
            </div>

            {/* 3D Viewport */}
            <div className="h-64 relative bg-gradient-to-b from-[#0f172a] to-[#020617] border-b border-[#1e293b]">
              <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <spotLight position={[5, 5, 5]} intensity={1} />
                <Environment preset="city" />
                <MobilePhone status={device.status} telemetry={device} />
                <ContactShadows position={[0, -1.8, 0]} opacity={0.4} scale={5} blur={2} />
                <OrbitControls enableZoom={true} enablePan={false} maxPolarAngle={Math.PI / 1.5} minPolarAngle={Math.PI / 3} />
              </Canvas>
              <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/40 rounded text-[10px] text-white/50 backdrop-blur-sm pointer-events-none">
                Interactive 3D
              </div>
            </div>

            {/* Telemetry Dashboard */}
            <div className="p-4 grid grid-cols-2 gap-3 bg-[#0a0f1d] flex-1">
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
                title="CPU" 
                value={device.cpu} 
                unit="%" 
                icon={Cpu} 
                color={device.cpu > 80 ? 'rose' : 'blue'}
              />
              <TelemetryCard 
                title="RAM" 
                value={device.ram} 
                unit="%" 
                icon={MemoryStick} 
                color={device.ram > 80 ? 'amber' : 'slate'}
              />
              <TelemetryCard 
                title="Network" 
                value={device.network} 
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
          </div>
        ))}
      </div>
    </div>
  );
}

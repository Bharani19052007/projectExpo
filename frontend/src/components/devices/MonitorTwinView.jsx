import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { Sun, Power, Thermometer } from 'lucide-react';
import Monitor from '../3d/Monitor';
import TelemetryCard from './TelemetryCard';
import DeviceStatusBadge from './DeviceStatusBadge';
import { useDeviceTelemetry } from '../../services/deviceTelemetry';

export default function MonitorTwinView({ isDemoMode }) {
  const devices = useDeviceTelemetry('MONITOR', isDemoMode);

  return (
    <div className="w-full h-full p-6 flex flex-col gap-6 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight uppercase">Monitor Devices</h2>
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-bold">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          LIVE TELEMETRY
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[600px]">
        {devices.map(device => (
          <div key={device.id} className="flex flex-col bg-[#0f172a]/50 rounded-2xl border border-[#1e293b] overflow-hidden shadow-xl">
            <div className="p-4 border-b border-[#1e293b] flex items-center justify-between bg-black/20">
              <span className="font-bold text-sm tracking-wide text-white">{device.name}</span>
              <DeviceStatusBadge status={device.status} />
            </div>

            <div className="h-80 relative bg-gradient-to-b from-[#0f172a] to-[#020617] border-b border-[#1e293b]">
              <Canvas 
                camera={{ position: [0, 0, 8], fov: 45 }}
                gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
                onCreated={({ gl }) => {
                  gl.domElement.addEventListener('webglcontextlost', (e) => e.preventDefault(), false);
                }}
              >
                <ambientLight intensity={1.2} />
                <directionalLight position={[5, 10, 5]} intensity={1.8} />
                <Monitor status={device.status} telemetry={device} />
                <OrbitControls enableZoom={true} enablePan={false} maxPolarAngle={Math.PI / 1.8} minPolarAngle={Math.PI / 4} />
              </Canvas>
              <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/40 rounded text-[10px] text-white/50 backdrop-blur-sm pointer-events-none">
                Interactive 3D
              </div>
            </div>

            <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3 bg-[#0a0f1d] flex-1">
              <TelemetryCard title="Power" value={device.power} icon={Power} color={device.power === 'ON' ? 'emerald' : 'slate'} />
              <TelemetryCard title="Brightness" value={device.brightness} unit="%" icon={Sun} color="blue" />
              <TelemetryCard title="Temp" value={device.temperature} unit="°C" icon={Thermometer} color={device.temperature > 40 ? 'warning' : 'blue'} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

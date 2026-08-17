import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { Battery, Thermometer, Cpu, MemoryStick, Wifi } from 'lucide-react';
import Laptop from '../3d/Laptop';
import TelemetryCard from './TelemetryCard';
import DeviceStatusBadge from './DeviceStatusBadge';
import { useDeviceTelemetry } from '../../services/deviceTelemetry';

export default function LaptopTwinView({ isDemoMode }) {
  const devices = useDeviceTelemetry('LAPTOP', isDemoMode);

  return (
    <div className="w-full h-full p-6 flex flex-col gap-6 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight uppercase">Laptop Devices</h2>
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
                camera={{ position: [0, 2, 5], fov: 45 }}
                gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
                onCreated={({ gl }) => {
                  gl.domElement.addEventListener('webglcontextlost', (e) => e.preventDefault(), false);
                }}
              >
                <ambientLight intensity={1.2} />
                <directionalLight position={[5, 10, 5]} intensity={1.8} />
                <Laptop status={device.status} telemetry={device} />
                <OrbitControls enableZoom={true} enablePan={false} maxPolarAngle={Math.PI / 2} minPolarAngle={0} />
              </Canvas>
              <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/40 rounded text-[10px] text-white/50 backdrop-blur-sm pointer-events-none">
                Interactive 3D
              </div>
            </div>

            <div className="p-4 grid grid-cols-2 gap-3 bg-[#0a0f1d] flex-1">
              <TelemetryCard title="Battery" value={device.battery} unit="%" icon={Battery} color={device.battery < 20 ? 'rose' : 'emerald'} />
              <TelemetryCard title="Temp" value={device.temperature} unit="°C" icon={Thermometer} color={device.temperature > 40 ? 'warning' : 'blue'} />
              <TelemetryCard title="CPU" value={device.cpu} unit="%" icon={Cpu} color={device.cpu > 80 ? 'rose' : 'blue'} />
              <TelemetryCard title="RAM" value={device.ram} unit="%" icon={MemoryStick} color={device.ram > 80 ? 'amber' : 'slate'} />
              <TelemetryCard title="Network" value={device.network} icon={Wifi} color="slate" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { 
  Eye, Tv, Activity, RefreshCw, Info 
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend 
} from 'recharts';

import Laptop from '../3d/Laptop';
import DeviceStatusBadge from './DeviceStatusBadge';
import { useDeviceTelemetry } from '../../services/deviceTelemetry';
import LaptopTelemetryPanel from './LaptopTelemetryPanel';
import LaptopHealthPanel from './LaptopHealthPanel';
import LaptopComponentInspection from './LaptopComponentInspection';
import LaptopAlerts from './LaptopAlerts';

export default function LaptopTwinView({ isDemoMode }) {
  const devices = useDeviceTelemetry('LAPTOP', isDemoMode);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);

  // Auto-select: prefer first online device, else first device
  const laptopDevice = (() => {
    if (!devices || devices.length === 0) return null;
    if (selectedDeviceId) {
      const found = devices.find(d => d.id === selectedDeviceId);
      if (found) return found;
    }
    return devices.find(d => d.online !== false) || devices[0];
  })();

  // Selected component in 3D / Inspector
  const [selectedComponent, setSelectedComponent] = useState(null);
  
  // 3D Controls
  const [inspectInternals, setInspectInternals] = useState(false);
  const [lidAngle, setLidAngle] = useState(110); // Default open angle is 110 degrees

  // Telemetry History state for Recharts
  const [history, setHistory] = useState([]);
  const lastUpdatedRef = useRef(null);

  // A local live tick to force rendering of offline timer every second
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync telemetry updates into history buffer
  useEffect(() => {
    if (!laptopDevice || laptopDevice.online === false) return;

    // Check if the telemetry has updated since last save (limit updates to 1 per sec)
    const timestampKey = `${laptopDevice.cpu}-${laptopDevice.cpuTemp}-${laptopDevice.gpuTemp}-${laptopDevice.ram}`;
    if (lastUpdatedRef.current === timestampKey) return;
    lastUpdatedRef.current = timestampKey;

    setHistory((prevHistory) => {
      const timeLabel = new Date().toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      });

      const nextHistory = [
        ...prevHistory,
        {
          time: timeLabel,
          cpu: laptopDevice.cpu || 0,
          gpu: laptopDevice.gpu || 0,
          cpuTemp: laptopDevice.cpuTemp || laptopDevice.temperature || 0,
          gpuTemp: laptopDevice.gpuTemp || 0,
          ram: laptopDevice.ram || 0,
          battery: laptopDevice.battery || 0
        }
      ];

      // Keep only the last 15 data points
      if (nextHistory.length > 15) {
        return nextHistory.slice(nextHistory.length - 15);
      }
      return nextHistory;
    });
  }, [laptopDevice]);

  if (!laptopDevice) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-[#020617] gap-3">
        <RefreshCw className="w-8 h-8 text-sky-500 animate-spin" />
        <span className="text-sm font-semibold uppercase tracking-wider">Connecting to Laptop Telemetry Stream...</span>
      </div>
    );
  }

  // Active severity alerts highlight
  const isOnline = laptopDevice.online !== false;
  let bannerStyle = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
  let bannerText = 'All systems healthy. Operating temperatures and memory loads are within normal limits.';

  if (!isOnline) {
    bannerStyle = 'bg-rose-500/10 border-rose-500/20 text-rose-400';
    const elapsedSeconds = laptopDevice.lastSeen ? Math.round((Date.now() - laptopDevice.lastSeen) / 1000) : 0;
    bannerText = `LAPTOP OFFLINE. Last seen ${elapsedSeconds > 0 ? `${elapsedSeconds}s ago` : 'just now'}. Displaying last known telemetry data.`;
  } else if (laptopDevice.status === 'critical') {
    bannerStyle = 'bg-rose-500/10 border-rose-500/20 text-rose-400';
    bannerText = `CRITICAL WARNING: System metrics exceeded safe operational thresholds. CPU/GPU cooling requires inspection.`;
  } else if (laptopDevice.status === 'warning') {
    bannerStyle = 'bg-amber-500/10 border-amber-500/20 text-amber-400';
    bannerText = `SYSTEM WARNING: High thermal workload or memory constraints detected. Active cooling fan ramp-up initiated.`;
  }

  return (
    <div className="w-full h-full p-6 flex flex-col gap-6 overflow-y-auto bg-[#020617] scrollbar-thin text-white">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-extrabold tracking-wider uppercase text-white flex items-center gap-2">
              <Tv className="w-6 h-6 text-sky-400" />
              Laptop Digital Twin {laptopDevice.name && `[${laptopDevice.name}]`}
            </h2>
            <DeviceStatusBadge status={isOnline ? laptopDevice.status : 'offline'} />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isOnline ? 'Real-time visual state sync and predictive analytics for device: ' : 'Showing last cached state for disconnected device: '}
            <span className="font-mono text-sky-400">{laptopDevice.id}</span>
          </p>
        </div>

        {/* Right side: Device switcher + live badge */}
        <div className="flex items-center gap-3">
          {/* Multi-device selector (shown when >1 laptop) */}
          {devices.length > 1 && (
            <div className="flex items-center gap-1 p-1 bg-[#0a0f1d] rounded-xl border border-[#1e293b]">
              {devices.map(d => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDeviceId(d.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                    laptopDevice.id === d.id
                      ? 'bg-sky-500/20 border border-sky-500/40 text-sky-400'
                      : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    d.online !== false ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
                  }`} />
                  <span className="max-w-[80px] truncate">{d.name || d.id}</span>
                </button>
              ))}
            </div>
          )}

          {/* Live stream badge */}
          <div className="flex items-center gap-2">
            {!isOnline ? (
              <div className="flex items-center gap-2 px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full text-rose-400 text-xs font-bold w-fit">
                <div className="w-2 h-2 rounded-full bg-rose-500" />
                LAPTOP OFFLINE
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-bold w-fit">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {isDemoMode ? 'SIMULATOR ON' : 'LIVE SOCKET TELEMETRY'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Warning banner alert */}
      <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2.5 ${bannerStyle} animate-fadeIn`}>
        <Info className="w-4 h-4 flex-shrink-0" />
        <span>{bannerText}</span>
      </div>

      {/* 2. DUAL COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[620px]">
        {/* LEFT PANEL: 3D MODEL VIEWPORT (lg:span-7) */}
        <div className="lg:col-span-7 flex flex-col bg-[#0f172a]/30 border border-[#1e293b] rounded-2xl overflow-hidden shadow-2xl relative min-h-[500px]">
          {/* Header toolbar */}
          <div className="p-4 border-b border-[#1e293b] flex items-center justify-between bg-black/30">
            <span className="font-bold text-xs tracking-wider text-slate-300 uppercase flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-sky-400" />
              Interactive 3D Physical Twin
            </span>

            {/* Quick 3D options */}
            <div className="flex items-center gap-3">
              {/* Lid Angle Slider */}
              <div className="flex items-center gap-2 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-[#1e293b]">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Lid</span>
                <input 
                  type="range" 
                  min="0" 
                  max="120" 
                  value={lidAngle} 
                  onChange={(e) => setLidAngle(parseInt(e.target.value))}
                  className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-400"
                />
                <span className="text-[10px] font-mono text-sky-400 font-bold w-6">{lidAngle}°</span>
              </div>

              {/* Inspect internals mode toggle */}
              <button
                onClick={() => setInspectInternals(!inspectInternals)}
                className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                  inspectInternals 
                    ? 'bg-sky-500/20 border-sky-400 text-sky-400 shadow-md shadow-sky-500/10' 
                    : 'bg-slate-900/60 border-[#1e293b] text-slate-400 hover:text-white'
                }`}
              >
                {inspectInternals ? 'HIDE INTERNALS' : 'INSPECT INTERNALS'}
              </button>
            </div>
          </div>

          {/* Three.js R3F Canvas container */}
          <div className="flex-1 relative bg-gradient-to-b from-[#0f172a] to-[#020617]">
            <Canvas camera={{ position: [0, 2.2, 4.5], fov: 42 }}>
              <ambientLight intensity={0.6} />
              <spotLight position={[6, 12, 6]} intensity={1.8} angle={0.3} penumbra={1} castShadow />
              <pointLight position={[-4, 4, -4]} intensity={0.8} />
              <Environment preset="city" />
              
              <Laptop 
                status={laptopDevice.status} 
                telemetry={laptopDevice} 
                selectedComponent={selectedComponent}
                onSelectComponent={setSelectedComponent}
                inspectInternals={inspectInternals}
                lidAngle={lidAngle}
              />
              
              <ContactShadows position={[0, -0.6, 0]} opacity={0.6} scale={10} blur={2.2} far={2.0} />
              <OrbitControls 
                enableZoom={true} 
                enablePan={false} 
                maxPolarAngle={Math.PI / 2.1} 
                minPolarAngle={Math.PI / 4.5} 
              />
            </Canvas>

            {/* Quick Helper Labels Overlay */}
            <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-black/60 rounded-xl text-[10px] text-white/50 backdrop-blur-sm pointer-events-none border border-[#1e293b]/30">
              Drag to Orbit • Scroll to Zoom
            </div>

            {selectedComponent && (
              <div className="absolute top-3 left-3 px-3 py-1.5 bg-sky-500/15 border border-sky-500/30 rounded-xl text-[10px] text-sky-400 backdrop-blur-sm flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                Highlighting: <span className="font-bold uppercase">{selectedComponent}</span>
                <button 
                  onClick={() => setSelectedComponent(null)}
                  className="ml-2 font-black text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANELS COLUMN: HEALTH, INSPECTION & ALERTS (lg:span-5) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex-1">
            <LaptopHealthPanel telemetry={laptopDevice} />
          </div>
          <div className="flex-1">
            <LaptopComponentInspection 
              telemetry={laptopDevice} 
              selectedComponent={selectedComponent} 
              onSelectComponent={setSelectedComponent} 
            />
          </div>
          <div className="h-60">
            <LaptopAlerts telemetry={laptopDevice} />
          </div>
        </div>
      </div>

      {/* 3. BOTTOM PANEL: TELEMETRY & HISTORICAL TRENDS */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Span: Telemetry Stats */}
        <div className="xl:col-span-6">
          <LaptopTelemetryPanel telemetry={laptopDevice} />
        </div>

        {/* Right Span: Real-Time Recharts line history */}
        <div className="xl:col-span-6 flex flex-col bg-[#0a0f1d]/60 border border-[#1e293b] rounded-2xl p-4 backdrop-blur-md min-h-[300px]">
          <h3 className="text-sm font-bold tracking-wider text-slate-300 uppercase mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-400" />
            Live Telemetry Trends
          </h3>

          <div className="flex-1 w-full min-h-[220px] bg-black/10 rounded-xl p-2 border border-[#1e293b]/30">
            {history.length < 2 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                <Activity className="w-6 h-6 mb-1 text-slate-600 animate-pulse" />
                Gathering telemetry timeline...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                  <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 9 }} />
                  <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 9 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', fontSize: '10px' }}
                    labelClassName="text-slate-400 font-bold"
                  />
                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                  <Line 
                    type="monotone" 
                    dataKey="cpu" 
                    name="CPU (%)" 
                    stroke="#38bdf8" 
                    strokeWidth={2} 
                    dot={false} 
                    activeDot={{ r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="gpu" 
                    name="GPU (%)" 
                    stroke="#818cf8" 
                    strokeWidth={2} 
                    dot={false} 
                    activeDot={{ r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cpuTemp" 
                    name="CPU Temp (°C)" 
                    stroke="#ef4444" 
                    strokeWidth={2} 
                    dot={false} 
                    activeDot={{ r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="ram" 
                    name="RAM (%)" 
                    stroke="#a855f7" 
                    strokeWidth={2} 
                    dot={false} 
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

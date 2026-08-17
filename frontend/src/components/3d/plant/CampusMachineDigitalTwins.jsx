import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import MachineModelSelector from '../machines/MachineModelSelector';

function getStatusColor(status, healthScore) {
  if (status === 'WARNING' || (healthScore && healthScore < 92)) return '#f59e0b';
  if (status === 'CRITICAL' || status === 'OFFLINE' || (healthScore && healthScore < 80)) return '#ef4444';
  return '#22c55e';
}

export default function CampusMachineDigitalTwins({
  assets = [],
  selectedAssetId,
  selectedComponent,
  onSelectComponent,
  hoveredAssetId,
  onSelectAsset,
  onHoverAsset,
  viewMode = 'OVERVIEW',
  isHologramVibration = false,
}) {
  // Shop floor AGV refs
  const agv1Ref = useRef();
  const agv2Ref = useRef();
  const agvLidarRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // Autonomous Guided Vehicles (AGVs) with Rotating LiDAR
    if (agv1Ref.current) {
      const p = (t * 0.15) % 1.0;
      agv1Ref.current.position.x = -16 + Math.sin(p * Math.PI * 2) * 8;
      agv1Ref.current.position.z = 1 + Math.cos(p * Math.PI * 2) * 4;
      agv1Ref.current.rotation.y = p * Math.PI * 2 + Math.PI / 2;
    }
    if (agv2Ref.current) {
      const p = (t * 0.12 + 0.5) % 1.0;
      agv2Ref.current.position.x = 18 + Math.sin(p * Math.PI * 2) * 6;
      agv2Ref.current.position.z = 1 + Math.cos(p * Math.PI * 2) * 4;
      agv2Ref.current.rotation.y = p * Math.PI * 2 + Math.PI / 2;
    }
    if (agvLidarRef.current) {
      agvLidarRef.current.rotation.y = t * 16;
    }
  });

  const getAsset = (id) => assets.find((a) => a.id === id);

  const machineConfigs = [
    // Main Manufacturing Hall (BLD-PROD-01 at [-16, 0, -2])
    {
      id: 'CNC-MILL-01',
      position: [-24, 0.65, -2],
      beaconY: 3.5,
      cardY: 5.8,
      ringRadius: 3.0,
      metric1Label: 'Speed',
      metric1Val: '1,250 RPM',
      metric2Label: 'Load',
      metric2Val: '72%',
    },
    {
      id: 'PRESS-45T-02',
      position: [-16, 0.65, -2],
      beaconY: 4.8,
      cardY: 7.2,
      ringRadius: 3.4,
      metric1Label: 'Speed',
      metric1Val: '45 SPM',
      metric2Label: 'Load',
      metric2Val: '78%',
    },
    {
      id: 'CONV-12',
      position: [-8, 0.65, -2],
      beaconY: 2.8,
      cardY: 5.2,
      ringRadius: 3.8,
      metric1Label: 'Speed',
      metric1Val: '38 m/min',
      metric2Label: 'Load',
      metric2Val: '60%',
    },

    // Robotic Assembly Hall (BLD-ROBOT-02 at [18, 0, 6])
    {
      id: 'ROBOT-ARM-07',
      position: [18, 0.65, 6],
      beaconY: 3.8,
      cardY: 6.2,
      ringRadius: 2.8,
      metric1Label: 'Speed',
      metric1Val: '85%',
      metric2Label: 'Load',
      metric2Val: '65%',
    },

    // Process Plant (BLD-PROC-04 at [42, 0, -8])
    {
      id: 'PUMP-P-204',
      position: [42, 0.65, -8],
      beaconY: 3.0,
      cardY: 5.4,
      ringRadius: 2.8,
      metric1Label: 'Flow',
      metric1Val: '125.6 m³/h',
      metric2Label: 'Pressure',
      metric2Val: '6.2 bar',
    },

    // Utility & Boiler House (BLD-UTIL-05 at [18, 0, -22])
    {
      id: 'BOILER-B-02',
      position: [14, 0.65, -22],
      beaconY: 4.4,
      cardY: 6.8,
      ringRadius: 3.6,
      metric1Label: 'Temp.',
      metric1Val: '182.4 °C',
      metric2Label: 'Pressure',
      metric2Val: '12.5 bar',
    },
    {
      id: 'COMP-01',
      position: [22, 0.65, -22],
      beaconY: 3.2,
      cardY: 5.5,
      ringRadius: 3.0,
      metric1Label: 'Pressure',
      metric1Val: '7.1 bar',
      metric2Label: 'Temp.',
      metric2Val: '68.2 °C',
    },
    {
      id: 'MOTOR-M-15',
      position: [18, 0.65, -14],
      beaconY: 2.8,
      cardY: 5.2,
      ringRadius: 2.6,
      metric1Label: 'Speed',
      metric1Val: '1,480 RPM',
      metric2Label: 'Vibration',
      metric2Val: '2.1 mm/s',
    },
  ];

  return (
    <group>
      {machineConfigs.map((cfg) => {
        const asset = getAsset(cfg.id);
        const isSelected = selectedAssetId === cfg.id;
        const isHovered = hoveredAssetId === cfg.id;
        const statusColor = getStatusColor(asset?.status, asset?.healthScore);
        const activeComp = isSelected ? selectedComponent : null;
        const health = asset?.healthScore || 95;

        return (
          <group
            key={cfg.id}
            position={cfg.position}
            onClick={(e) => {
              e.stopPropagation();
              onSelectAsset?.(cfg.id);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              onHoverAsset?.(cfg.id);
            }}
            onPointerOut={() => onHoverAsset?.(null)}
          >
            {/* REALISTIC 3D INDUSTRIAL MACHINE MODEL */}
            <MachineModelSelector
              machineId={cfg.id}
              isHologram={isHologramVibration}
              viewMode={viewMode}
              selectedComponent={activeComp}
              setSelectedComponent={(comp) => {
                onSelectAsset?.(cfg.id);
                onSelectComponent?.(comp);
              }}
              isSimulatingFailure={asset?.aiRiskScore === 'HIGH' || asset?.status === 'WARNING'}
              components={asset?.components || []}
              telemetry={asset}
            />

            {/* YELLOW SAFETY PERIMETER FENCE & CELL BOUNDARY */}
            <group position={[0, 0, 0]}>
              {[-2.6, 2.6].map((x, i) =>
                [-2.4, 2.4].map((z, j) => (
                  <mesh key={`post-${i}-${j}`} position={[x, 0.6, z]}>
                    <cylinderGeometry args={[0.04, 0.04, 1.2, 8]} />
                    <meshStandardMaterial color="#eab308" metalness={0.8} roughness={0.3} />
                  </mesh>
                ))
              )}
              <mesh position={[0, 0.8, -2.4]}>
                <boxGeometry args={[5.2, 0.06, 0.04]} />
                <meshStandardMaterial color="#eab308" metalness={0.8} />
              </mesh>
              <mesh position={[0, 0.8, 2.4]}>
                <boxGeometry args={[5.2, 0.06, 0.04]} />
                <meshStandardMaterial color="#eab308" metalness={0.8} />
              </mesh>
            </group>

            {/* DIGITAL TWIN GROUND SELECTION RING */}
            {isSelected && (
              <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[cfg.ringRadius - 0.1, cfg.ringRadius + 0.1, 32]} />
                <meshBasicMaterial color="#00c2ff" side={THREE.DoubleSide} transparent opacity={0.9} />
              </mesh>
            )}

            {isHovered && !isSelected && (
              <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[cfg.ringRadius - 0.05, cfg.ringRadius + 0.05, 32]} />
                <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} transparent opacity={0.6} />
              </mesh>
            )}

            {/* Pulsing Telemetry Sensor Beacon Node */}
            <mesh position={[0, cfg.beaconY, 0]}>
              <sphereGeometry args={[0.14, 16, 16]} />
              <meshBasicMaterial color="#00c2ff" />
            </mesh>

            {/* 3D Vertical Cyan Link Line connecting Machine Beacon to Floating HUD Card */}
            <mesh position={[0, cfg.beaconY + (cfg.cardY - cfg.beaconY) * 0.5 - 0.2, 0]}>
              <cylinderGeometry args={[0.015, 0.015, cfg.cardY - cfg.beaconY - 0.4, 8]} />
              <meshBasicMaterial color="#00c2ff" transparent opacity={0.75} />
            </mesh>

            {/* FLOATING DIGITAL TWIN HUD CARD (EXACT MATCH TO REFERENCE IMAGE) */}
            <Html
              position={[0, cfg.cardY, 0]}
              center
              distanceFactor={28}
              zIndexRange={[100, 0]}
            >
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectAsset?.(cfg.id);
                }}
                className={`w-[195px] p-3 rounded-xl border backdrop-blur-xl transition-all shadow-[0_0_25px_rgba(0,194,255,0.3)] cursor-pointer select-none font-sans ${
                  isSelected
                    ? 'bg-[#09132c]/95 border-[#00c2ff] ring-2 ring-[#00c2ff]/50 scale-105'
                    : isHovered
                    ? 'bg-[#09132c]/90 border-[#38bdf8] scale-100'
                    : 'bg-[#081126]/85 border-[#00c2ff]/50 hover:border-[#00c2ff]'
                }`}
              >
                {/* Header: Machine ID & Status Pill */}
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-extrabold text-white text-xs tracking-wide">
                    {cfg.id}
                  </span>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-extrabold text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>Running</span>
                  </div>
                </div>

                {/* Telemetry Rows */}
                <div className="space-y-1.5 text-[11px] font-medium border-t border-white/10 pt-2">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Status</span>
                    <span className="font-bold text-emerald-400">Running</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">{cfg.metric1Label}</span>
                    <span className="font-bold text-white font-mono">{cfg.metric1Val}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">{cfg.metric2Label}</span>
                    <span className="font-bold text-white font-mono">{cfg.metric2Val}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-white/10">
                    <span className="text-slate-400">Health</span>
                    <div className="flex items-center gap-1 font-bold text-emerald-400">
                      <span>💚</span>
                      <span>{health}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </Html>
          </group>
        );
      })}

      {/* ======================================================== */}
      {/* AUTONOMOUS GUIDED VEHICLES (AGVs) on Shop Floor */}
      {/* ======================================================== */}
      {/* AGV 1 (Left aisle) */}
      <group ref={agv1Ref} position={[-16, 0.75, 1]}>
        <mesh position={[0, 0.2, 0]} castShadow>
          <boxGeometry args={[1.8, 0.4, 1.2]} />
          <meshStandardMaterial color="#eab308" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.55, 0]} castShadow>
          <boxGeometry args={[1.2, 0.4, 0.9]} />
          <meshStandardMaterial color="#475569" metalness={0.7} />
        </mesh>
        <group ref={agvLidarRef} position={[0.7, 0.5, 0.4]}>
          <mesh>
            <cylinderGeometry args={[0.06, 0.06, 0.15, 8]} />
            <meshBasicMaterial color="#00c2ff" />
          </mesh>
        </group>
      </group>

      {/* AGV 2 (Right aisle) */}
      <group ref={agv2Ref} position={[18, 0.75, 1]}>
        <mesh position={[0, 0.2, 0]} castShadow>
          <boxGeometry args={[1.8, 0.4, 1.2]} />
          <meshStandardMaterial color="#eab308" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.55, 0]} castShadow>
          <boxGeometry args={[1.2, 0.4, 0.9]} />
          <meshStandardMaterial color="#1e3a8a" roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
}

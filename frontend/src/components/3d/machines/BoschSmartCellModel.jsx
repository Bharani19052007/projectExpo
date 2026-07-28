import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { HolographicTwinEngine } from '../hologram/HolographicTwinEngine';

export default function BoschSmartCellModel({
  isHologram = false,
  viewMode = 'CAD',
  selectedComponent,
  setSelectedComponent,
  isSimulatingFailure = false,
  components = [],
}) {
  const cobotRef = useRef(null);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    if (cobotRef.current) {
      cobotRef.current.position.y = 0.6 + Math.sin(time * 2.0) * 0.06;
      cobotRef.current.rotation.y = Math.cos(time * 1.2) * 0.2;
    }
  });

  return (
    <group>
      {/* BASE STRUT ALUMINUM CELL FRAME */}
      <group position={[0, -0.6, 0]}>
        <mesh position={[0, 0, 0]} userData={{ defaultColor: '#cbd5e1' }}>
          <boxGeometry args={[5.2, 0.12, 2.6]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
        </mesh>
      </group>

      <group>
        {/* 1. Perimeter Safety Cage (Aluminum Strut Mesh) */}
        <group userData={{ compId: 'safety-cage' }} position={[0, 0.6, 1.2]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'safety-cage')); }}>
          <mesh userData={{ defaultColor: '#94a3b8' }}>
            <boxGeometry args={[4.8, 2.4, 0.05]} />
            <meshStandardMaterial color="#94a3b8" wireframe={true} />
          </mesh>
        </group>

        {/* 2. APAS Collaborative Cobot Arm */}
        <group ref={cobotRef} userData={{ compId: 'cobot-arm' }} position={[0, 0.6, 0]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'cobot-arm')); }}>
          {/* White Capacitive Safety Skin Base */}
          <mesh userData={{ defaultColor: '#f8fafc' }}>
            <cylinderGeometry args={[0.32, 0.38, 0.8, 24]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.2} />
          </mesh>
          {/* Teal Accent Joint Band */}
          <mesh position={[0, 0.35, 0]} userData={{ defaultColor: '#0d9488' }}>
            <cylinderGeometry args={[0.33, 0.33, 0.1, 24]} />
            <meshStandardMaterial color="#0d9488" />
          </mesh>
          {/* Upper Arm Link */}
          <mesh position={[0.3, 0.6, 0]} rotation={[0, 0, -0.3]} userData={{ defaultColor: '#f8fafc' }}>
            <cylinderGeometry args={[0.18, 0.18, 1.0, 20]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.2} />
          </mesh>
        </group>

        {/* 3. Smart Pneumatic Gripper */}
        <group userData={{ compId: 'smart-gripper' }} position={[1.2, 1.0, 0]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'smart-gripper')); }}>
          <mesh userData={{ defaultColor: '#0d9488' }}>
            <boxGeometry args={[0.35, 0.28, 0.35]} />
            <meshStandardMaterial color="#0d9488" metalness={0.7} />
          </mesh>
        </group>

        {/* 4. Modular Track Conveyor */}
        <group userData={{ compId: 'modular-conveyor' }} position={[-2.0, 0.2, 0]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'modular-conveyor')); }}>
          <mesh userData={{ defaultColor: '#334155' }}>
            <boxGeometry args={[2.4, 0.2, 0.7]} />
            <meshStandardMaterial color="#334155" roughness={0.5} />
          </mesh>
        </group>

        {/* 5. Rexroth PLC Cabinet */}
        <group userData={{ compId: 'plc-cabinet' }} position={[2.2, 0.6, 0]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'plc-cabinet')); }}>
          <mesh userData={{ defaultColor: '#1e293b' }}>
            <boxGeometry args={[0.9, 1.6, 0.8]} />
            <meshStandardMaterial color="#1e293b" roughness={0.4} />
          </mesh>
        </group>

        {/* 6. 3D Vision Camera Tower */}
        <group userData={{ compId: 'vision-camera-3d' }} position={[0, 1.8, 0]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'vision-camera-3d')); }}>
          <mesh userData={{ defaultColor: '#38bdf8' }}>
            <boxGeometry args={[0.35, 0.35, 0.55]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.2} metalness={0.8} />
          </mesh>
        </group>

        {/* 7. Inspection Station */}
        <group userData={{ compId: 'inspection-station' }} position={[-1.2, 0.4, 0.8]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'inspection-station')); }}>
          <mesh userData={{ defaultColor: '#475569' }}>
            <cylinderGeometry args={[0.38, 0.38, 0.7, 24]} />
            <meshStandardMaterial color="#475569" metalness={0.8} />
          </mesh>
        </group>

        {/* 8. Precision Fixture Table */}
        <group userData={{ compId: 'fixture-table' }} position={[1.2, 0.2, 0.8]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'fixture-table')); }}>
          <mesh userData={{ defaultColor: '#64748b' }}>
            <boxGeometry args={[0.9, 0.45, 0.9]} />
            <meshStandardMaterial color="#64748b" metalness={0.7} />
          </mesh>
        </group>

      </group>

      {/* HOLOGRAPHIC DIGITAL TWIN OVERLAY */}
      {isHologram && (
        <HolographicTwinEngine 
          components={components}
          selectedComponent={selectedComponent}
          setSelectedComponent={setSelectedComponent}
          isSimulatingFailure={isSimulatingFailure}
        />
      )}
    </group>
  );
}

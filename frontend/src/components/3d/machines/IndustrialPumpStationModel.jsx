import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { HolographicTwinEngine } from '../hologram/HolographicTwinEngine';

export default function IndustrialPumpStationModel({
  isHologram = false,
  viewMode = 'CAD',
  selectedComponent,
  setSelectedComponent,
  isSimulatingFailure = false,
  components = [],
}) {
  const impellerRef = useRef(null);

  useFrame((state, delta) => {
    if (impellerRef.current) {
      impellerRef.current.rotation.z += delta * 7.5;
    }
  });

  return (
    <group>
      {/* CAST IRON BASEPLATE SKID */}
      <group position={[0, -0.65, 0]}>
        <mesh position={[0, 0, 0]} userData={{ defaultColor: '#334155' }}>
          <boxGeometry args={[6.0, 0.15, 2.2]} />
          <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.8} />
        </mesh>
      </group>

      <group>
        {/* 1. Stainless Steel Impeller Assembly */}
        <group ref={impellerRef} userData={{ compId: 'impeller-stage' }} position={[0, 0, 0]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'impeller-stage')); }}>
          <mesh userData={{ defaultColor: '#f1f5f9' }}>
            <cylinderGeometry args={[0.58, 0.58, 0.45, 32]} />
            <meshStandardMaterial color="#f1f5f9" metalness={0.98} roughness={0.08} />
          </mesh>
        </group>

        {/* 2. Precision Pump Shaft */}
        <group userData={{ compId: 'pump-shaft' }} position={[-0.8, 0, 0]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'pump-shaft')); }}>
          <mesh rotation={[0, 0, Math.PI / 2]} userData={{ defaultColor: '#cbd5e1' }}>
            <cylinderGeometry args={[0.13, 0.13, 1.9, 20]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.95} />
          </mesh>
        </group>

        {/* 3. Heavy Duty Radial Bearings */}
        <group userData={{ compId: 'radial-bearings' }} position={[-1.4, 0, 0]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'radial-bearings')); }}>
          <mesh userData={{ defaultColor: '#475569' }}>
            <cylinderGeometry args={[0.32, 0.32, 0.35, 24]} rotation={[0, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#475569" metalness={0.8} />
          </mesh>
        </group>

        {/* 4. Mechanical Flush Seal */}
        <group userData={{ compId: 'mechanical-seal' }} position={[-0.4, 0, 0]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'mechanical-seal')); }}>
          <mesh userData={{ defaultColor: '#0f766e' }}>
            <cylinderGeometry args={[0.26, 0.26, 0.28, 20]} rotation={[0, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#0f766e" metalness={0.8} />
          </mesh>
        </group>

        {/* 5. 75kW Induction Motor */}
        <group userData={{ compId: 'pump-motor' }} position={[-2.2, 0.4, 0]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'pump-motor')); }}>
          <mesh rotation={[0, 0, Math.PI / 2]} userData={{ defaultColor: '#1d4ed8' }}>
            <cylinderGeometry args={[0.55, 0.55, 1.3, 32]} />
            <meshStandardMaterial color="#1d4ed8" roughness={0.3} metalness={0.7} />
          </mesh>
        </group>

        {/* 6. Flanged Suction Pipe */}
        <group userData={{ compId: 'suction-pipe' }} position={[0, -1.0, -0.6]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'suction-pipe')); }}>
          <mesh userData={{ defaultColor: '#0284c7' }}>
            <cylinderGeometry args={[0.26, 0.26, 1.3, 20]} />
            <meshStandardMaterial color="#0284c7" metalness={0.8} />
          </mesh>
        </group>

        {/* 7. High-Pressure Discharge Pipe */}
        <group userData={{ compId: 'discharge-pipe' }} position={[0, 1.2, 0.6]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'discharge-pipe')); }}>
          <mesh userData={{ defaultColor: '#0284c7' }}>
            <cylinderGeometry args={[0.22, 0.22, 1.5, 20]} />
            <meshStandardMaterial color="#0284c7" metalness={0.8} />
          </mesh>
          {/* Pressure Gauge Dial */}
          <mesh position={[0.25, 0.3, 0]} rotation={[0, Math.PI / 2, 0]} userData={{ defaultColor: '#cbd5e1' }}>
            <cylinderGeometry args={[0.12, 0.12, 0.04, 20]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
          </mesh>
        </group>

        {/* 8. Automated Pump Control Panel */}
        <group userData={{ compId: 'control-panel-pump' }} position={[2.0, 0.4, 0.8]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'control-panel-pump')); }}>
          <mesh userData={{ defaultColor: '#1e293b' }}>
            <boxGeometry args={[0.65, 1.2, 0.55]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        </group>

      </group>

      {/* HOLOGRAPHIC TWIN OVERLAY */}
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

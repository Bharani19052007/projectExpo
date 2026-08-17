import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function SubstationAndPowerGrid({
  selectedAsset,
  onSelectAsset,
  hoveredAsset,
  onHoverAsset,
  viewMode = 'CAD',
}) {
  const sparkRef = useRef();
  const powerPulseMaterialRef = useRef();

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    if (sparkRef.current) {
      sparkRef.current.intensity = 0.8 + Math.sin(time * 12) * 0.4;
    }
    if (powerPulseMaterialRef.current) {
      powerPulseMaterialRef.current.emissiveIntensity = 0.6 + Math.sin(time * 4) * 0.35;
    }
  });

  const getMaterial = (assetId, defaultColor, roughness = 0.35, metalness = 0.65) => {
    const isSelected = selectedAsset?.id === assetId;
    const isHovered = hoveredAsset?.id === assetId;

    if (viewMode === 'HOLOGRAM') {
      return (
        <meshStandardMaterial
          color={isSelected ? '#00f0ff' : '#0ea5e9'}
          emissive={isSelected ? '#00f0ff' : '#0284c7'}
          emissiveIntensity={isSelected ? 1.2 : isHovered ? 0.8 : 0.4}
          wireframe
          transparent
          opacity={0.85}
        />
      );
    }

    if (viewMode === 'THERMAL') {
      return (
        <meshStandardMaterial
          color="#3b82f6"
          emissive="#3b82f6"
          emissiveIntensity={isSelected ? 0.6 : 0.2}
          roughness={0.4}
        />
      );
    }

    if (viewMode === 'VIBRATION') {
      return (
        <meshStandardMaterial
          color="#10b981"
          emissive="#10b981"
          emissiveIntensity={isSelected ? 0.5 : 0.1}
          roughness={0.4}
        />
      );
    }

    const baseColor = isSelected ? '#00e5ff' : isHovered ? '#b0cfe8' : defaultColor;
    const emissive = isSelected ? '#00e5ff' : isHovered ? '#4fc3f7' : '#000000';
    const emissiveIntensity = isSelected ? 0.75 : isHovered ? 0.22 : 0.0;

    return (
      <meshStandardMaterial
        color={baseColor}
        roughness={roughness}
        metalness={metalness}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
      />
    );
  };

  return (
    <group position={[44, 0, 18]}>
      {/* 1. Crushed Stone Gravel Yard & Concrete Slab */}
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <boxGeometry args={[18, 0.2, 18]} />
        <meshStandardMaterial color="#78808a" roughness={0.95} metalness={0.0} />
      </mesh>

      {/* 2. Security Chain-Link Fence & Safety Posts */}
      <mesh position={[0, 1.4, 0]}>
        <boxGeometry args={[17.6, 2.8, 17.6]} />
        <meshStandardMaterial color="#475569" wireframe transparent opacity={0.3} />
      </mesh>
      {[-8.6, 8.6].map((x, i) =>
        [-8.6, 8.6].map((z, j) => (
          <mesh key={`post-${i}-${j}`} position={[x, 1.4, z]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 2.8, 8]} />
            <meshStandardMaterial color="#eab308" metalness={0.8} />
          </mesh>
        ))
      )}

      {/* High-Voltage Warning Sign Board */}
      <mesh position={[0, 2.2, 8.85]} userData={{ defaultColor: '#eab308' }}>
        <boxGeometry args={[1.2, 0.8, 0.04]} />
        <meshStandardMaterial color="#eab308" roughness={0.3} />
      </mesh>

      {/* ============================================================ */}
      {/* 3. SUBSTATION-MAIN-01: 110kV Heavy Power Transformer */}
      {/* ============================================================ */}
      <group
        position={[-3, 0, -2]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectAsset('SUBSTATION-MAIN-01');
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHoverAsset('SUBSTATION-MAIN-01');
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onHoverAsset(null);
        }}
      >
        {/* Reinforced Concrete Plinth */}
        <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
          <boxGeometry args={[5.2, 0.5, 4.2]} />
          {getMaterial('SUBSTATION-MAIN-01', '#334155', 0.7, 0.3)}
        </mesh>

        {/* Transformer Tank Oil Chamber */}
        <mesh position={[0, 2.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.8, 3.2, 2.8]} />
          {getMaterial('SUBSTATION-MAIN-01', '#475569', 0.35, 0.65)}
        </mesh>

        {/* Corrugated Oil Radiator Cooling Fin Banks */}
        {[-2.2, 2.2].map((x, idx) => (
          <group key={`rad-group-${idx}`} position={[x, 2.2, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.4, 2.6, 2.4]} />
              {getMaterial('SUBSTATION-MAIN-01', '#0ea5e9', 0.4, 0.6)}
            </mesh>
            {/* Forced Air Cooling Fan Assemblies */}
            {[-0.6, 0.6].map((z, fIdx) => (
              <mesh key={`fan-${fIdx}`} position={[0, -0.4, z]} rotation={[0, Math.PI / 2, 0]} castShadow>
                <cylinderGeometry args={[0.3, 0.3, 0.1, 16]} />
                <meshStandardMaterial color="#1e293b" />
              </mesh>
            ))}
          </group>
        ))}

        {/* Oil Conservator Expansion Drum */}
        <mesh position={[0, 4.2, -0.8]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.5, 0.5, 3.2, 20]} />
          {getMaterial('SUBSTATION-MAIN-01', '#64748b', 0.3, 0.7)}
        </mesh>

        {/* 3 High-Voltage 110kV Porcelain Insulator Bushings */}
        {[-1.1, 0, 1.1].map((x, idx) => (
          <group key={`bushing-${idx}`} position={[x, 3.8, 0.6]}>
            {/* Tapered Brown Porcelain Shed Stack */}
            <mesh position={[0, 0.7, 0]} castShadow>
              <cylinderGeometry args={[0.14, 0.22, 1.6, 12]} />
              {getMaterial('SUBSTATION-MAIN-01', '#9a3412', 0.2, 0.8)}
            </mesh>
            {/* Copper Top Terminal Ring */}
            <mesh position={[0, 1.55, 0]} castShadow>
              <torusGeometry args={[0.15, 0.04, 8, 16]} rotation={[Math.PI / 2, 0, 0]} />
              {getMaterial('SUBSTATION-MAIN-01', '#d97706', 0.1, 0.9)}
            </mesh>
          </group>
        ))}

        <pointLight
          ref={sparkRef}
          position={[0, 4.5, 0.6]}
          color="#38bdf8"
          intensity={0.8}
          distance={10}
          decay={2}
        />
      </group>

      {/* ============================================================ */}
      {/* 4. HV CIRCUIT BREAKERS & DISCONNECT SWITCHES */}
      {/* ============================================================ */}
      <group position={[4, 0, -2]}>
        {/* SF6 Gas Circuit Breaker Tanks */}
        {[-2, 0, 2].map((x, idx) => (
          <group key={`breaker-${idx}`} position={[x, 0, 0]}>
            <mesh position={[0, 0.3, 0]} castShadow>
              <boxGeometry args={[1.0, 0.4, 1.0]} />
              {getMaterial('SUBSTATION-MAIN-01', '#334155', 0.5, 0.5)}
            </mesh>
            <mesh position={[0, 1.4, 0]} castShadow>
              <cylinderGeometry args={[0.35, 0.35, 1.8, 16]} />
              {getMaterial('SUBSTATION-MAIN-01', '#475569', 0.3, 0.7)}
            </mesh>
            {/* Porcelain Insulator Columns */}
            <mesh position={[0, 2.7, 0]} castShadow>
              <cylinderGeometry args={[0.12, 0.16, 0.9, 12]} />
              {getMaterial('SUBSTATION-MAIN-01', '#9a3412', 0.2, 0.8)}
            </mesh>
          </group>
        ))}
      </group>

      {/* ============================================================ */}
      {/* 5. GRID-FEED-01: Transmission Line Lattice Pylon */}
      {/* ============================================================ */}
      <group
        position={[6, 0, 4]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectAsset('GRID-FEED-01');
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHoverAsset('GRID-FEED-01');
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onHoverAsset(null);
        }}
      >
        <mesh position={[0, 6.0, 0]} castShadow>
          <cylinderGeometry args={[0.6, 1.8, 12, 4]} />
          {getMaterial('GRID-FEED-01', '#64748b', 0.4, 0.8)}
        </mesh>
        <mesh position={[0, 10.0, 0]} castShadow>
          <boxGeometry args={[5.2, 0.3, 0.3]} />
          {getMaterial('GRID-FEED-01', '#475569', 0.3, 0.8)}
        </mesh>
        <mesh position={[0, 11.5, 0]} castShadow>
          <boxGeometry args={[3.8, 0.3, 0.3]} />
          {getMaterial('GRID-FEED-01', '#475569', 0.3, 0.8)}
        </mesh>
      </group>

      {/* ============================================================ */}
      {/* 6. POWER FLOW DIGITAL TWIN OVERLAY LINES (Substation -> Factory) */}
      {/* ============================================================ */}
      <group position={[-3, 4.5, 0]}>
        {/* Overhead Busbar Conductor Lines */}
        <mesh position={[-15, 0, -6]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, 30, 12]} />
          <meshStandardMaterial
            ref={powerPulseMaterialRef}
            color="#00c2ff"
            emissive="#00c2ff"
            emissiveIntensity={0.8}
            transparent
            opacity={0.9}
          />
        </mesh>
        <mesh position={[-15, 0, -5.7]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, 30, 12]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#0284c7"
            emissiveIntensity={0.7}
            transparent
            opacity={0.85}
          />
        </mesh>
      </group>
    </group>
  );
}

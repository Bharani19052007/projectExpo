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

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (sparkRef.current) {
      sparkRef.current.intensity = 0.8 + Math.sin(time * 12) * 0.4;
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

    const baseColor = isSelected ? '#00e5ff' : isHovered ? '#4fc3f7' : defaultColor;
    const emissive = isSelected ? '#00e5ff' : isHovered ? '#0284c7' : '#041d48';
    const emissiveIntensity = isSelected ? 0.9 : isHovered ? 0.5 : 0.16;

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
    <group>
      {/* Gravel Pit & Safety Enclosure */}
      <mesh position={[30, 0.1, 8]} receiveShadow>
        <boxGeometry args={[14, 0.2, 14]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} />
      </mesh>

      {/* Safety Chainlink Fence */}
      <mesh position={[30, 1.2, 8]}>
        <boxGeometry args={[13.8, 2.4, 13.8]} />
        <meshStandardMaterial color="#0284c7" wireframe transparent opacity={0.25} />
      </mesh>

      {/* ============================================================ */}
      {/* 1. SUBSTATION-MAIN-01: 132kV/11kV Main Power Transformer */}
      {/* ============================================================ */}
      <group
        position={[28, 0, 8]}
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
        {/* Concrete Foundation Plinth */}
        <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.2, 0.6, 3.4]} />
          {getMaterial('SUBSTATION-MAIN-01', '#334155', 0.7, 0.3)}
        </mesh>

        {/* Transformer Main Oil Tank Body */}
        <mesh position={[0, 2.0, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.2, 2.8, 2.4]} />
          {getMaterial('SUBSTATION-MAIN-01', '#475569', 0.35, 0.65)}
        </mesh>

        {/* External Oil Radiator Cooling Fin Banks */}
        {[-1.8, 1.8].map((x, idx) => (
          <mesh key={`rad-${idx}`} position={[x, 2.0, 0]} castShadow>
            <boxGeometry args={[0.3, 2.2, 2.2]} />
            {getMaterial('SUBSTATION-MAIN-01', '#0ea5e9', 0.4, 0.6)}
          </mesh>
        ))}

        {/* Oil Conservator Drum (Upper Horizontal Cylinder) */}
        <mesh position={[0, 3.8, -0.6]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.4, 0.4, 2.6, 16]} />
          {getMaterial('SUBSTATION-MAIN-01', '#64748b', 0.3, 0.7)}
        </mesh>

        {/* 3 High-Voltage Ceramic Insulator Bushings (132kV) */}
        {[-0.8, 0, 0.8].map((x, idx) => (
          <group key={`bushing-${idx}`} position={[x, 3.4, 0.5]}>
            {/* Bushing Sheds */}
            <mesh position={[0, 0.6, 0]} castShadow>
              <cylinderGeometry args={[0.12, 0.18, 1.4, 12]} />
              {getMaterial('SUBSTATION-MAIN-01', '#b45309', 0.2, 0.8)}
            </mesh>
            {/* Top Terminal Cap */}
            <mesh position={[0, 1.35, 0]} castShadow>
              <sphereGeometry args={[0.1, 12, 12]} />
              {getMaterial('SUBSTATION-MAIN-01', '#f59e0b', 0.1, 0.9)}
            </mesh>
          </group>
        ))}

        {/* Substation Ambient Glow */}
        <pointLight
          ref={sparkRef}
          position={[0, 4.0, 0.5]}
          color="#38bdf8"
          intensity={1.0}
          distance={10}
          decay={2}
        />
      </group>

      {/* ============================================================ */}
      {/* 2. GRID-FEED-01: Structural Transmission Lattice Pylon Tower */}
      {/* ============================================================ */}
      <group
        position={[34, 0, 11]}
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
        {/* Tapered Lattice Tower Mast */}
        <mesh position={[0, 6.0, 0]} castShadow>
          <cylinderGeometry args={[0.6, 1.8, 12, 4]} />
          {getMaterial('GRID-FEED-01', '#64748b', 0.4, 0.8)}
        </mesh>

        {/* Cross Arms */}
        <mesh position={[0, 10.0, 0]} castShadow>
          <boxGeometry args={[4.8, 0.3, 0.3]} />
          {getMaterial('GRID-FEED-01', '#475569', 0.3, 0.8)}
        </mesh>
        <mesh position={[0, 11.5, 0]} castShadow>
          <boxGeometry args={[3.6, 0.3, 0.3]} />
          {getMaterial('GRID-FEED-01', '#475569', 0.3, 0.8)}
        </mesh>
      </group>
    </group>
  );
}

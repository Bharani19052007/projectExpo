import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import SteamParticleSystem from './SteamParticleSystem';

export default function CoolingAndBoilerUtilities({
  selectedAsset,
  onSelectAsset,
  hoveredAsset,
  onHoverAsset,
  viewMode = 'CAD',
}) {
  const fan1Ref = useRef();
  const fan2Ref = useRef();
  const fan3Ref = useRef();

  useFrame((state, delta) => {
    // Continuous rotating cooling tower draft fans
    if (fan1Ref.current) fan1Ref.current.rotation.y += delta * 8;
    if (fan2Ref.current) fan2Ref.current.rotation.y += delta * 8;
    if (fan3Ref.current) fan3Ref.current.rotation.y += delta * 7.5;
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
      const color = assetId === 'BOILER-STM-01' ? '#ef4444' : '#0284c7';
      return (
        <meshStandardMaterial
          color={color}
          emissive={color}
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

    // Realistic CAD mode — realistic materials, only DT highlight on selection
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
    <group>
      {/* ============================================================ */}
      {/* 1. COOL-TWR-01: Hyperbolic Cooling Tower Alpha */}
      {/* ============================================================ */}
      <group
        position={[20, 0, -24]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectAsset('COOL-TWR-01');
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHoverAsset('COOL-TWR-01');
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onHoverAsset(null);
        }}
      >
        {/* Concrete Water Basin */}
        <mesh position={[0, 0.4, 0]} receiveShadow>
          <cylinderGeometry args={[4.2, 4.5, 0.8, 32]} />
          {getMaterial('COOL-TWR-01', '#B8C1C8', 0.8, 0.2)}
        </mesh>

        {/* Lower Intake Diagonal Louvers */}
        <mesh position={[0, 1.4, 0]} castShadow>
          <cylinderGeometry args={[3.8, 4.2, 1.2, 24, 1, true]} />
          {getMaterial('COOL-TWR-01', '#D7DEE3', 0.5, 0.15)}
        </mesh>

        {/* Hyperbolic Tower Shell - Lower Taper */}
        <mesh position={[0, 4.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[2.8, 3.8, 5.0, 32, 1, true]} />
          {getMaterial('COOL-TWR-01', '#D7DEE3', 0.6, 0.12)}
        </mesh>

        {/* Hyperbolic Tower Shell - Upper Flare */}
        <mesh position={[0, 8.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[3.2, 2.8, 3.0, 32, 1, true]} />
          {getMaterial('COOL-TWR-01', '#DCE4E9', 0.6, 0.12)}
        </mesh>

        {/* Top Rim Collar - dark steel ring */}
        <mesh position={[0, 10.0, 0]}>
          <torusGeometry args={[3.2, 0.12, 12, 32]} />
          {getMaterial('COOL-TWR-01', '#4B5965', 0.3, 0.7)}
        </mesh>

        {/* Internal Spinning Fan Assembly */}
        <group ref={fan1Ref} position={[0, 8.0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
            {getMaterial('COOL-TWR-01', '#0284c7', 0.2, 0.8)}
          </mesh>
          {[0, 1, 2, 3].map((i) => (
            <mesh key={`blade-${i}`} rotation={[0, (i * Math.PI) / 2, 0.2]}>
              <boxGeometry args={[2.2, 0.05, 0.3]} />
              {getMaterial('COOL-TWR-01', '#0f172a', 0.3, 0.7)}
            </mesh>
          ))}
        </group>

        {/* Volumetric Steam Plume System */}
        <SteamParticleSystem
          position={[0, 10.0, 0]}
          count={55}
          color="#f1f5f9"
          opacity={0.4}
          spread={1.8}
          speed={2.2}
          maxHeight={16}
          particleSize={1.4}
        />
      </group>

      {/* ============================================================ */}
      {/* 2. COOL-TWR-02: Mechanical Draft Dual-Cell Tower Beta */}
      {/* ============================================================ */}
      <group
        position={[30, 0, -24]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectAsset('COOL-TWR-02');
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHoverAsset('COOL-TWR-02');
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onHoverAsset(null);
        }}
      >
        {/* Rectangular Tower Enclosure - light concrete */}
        <mesh position={[0, 3.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[7.2, 6.4, 4.4]} />
          {getMaterial('COOL-TWR-02', '#D7DEE3', 0.55, 0.1)}
        </mesh>

        {/* Louver Fin Texture Accents */}
        <mesh position={[0, 1.8, 2.25]}>
          <boxGeometry args={[6.8, 2.8, 0.1]} />
          {getMaterial('COOL-TWR-02', '#B8C1C8', 0.7, 0.2)}
        </mesh>

        {/* Dual Fan Stack Cylinders (Cell 1 & Cell 2) */}
        {[-2.0, 2.0].map((x, idx) => (
          <group key={`fan-stack-${idx}`} position={[x, 6.4, 0]}>
            {/* Fan Shroud Stack - dark steel */}
            <mesh position={[0, 0.6, 0]} castShadow>
              <cylinderGeometry args={[1.5, 1.6, 1.2, 24, 1, true]} />
              {getMaterial('COOL-TWR-02', '#4B5965', 0.3, 0.65)}
            </mesh>
            {/* Top Lip Ring */}
            <mesh position={[0, 1.2, 0]}>
              <torusGeometry args={[1.5, 0.08, 12, 24]} />
              {getMaterial('COOL-TWR-02', '#26343F', 0.2, 0.75)}
            </mesh>
          </group>
        ))}

        {/* Fan 2 (Left Cell) */}
        <group ref={fan2Ref} position={[-2.0, 6.8, 0]}>
          {[0, 1, 2].map((i) => (
            <mesh key={`f2-blade-${i}`} rotation={[0, (i * Math.PI * 2) / 3, 0.2]}>
              <boxGeometry args={[1.3, 0.04, 0.25]} />
              {getMaterial('COOL-TWR-02', '#0f172a', 0.3, 0.7)}
            </mesh>
          ))}
        </group>

        {/* Fan 3 (Right Cell) */}
        <group ref={fan3Ref} position={[2.0, 6.8, 0]}>
          {[0, 1, 2].map((i) => (
            <mesh key={`f3-blade-${i}`} rotation={[0, (i * Math.PI * 2) / 3, -0.2]}>
              <boxGeometry args={[1.3, 0.04, 0.25]} />
              {getMaterial('COOL-TWR-02', '#0f172a', 0.3, 0.7)}
            </mesh>
          ))}
        </group>

        {/* Steam Emissions from Both Cells */}
        <SteamParticleSystem
          position={[-2.0, 7.6, 0]}
          count={35}
          color="#f8fafc"
          opacity={0.35}
          spread={1.2}
          speed={2.0}
          maxHeight={14}
          particleSize={1.1}
        />
        <SteamParticleSystem
          position={[2.0, 7.6, 0]}
          count={35}
          color="#f8fafc"
          opacity={0.35}
          spread={1.2}
          speed={2.0}
          maxHeight={14}
          particleSize={1.1}
        />
      </group>

      {/* ============================================================ */}
      {/* 3. BOILER-STM-01: High-Pressure Steam Boiler House */}
      {/* ============================================================ */}
      <group
        position={[24, 0, -12]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectAsset('BOILER-STM-01');
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHoverAsset('BOILER-STM-01');
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onHoverAsset(null);
        }}
      >
        {/* Boiler Building Enclosure */}
        <mesh position={[0, 3.0, 0]} castShadow receiveShadow>
          <boxGeometry args={[8.4, 6.0, 6.4]} />
          {getMaterial('BOILER-STM-01', '#1e293b', 0.4, 0.6)}
        </mesh>

        {/* Blue Industrial Stripe / Roof Ridge */}
        <mesh position={[0, 6.1, 0]} castShadow>
          <boxGeometry args={[8.6, 0.3, 6.6]} />
          {getMaterial('BOILER-STM-01', '#0284c7', 0.3, 0.8)}
        </mesh>

        {/* Main Steam Header Drum on Roof */}
        <mesh position={[0, 6.8, 1.2]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.6, 0.6, 6.0, 20]} />
          {getMaterial('BOILER-STM-01', '#ea580c', 0.3, 0.7)}
        </mesh>

        {/* Dual Tall Boiler Flue Chimneys */}
        {[-2.0, 2.0].map((x, idx) => (
          <group key={`chimney-${idx}`} position={[x, 6.0, -1.8]}>
            {/* Tapered Steel Chimney Stack */}
            <mesh position={[0, 5.5, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.45, 0.65, 11.0, 20]} />
              {getMaterial('BOILER-STM-01', '#64748b', 0.3, 0.8)}
            </mesh>
            {/* Chimney Top Flare Collar */}
            <mesh position={[0, 11.0, 0]}>
              <cylinderGeometry args={[0.55, 0.45, 0.4, 20]} />
              {getMaterial('BOILER-STM-01', '#f97316', 0.3, 0.7)}
            </mesh>
            {/* Steam / Flue Gas Particle Plume */}
            <SteamParticleSystem
              position={[0, 11.2, 0]}
              count={40}
              color="#e2e8f0"
              opacity={0.35}
              spread={0.9}
              speed={2.6}
              maxHeight={15}
              particleSize={0.9}
            />
          </group>
        ))}

        {/* High-Pressure Steam Piping Offtake to Factory Grid */}
        <mesh position={[4.4, 4.5, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 1.8, 16]} />
          {getMaterial('BOILER-STM-01', '#f59e0b', 0.2, 0.8)}
        </mesh>
      </group>
    </group>
  );
}

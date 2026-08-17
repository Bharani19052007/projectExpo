import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import SteamParticleSystem from './SteamParticleSystem';

export default function RefinerySector({
  selectedAsset,
  onSelectAsset,
  hoveredAsset,
  onHoverAsset,
  viewMode = 'CAD',
}) {
  const flameRef = useRef();
  const flameLightRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    // Animated flare stack flame flicker
    if (flameRef.current) {
      const scaleY = 1.0 + Math.sin(time * 18) * 0.25 + Math.cos(time * 31) * 0.15;
      const scaleXZ = 0.9 + Math.cos(time * 22) * 0.2;
      flameRef.current.scale.set(scaleXZ, scaleY, scaleXZ);
    }
    if (flameLightRef.current) {
      flameLightRef.current.intensity = 1.8 + Math.sin(time * 24) * 0.8;
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
      const color =
        assetId === 'FLARE-STACK-01'
          ? '#ef4444'
          : assetId === 'REACT-CAT-01'
          ? '#f97316'
          : assetId === 'DIST-COL-01'
          ? '#f59e0b'
          : '#3b82f6';
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

    // Realistic CAD / Photorealistic mode — NO blue glow on non-selected equipment
    // Selected = cyan DT highlight, Hovered = lighter tint, Default = true material color
    const baseColor = isSelected ? '#00e5ff' : isHovered ? '#b0cfe8' : defaultColor;
    const emissive = isSelected ? '#00e5ff' : isHovered ? '#4fc3f7' : '#000000';
    const emissiveIntensity = isSelected ? 0.75 : isHovered ? 0.25 : 0.0;

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
      {/* 1. REACT-CAT-01: Hydrocracking Catalytic Reactor Vessel */}
      {/* ============================================================ */}
      <group
        position={[-22, 0, -20]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectAsset('REACT-CAT-01');
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHoverAsset('REACT-CAT-01');
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onHoverAsset(null);
        }}
      >
        {/* Foundation Plinth - light concrete */}
        <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[2.8, 3.2, 0.8, 32]} />
          {getMaterial('REACT-CAT-01', '#B8C1C8', 0.7, 0.15)}
        </mesh>

        {/* Reactor Support Skirt - metallic steel */}
        <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[2.2, 2.4, 2.0, 32, 1, true]} />
          {getMaterial('REACT-CAT-01', '#7B8A96', 0.35, 0.72)}
        </mesh>

        {/* Reactor Lower Hemispherical Head */}
        <mesh position={[0, 2.8, 0]} castShadow receiveShadow>
          <sphereGeometry args={[2.2, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
          {getMaterial('REACT-CAT-01', '#8897A4', 0.25, 0.78)}
        </mesh>

        {/* Main Cylindrical Pressure Shell (Heavy Wall) */}
        <mesh position={[0, 5.2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[2.2, 2.2, 4.8, 32]} />
          {getMaterial('REACT-CAT-01', '#8897A4', 0.22, 0.8)}
        </mesh>

        {/* Reactor Upper Hemispherical Head */}
        <mesh position={[0, 7.6, 0]} castShadow receiveShadow>
          <sphereGeometry args={[2.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          {getMaterial('REACT-CAT-01', '#8897A4', 0.25, 0.78)}
        </mesh>

        {/* Top Nozzle & Pressure Relief Valve */}
        <mesh position={[0, 9.2, 0]} castShadow>
          <cylinderGeometry args={[0.4, 0.5, 1.2, 16]} />
          {getMaterial('REACT-CAT-01', '#f59e0b', 0.3, 0.7)}
        </mesh>

        {/* Circular Catwalk Platforms (Tier 1 & Tier 2) */}
        {[4.2, 7.0].map((y, idx) => (
          <group key={`catwalk-${idx}`} position={[0, y, 0]}>
            {/* Grating Platform Ring */}
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[3.2, 3.2, 0.12, 32, 1, true]} />
              {getMaterial('REACT-CAT-01', '#64748b', 0.4, 0.8)}
            </mesh>
            {/* Safety Handrail Ring */}
            <mesh position={[0, 0.6, 0]}>
              <torusGeometry args={[3.2, 0.04, 8, 32]} />
              {getMaterial('REACT-CAT-01', '#e2e8f0', 0.2, 0.9)}
            </mesh>
          </group>
        ))}

        {/* Vertical Access Ladder with Safety Cage */}
        <mesh position={[2.5, 4.5, 0]} castShadow>
          <boxGeometry args={[0.2, 7.0, 0.4]} />
          {getMaterial('REACT-CAT-01', '#94a3b8', 0.3, 0.9)}
        </mesh>
      </group>

      {/* ============================================================ */}
      {/* 2. DIST-COL-01: Main Atmospheric Distillation Column (Tall) */}
      {/* ============================================================ */}
      <group
        position={[-16, 0, -24]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectAsset('DIST-COL-01');
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHoverAsset('DIST-COL-01');
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onHoverAsset(null);
        }}
      >
        {/* Concrete Foundation - light concrete */}
        <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.2, 0.8, 4.2]} />
          {getMaterial('DIST-COL-01', '#B8C1C8', 0.65, 0.12)}
        </mesh>

        {/* Tower Column Body - metallic steel silver */}
        <mesh position={[0, 8.0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.6, 1.8, 14.4, 32]} />
          {getMaterial('DIST-COL-01', '#94A3B8', 0.28, 0.75)}
        </mesh>

        {/* Dome Cap */}
        <mesh position={[0, 15.2, 0]} castShadow>
          <sphereGeometry args={[1.6, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          {getMaterial('DIST-COL-01', '#334155', 0.3, 0.75)}
        </mesh>

        {/* 4x Spiral Catwalk Platforms */}
        {[3.5, 7.0, 10.5, 13.8].map((y, idx) => (
          <group key={`dist-plat-${idx}`} position={[0, y, 0]}>
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[2.5, 2.5, 0.1, 28, 1, true]} />
              {getMaterial('DIST-COL-01', '#64748b', 0.4, 0.8)}
            </mesh>
            <mesh position={[0, 0.5, 0]}>
              <torusGeometry args={[2.5, 0.035, 8, 28]} />
              {getMaterial('DIST-COL-01', '#cbd5e1', 0.2, 0.9)}
            </mesh>
          </group>
        ))}

        {/* Overhead Vapor Draw Pipe */}
        <mesh position={[0, 15.6, 0.8]} rotation={[Math.PI / 4, 0, 0]} castShadow>
          <cylinderGeometry args={[0.35, 0.35, 2.2, 16]} />
          {getMaterial('DIST-COL-01', '#0ea5e9', 0.2, 0.8)}
        </mesh>

        {/* Reboiler Bottom Circulation Pipe Loop */}
        <mesh position={[1.4, 2.2, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 1.8, 16]} />
          {getMaterial('DIST-COL-01', '#0284c7', 0.2, 0.8)}
        </mesh>
      </group>

      {/* ============================================================ */}
      {/* 3. DIST-COL-02: Vacuum Distillation Column */}
      {/* ============================================================ */}
      <group
        position={[-10, 0, -22]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectAsset('DIST-COL-02');
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHoverAsset('DIST-COL-02');
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onHoverAsset(null);
        }}
      >
        {/* Concrete Foundation */}
        <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[2.6, 2.8, 0.7, 32]} />
          {getMaterial('DIST-COL-02', '#334155', 0.6, 0.3)}
        </mesh>

        {/* Stepped Vacuum Column (Wider upper section for low density vapor) */}
        <mesh position={[0, 4.0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.4, 1.6, 6.5, 32]} />
          {getMaterial('DIST-COL-02', '#64748b', 0.3, 0.7)}
        </mesh>
        <mesh position={[0, 8.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.8, 1.4, 3.5, 32]} />
          {getMaterial('DIST-COL-02', '#475569', 0.3, 0.7)}
        </mesh>
        <mesh position={[0, 11.2, 0]} castShadow>
          <sphereGeometry args={[1.8, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          {getMaterial('DIST-COL-02', '#334155', 0.3, 0.7)}
        </mesh>

        {/* Platforms */}
        {[5.0, 9.5].map((y, idx) => (
          <mesh key={`vac-plat-${idx}`} position={[0, y, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[2.5, 2.5, 0.1, 24, 1, true]} />
            {getMaterial('DIST-COL-02', '#94a3b8', 0.4, 0.8)}
          </mesh>
        ))}
      </group>

      {/* ============================================================ */}
      {/* 4. HEAT-EXCH-01: Shell & Tube Heat Exchanger Bank */}
      {/* ============================================================ */}
      <group
        position={[-26, 0, -14]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectAsset('HEAT-EXCH-01');
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHoverAsset('HEAT-EXCH-01');
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onHoverAsset(null);
        }}
      >
        {/* Concrete Saddle Supports */}
        {[-1.8, 1.8].map((x, idx) => (
          <mesh key={`hx-saddle-${idx}`} position={[x, 0.6, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.8, 1.2, 2.2]} />
            {getMaterial('HEAT-EXCH-01', '#334155', 0.6, 0.3)}
          </mesh>
        ))}

        {/* Horizontal Heat Exchanger Shell 1 (Lower) */}
        <mesh position={[0, 1.5, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
          <cylinderGeometry args={[0.9, 0.9, 5.2, 24]} />
          {getMaterial('HEAT-EXCH-01', '#0284c7', 0.3, 0.7)}
        </mesh>
        {/* Tube Channel Heads */}
        {[-2.6, 2.6].map((x, idx) => (
          <mesh key={`hx-head-${idx}`} position={[x, 1.5, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <sphereGeometry args={[0.9, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            {getMaterial('HEAT-EXCH-01', '#0369a1', 0.3, 0.8)}
          </mesh>
        ))}

        {/* Horizontal Heat Exchanger Shell 2 (Upper) */}
        <mesh position={[0, 3.2, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
          <cylinderGeometry args={[0.8, 0.8, 4.8, 24]} />
          {getMaterial('HEAT-EXCH-01', '#0ea5e9', 0.3, 0.7)}
        </mesh>

        {/* Interconnecting U-Bend Pipes */}
        <mesh position={[2.2, 2.35, 0]} rotation={[0, 0, 0]} castShadow>
          <torusGeometry args={[0.85, 0.18, 12, 24, Math.PI]} />
          {getMaterial('HEAT-EXCH-01', '#38bdf8', 0.2, 0.9)}
        </mesh>
      </group>

      {/* ============================================================ */}
      {/* 5. FLARE-STACK-01: Industrial Safety Flare Stack with Flame */}
      {/* ============================================================ */}
      <group
        position={[-32, 0, -28]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectAsset('FLARE-STACK-01');
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHoverAsset('FLARE-STACK-01');
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onHoverAsset(null);
        }}
      >
        {/* Massive Concrete Foundation */}
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[3.2, 3.8, 1.0, 32]} />
          {getMaterial('FLARE-STACK-01', '#1e293b', 0.7, 0.2)}
        </mesh>

        {/* Flare Riser Mast (20m high) */}
        <mesh position={[0, 10.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.6, 0.9, 19.0, 24]} />
          {getMaterial('FLARE-STACK-01', '#475569', 0.3, 0.8)}
        </mesh>

        {/* Flare Tip Burner Assembly */}
        <mesh position={[0, 20.2, 0]} castShadow>
          <cylinderGeometry args={[0.9, 0.6, 1.8, 24]} />
          {getMaterial('FLARE-STACK-01', '#ea580c', 0.4, 0.6)}
        </mesh>

        {/* Steam Injection Ring */}
        <mesh position={[0, 19.8, 0]}>
          <torusGeometry args={[1.2, 0.08, 12, 24]} />
          {getMaterial('FLARE-STACK-01', '#e2e8f0', 0.2, 0.9)}
        </mesh>

        {/* Animated Flare Flame Cone & Point Light */}
        <group position={[0, 21.2, 0]}>
          <mesh ref={flameRef} position={[0, 1.2, 0]}>
            <coneGeometry args={[0.7, 2.8, 16]} />
            <meshStandardMaterial
              color="#ffedd5"
              emissive="#f97316"
              emissiveIntensity={3.5}
              transparent
              opacity={0.92}
            />
          </mesh>
          <pointLight
            ref={flameLightRef}
            color="#f97316"
            intensity={2.2}
            distance={25}
            decay={2}
          />
          {/* Subtle rising heat/smoke particle system */}
          <SteamParticleSystem
            position={[0, 2.5, 0]}
            count={25}
            color="#78716c"
            opacity={0.25}
            spread={0.8}
            speed={2.8}
            maxHeight={10}
            particleSize={0.8}
          />
        </group>
      </group>
    </group>
  );
}

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function PipelineNetwork({
  selectedAsset,
  onSelectAsset,
  hoveredAsset,
  onHoverAsset,
  viewMode = 'CAD',
}) {
  const pumpShaftRef = useRef();
  const compVibeRef = useRef();
  const steamFlowRef = useRef();
  const coolantFlowRef = useRef();
  const airFlowRef = useRef();

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    if (pumpShaftRef.current) {
      pumpShaftRef.current.rotation.x += delta * 15;
    }
    if (compVibeRef.current) {
      compVibeRef.current.position.y = 0.5 + Math.sin(time * 60) * 0.008;
    }

    if (steamFlowRef.current) {
      steamFlowRef.current.emissiveIntensity = 0.6 + Math.sin(time * 5) * 0.3;
    }
    if (coolantFlowRef.current) {
      coolantFlowRef.current.emissiveIntensity = 0.7 + Math.sin(time * 4 + 1) * 0.3;
    }
    if (airFlowRef.current) {
      airFlowRef.current.emissiveIntensity = 0.5 + Math.sin(time * 6 + 2) * 0.25;
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
          color={assetId === 'COMP-SCREW-01' ? '#ef4444' : '#0ea5e9'}
          emissive={assetId === 'COMP-SCREW-01' ? '#ef4444' : '#0ea5e9'}
          emissiveIntensity={isSelected ? 0.6 : 0.2}
          roughness={0.4}
        />
      );
    }

    const baseColor = isSelected ? '#38bdf8' : isHovered ? '#7dd3fc' : defaultColor;
    const emissive = isSelected ? '#0284c7' : isHovered ? '#0369a1' : '#000000';
    const emissiveIntensity = isSelected ? 0.5 : isHovered ? 0.3 : 0.0;

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
      {/* 1. OVERHEAD MULTI-TIER UTILITY PIPELINE TRESTLE CORRIDORS */}
      {/* ============================================================ */}
      {/* Main East-West Utility Pipe Rack Highway (Z = 0) */}
      <group position={[-20, 0, 0]}>
        {/* Steel Portal Bents */}
        {[-12, -6, 0, 6, 12].map((x, idx) => (
          <group key={`bent-${idx}`} position={[x, 0, 0]}>
            <mesh position={[0, 2.2, -1.8]} castShadow>
              <boxGeometry args={[0.25, 4.4, 0.25]} />
              <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
            </mesh>
            <mesh position={[0, 2.2, 1.8]} castShadow>
              <boxGeometry args={[0.25, 4.4, 0.25]} />
              <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
            </mesh>
            {/* Cross Traverses */}
            <mesh position={[0, 2.4, 0]} castShadow>
              <boxGeometry args={[0.3, 0.2, 3.8]} />
              <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
            </mesh>
            <mesh position={[0, 4.0, 0]} castShadow>
              <boxGeometry args={[0.3, 0.2, 3.8]} />
              <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
            </mesh>
          </group>
        ))}

        {/* Tier 1 Pipelines */}
        {/* A. High-Pressure Steam (Industrial Orange/Red) */}
        <group position={[0, 2.65, -1.0]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.22, 0.22, 28, 20]} />
            <meshStandardMaterial
              ref={steamFlowRef}
              color="#ea580c"
              emissive="#c2410c"
              emissiveIntensity={0.6}
              roughness={0.3}
              metalness={0.7}
            />
          </mesh>
          {/* Flanged Joint Rings */}
          {[-10, -4, 2, 8].map((fx, i) => (
            <mesh key={`flange-s-${i}`} position={[fx, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.32, 0.32, 0.12, 16]} />
              <meshStandardMaterial color="#64748b" metalness={0.8} />
            </mesh>
          ))}
        </group>

        {/* B. Cooling Feedwater (Royal Blue) */}
        <group position={[0, 2.65, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.24, 0.24, 28, 20]} />
            <meshStandardMaterial
              ref={coolantFlowRef}
              color="#0284c7"
              emissive="#0369a1"
              emissiveIntensity={0.7}
              roughness={0.2}
              metalness={0.8}
            />
          </mesh>
          {[-8, -2, 4, 10].map((fx, i) => (
            <mesh key={`flange-c-${i}`} position={[fx, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.34, 0.34, 0.12, 16]} />
              <meshStandardMaterial color="#64748b" metalness={0.8} />
            </mesh>
          ))}
        </group>

        {/* C. High-Volume Compressed Air (Sky Blue) */}
        <group position={[0, 2.65, 1.0]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.18, 0.18, 28, 20]} />
            <meshStandardMaterial
              ref={airFlowRef}
              color="#38bdf8"
              emissive="#0284c7"
              emissiveIntensity={0.5}
              roughness={0.3}
              metalness={0.7}
            />
          </mesh>
        </group>

        {/* Tier 2 Cable Trays (Galvanized Steel Tray with Power Cables) */}
        <group position={[0, 4.25, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <boxGeometry args={[0.15, 28, 0.8]} />
            <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Black Power Cables inside Tray */}
          {[-0.2, 0, 0.2].map((z, i) => (
            <mesh key={`cable-${i}`} position={[0, 0.08, z]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.05, 0.05, 28, 12]} />
              <meshStandardMaterial color="#0f172a" roughness={0.8} />
            </mesh>
          ))}
        </group>
      </group>

      {/* ============================================================ */}
      {/* 2. PUMP-BOOST-01: Multi-Stage Centrifugal Feed Pump Skid */}
      {/* ============================================================ */}
      <group
        position={[-12, 0, 6]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectAsset('PUMP-BOOST-01');
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHoverAsset('PUMP-BOOST-01');
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onHoverAsset(null);
        }}
      >
        <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.2, 0.5, 1.8]} />
          {getMaterial('PUMP-BOOST-01', '#1e293b', 0.8, 0.2)}
        </mesh>
        <mesh position={[-0.8, 0.8, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.5, 0.5, 1.2, 20]} />
          {getMaterial('PUMP-BOOST-01', '#0284c7', 0.3, 0.7)}
        </mesh>
        <group ref={pumpShaftRef} position={[-0.1, 0.8, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.2, 0.2, 0.4, 16]} />
            {getMaterial('PUMP-BOOST-01', '#f59e0b', 0.2, 0.9)}
          </mesh>
        </group>
        <mesh position={[0.7, 0.8, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.6, 0.6, 0.9, 20]} />
          {getMaterial('PUMP-BOOST-01', '#0369a1', 0.3, 0.7)}
        </mesh>
        <mesh position={[0.7, 1.6, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 0.8, 16]} />
          {getMaterial('PUMP-BOOST-01', '#38bdf8', 0.2, 0.8)}
        </mesh>
      </group>

      {/* ============================================================ */}
      {/* 3. COMP-SCREW-01: Rotary Twin-Screw Gas Compressor Skid */}
      {/* ============================================================ */}
      <group
        ref={compVibeRef}
        position={[-6, 0, -10]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectAsset('COMP-SCREW-01');
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHoverAsset('COMP-SCREW-01');
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onHoverAsset(null);
        }}
      >
        <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.2, 0.6, 2.4]} />
          {getMaterial('COMP-SCREW-01', '#1e293b', 0.6, 0.4)}
        </mesh>
        <mesh position={[-0.4, 1.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.4, 1.6, 1.8]} />
          {getMaterial('COMP-SCREW-01', '#ea580c', 0.3, 0.7)}
        </mesh>
        <mesh position={[1.2, 1.4, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.65, 0.65, 1.4, 20]} />
          {getMaterial('COMP-SCREW-01', '#334155', 0.3, 0.8)}
        </mesh>
        <mesh position={[-1.2, 2.4, 0.6]} castShadow>
          <cylinderGeometry args={[0.35, 0.35, 1.4, 16]} />
          {getMaterial('COMP-SCREW-01', '#64748b', 0.3, 0.7)}
        </mesh>
      </group>

      {/* ============================================================ */}
      {/* 4. VALVE-ESDV-01: Emergency Shutdown Gate Valve */}
      {/* ============================================================ */}
      <group
        position={[-18, 2.65, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectAsset('VALVE-ESDV-01');
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHoverAsset('VALVE-ESDV-01');
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onHoverAsset(null);
        }}
      >
        <mesh castShadow>
          <cylinderGeometry args={[0.38, 0.38, 0.7, 16]} />
          {getMaterial('VALVE-ESDV-01', '#ef4444', 0.3, 0.7)}
        </mesh>
        <mesh position={[0, 0.8, 0]} castShadow>
          <cylinderGeometry args={[0.25, 0.25, 0.9, 16]} />
          {getMaterial('VALVE-ESDV-01', '#b91c1c', 0.25, 0.75)}
        </mesh>
        {/* Manual Red Isolation Handwheel */}
        <mesh position={[0, 1.4, 0.25]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.22, 0.04, 8, 16]} />
          {getMaterial('VALVE-ESDV-01', '#dc2626', 0.3, 0.7)}
        </mesh>
      </group>
    </group>
  );
}

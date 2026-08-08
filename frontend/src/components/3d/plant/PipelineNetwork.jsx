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
  const flowMaterial1Ref = useRef();
  const flowMaterial2Ref = useRef();
  const flowMaterial3Ref = useRef();

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // 1. Pump drive shaft rotation
    if (pumpShaftRef.current) {
      pumpShaftRef.current.rotation.x += delta * 15;
    }

    // 2. Compressor subtle micro-vibration
    if (compVibeRef.current) {
      compVibeRef.current.position.y = 0.5 + Math.sin(time * 60) * 0.008;
    }

    // 3. Fluid line pulsing emissive animations
    if (flowMaterial1Ref.current) {
      flowMaterial1Ref.current.emissiveIntensity = 0.6 + Math.sin(time * 4) * 0.3;
    }
    if (flowMaterial2Ref.current) {
      flowMaterial2Ref.current.emissiveIntensity = 0.7 + Math.sin(time * 5 + 1) * 0.35;
    }
    if (flowMaterial3Ref.current) {
      flowMaterial3Ref.current.emissiveIntensity = 0.5 + Math.sin(time * 3 + 2) * 0.25;
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
        assetId === 'COMP-SCREW-01'
          ? '#ef4444'
          : assetId === 'PUMP-BOOST-01'
          ? '#f97316'
          : '#0ea5e9';
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
      const color =
        assetId === 'COMP-SCREW-01'
          ? '#ef4444'
          : assetId === 'PUMP-BOOST-01'
          ? '#f59e0b'
          : '#10b981';
      return (
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isSelected ? 0.8 : 0.3}
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
      {/* 1. Multi-Tier Pipe Racks Crossing the Plant */}
      {/* ============================================================ */}
      {/* Rack 1: Transverse Corridor from Storage to Refinery (X: -36 to -10, Z: 0) */}
      <group position={[-24, 0, 0]}>
        {/* Steel Support Bents / Portals */}
        {[-10, -5, 0, 5, 10].map((x, idx) => (
          <group key={`rack-bent-${idx}`} position={[x, 0, 0]}>
            {/* 2 Vertical I-beam Columns */}
            <mesh position={[0, 2.0, -1.5]} castShadow>
              <boxGeometry args={[0.2, 4.0, 0.2]} />
              <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.6} />
            </mesh>
            <mesh position={[0, 2.0, 1.5]} castShadow>
              <boxGeometry args={[0.2, 4.0, 0.2]} />
              <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.6} />
            </mesh>
            {/* Cross Beams (Tier 1 & Tier 2) */}
            <mesh position={[0, 2.2, 0]} castShadow>
              <boxGeometry args={[0.25, 0.2, 3.2]} />
              <meshStandardMaterial color="#475569" roughness={0.5} metalness={0.6} />
            </mesh>
            <mesh position={[0, 3.8, 0]} castShadow>
              <boxGeometry args={[0.25, 0.2, 3.2]} />
              <meshStandardMaterial color="#475569" roughness={0.5} metalness={0.6} />
            </mesh>
          </group>
        ))}

        {/* Tier 1 Pipelines (Animated Flowing Blue Energy) */}
        {/* Main Process Energy Line (Electric Cyan Glowing Energy) */}
        <mesh position={[0, 2.45, -0.8]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.24, 0.24, 24, 24]} />
          <meshStandardMaterial
            ref={flowMaterial1Ref}
            color="#00e5ff"
            emissive="#00e5ff"
            emissiveIntensity={0.8}
            roughness={0.2}
            metalness={0.8}
            transparent
            opacity={0.92}
          />
        </mesh>

        {/* Secondary High-Pressure Fluid Line (Neon Blue) */}
        <mesh position={[0, 2.45, 0.8]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 24, 24]} />
          <meshStandardMaterial
            ref={flowMaterial2Ref}
            color="#4fc3f7"
            emissive="#0284c7"
            emissiveIntensity={0.85}
            roughness={0.2}
            metalness={0.8}
            transparent
            opacity={0.92}
          />
        </mesh>

        {/* Tier 2 Pipelines (Chilled Coolant & Digital Twin Energy Spine) */}
        <mesh position={[0, 4.05, -0.6]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 24, 24]} />
          <meshStandardMaterial
            ref={flowMaterial3Ref}
            color="#00e5ff"
            emissive="#00e5ff"
            emissiveIntensity={0.7}
            roughness={0.2}
            metalness={0.8}
            transparent
            opacity={0.88}
          />
        </mesh>

        {/* Inerting Line with Neon Cyan Accent */}
        <mesh position={[0, 4.05, 0.6]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.15, 0.15, 24, 24]} />
          <meshStandardMaterial
            color="#67e8f9"
            emissive="#0891b2"
            emissiveIntensity={0.5}
            roughness={0.3}
            metalness={0.8}
          />
        </mesh>
      </group>

      {/* ============================================================ */}
      {/* 2. PUMP-BOOST-01: Multi-Stage Centrifugal Crude Feed Pump */}
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
        {/* Concrete Inertia Base */}
        <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.2, 0.5, 1.8]} />
          {getMaterial('PUMP-BOOST-01', '#1e293b', 0.8, 0.2)}
        </mesh>

        {/* Electric Motor Housing */}
        <mesh position={[-0.8, 0.8, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.5, 0.5, 1.2, 20]} />
          {getMaterial('PUMP-BOOST-01', '#0284c7', 0.3, 0.7)}
        </mesh>
        {/* Motor Cooling Fan Shroud */}
        <mesh position={[-1.45, 0.8, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.48, 0.48, 0.3, 16]} />
          {getMaterial('PUMP-BOOST-01', '#0f172a', 0.5, 0.5)}
        </mesh>

        {/* Pump Shaft Coupling Guard */}
        <group ref={pumpShaftRef} position={[-0.1, 0.8, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.2, 0.2, 0.4, 16]} />
            {getMaterial('PUMP-BOOST-01', '#f59e0b', 0.2, 0.9)}
          </mesh>
        </group>

        {/* Centrifugal Pump Volute Casing */}
        <mesh position={[0.7, 0.8, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.6, 0.6, 0.9, 20]} />
          {getMaterial('PUMP-BOOST-01', '#0369a1', 0.3, 0.7)}
        </mesh>

        {/* Vertical Discharge Spool */}
        <mesh position={[0.7, 1.6, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 0.8, 16]} />
          {getMaterial('PUMP-BOOST-01', '#38bdf8', 0.2, 0.8)}
        </mesh>
      </group>

      {/* ============================================================ */}
      {/* 3. COMP-SCREW-01: Rotary Twin-Screw Gas Compressor */}
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
        {/* Structural Skid Frame */}
        <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.2, 0.6, 2.4]} />
          {getMaterial('COMP-SCREW-01', '#1e293b', 0.6, 0.4)}
        </mesh>

        {/* Acoustic Enclosure / Heavy Cast Compressor Body */}
        <mesh position={[-0.4, 1.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.4, 1.6, 1.8]} />
          {getMaterial('COMP-SCREW-01', '#ea580c', 0.3, 0.7)}
        </mesh>

        {/* High-Voltage Motor End */}
        <mesh position={[1.2, 1.4, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.65, 0.65, 1.4, 20]} />
          {getMaterial('COMP-SCREW-01', '#334155', 0.3, 0.8)}
        </mesh>

        {/* Oil Separator Vessel on Skid */}
        <mesh position={[-1.2, 2.4, 0.6]} castShadow>
          <cylinderGeometry args={[0.35, 0.35, 1.4, 16]} />
          {getMaterial('COMP-SCREW-01', '#64748b', 0.3, 0.7)}
        </mesh>
      </group>

      {/* ============================================================ */}
      {/* 4. VALVE-ESDV-01: Emergency Shutdown Automated Gate Valve */}
      {/* ============================================================ */}
      <group
        position={[-18, 2.45, 0]}
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
        {/* Flanged Valve Body */}
        <mesh castShadow>
          <cylinderGeometry args={[0.38, 0.38, 0.7, 16]} />
          {getMaterial('VALVE-ESDV-01', '#ef4444', 0.3, 0.7)}
        </mesh>

        {/* Pneumatic Cylinder Actuator (Red/Silver) */}
        <mesh position={[0, 0.8, 0]} castShadow>
          <cylinderGeometry args={[0.25, 0.25, 0.9, 16]} />
          {getMaterial('VALVE-ESDV-01', '#b91c1c', 0.25, 0.75)}
        </mesh>
        {/* Solenoid Position Indicator */}
        <mesh position={[0, 1.35, 0]} castShadow>
          <sphereGeometry args={[0.12, 12, 12]} />
          {getMaterial('VALVE-ESDV-01', '#22c55e', 0.2, 0.8)}
        </mesh>
      </group>
    </group>
  );
}

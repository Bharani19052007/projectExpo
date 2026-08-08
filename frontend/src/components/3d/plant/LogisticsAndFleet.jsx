import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function LogisticsAndFleet({
  selectedAsset,
  onSelectAsset,
  hoveredAsset,
  onHoverAsset,
  viewMode = 'CAD',
}) {
  const agv1Ref = useRef();
  const agv2Ref = useRef();
  const agvLidarRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // 1. AGV-LIFT-01 Path Motion (Looping between X: 10..30, Z: 20..28)
    if (agv1Ref.current) {
      const t = (time * 0.4) % (Math.PI * 2);
      const x = 20 + Math.sin(t) * 9;
      const z = 24 + Math.sin(t * 2) * 3;
      agv1Ref.current.position.set(x, 0, z);
      // Orient facing forward
      const dx = Math.cos(t) * 9;
      const dz = Math.cos(t * 2) * 6;
      agv1Ref.current.rotation.y = Math.atan2(dx, dz);
    }

    // 2. AGV-TUG-01 Path Motion (Looping on roadway)
    if (agv2Ref.current) {
      const t = (time * 0.35 + 2.0) % (Math.PI * 2);
      const x = 22 + Math.cos(t) * 8;
      const z = 12 + Math.sin(t) * 8;
      agv2Ref.current.position.set(x, 0, z);
      agv2Ref.current.rotation.y = -t + Math.PI / 2;
    }

    // 3. Rotating Lidar Laser Beacon
    if (agvLidarRef.current) {
      agvLidarRef.current.rotation.y = time * 12;
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
      const color = assetId === 'TRUCK-TANK-01' ? '#f59e0b' : '#3b82f6';
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
      {/* ============================================================ */}
      {/* 1. GANTRY-LOAD-01: Multi-Bay Tanker Loading Rack Canopy */}
      {/* ============================================================ */}
      <group
        position={[6, 0, 26]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectAsset('GANTRY-LOAD-01');
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHoverAsset('GANTRY-LOAD-01');
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onHoverAsset(null);
        }}
      >
        {/* Loading Bay Concrete Slab */}
        <mesh position={[0, 0.2, 0]} receiveShadow>
          <boxGeometry args={[14, 0.4, 10]} />
          {getMaterial('GANTRY-LOAD-01', '#1e293b', 0.8, 0.2)}
        </mesh>

        {/* 4 Canopy Support Columns */}
        {[-5.5, 5.5].map((x, i) =>
          [-4, 4].map((z, j) => (
            <mesh key={`gantry-col-${i}-${j}`} position={[x, 3.0, z]} castShadow>
              <boxGeometry args={[0.3, 5.6, 0.3]} />
              {getMaterial('GANTRY-LOAD-01', '#334155', 0.4, 0.7)}
            </mesh>
          ))
        )}

        {/* Canopy Overhead Roof Deck */}
        <mesh position={[0, 6.0, 0]} castShadow>
          <boxGeometry args={[15, 0.5, 11]} />
          {getMaterial('GANTRY-LOAD-01', '#0284c7', 0.3, 0.7)}
        </mesh>

        {/* Articulated Top Loading Arm 1 */}
        <group position={[-2, 4.8, 0]}>
          <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 2.2, 12]} />
            {getMaterial('GANTRY-LOAD-01', '#f59e0b', 0.2, 0.9)}
          </mesh>
          <mesh position={[0.8, -1.2, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.07, 1.6, 12]} />
            {getMaterial('GANTRY-LOAD-01', '#e2e8f0', 0.2, 0.9)}
          </mesh>
        </group>

        {/* Operator Console on Loading Platform */}
        <mesh position={[0, 2.2, -3.8]} castShadow>
          <boxGeometry args={[1.2, 1.4, 0.8]} />
          {getMaterial('GANTRY-LOAD-01', '#0ea5e9', 0.3, 0.8)}
        </mesh>
      </group>

      {/* ============================================================ */}
      {/* 2. TRUCK-TANK-01: Heavy Tanker Road Vehicle */}
      {/* ============================================================ */}
      <group
        position={[6, 0, 26]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectAsset('TRUCK-TANK-01');
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHoverAsset('TRUCK-TANK-01');
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onHoverAsset(null);
        }}
      >
        {/* Cab / Tractor Unit */}
        <mesh position={[3.5, 1.2, 0]} castShadow>
          <boxGeometry args={[2.0, 1.8, 1.8]} />
          {getMaterial('TRUCK-TANK-01', '#0284c7', 0.3, 0.7)}
        </mesh>
        {/* Cab Windshield */}
        <mesh position={[4.1, 1.6, 0]} castShadow>
          <boxGeometry args={[0.6, 0.8, 1.6]} />
          {getMaterial('TRUCK-TANK-01', '#0f172a', 0.1, 0.9)}
        </mesh>

        {/* Tanker Cylindrical Semi-Trailer (Polished Aluminum) */}
        <mesh position={[-1.2, 1.8, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[1.0, 1.0, 6.5, 24]} />
          {getMaterial('TRUCK-TANK-01', '#f8fafc', 0.15, 0.9)}
        </mesh>

        {/* Wheels (10 heavy duty wheels) */}
        {[-3.5, -2.2, -1.0, 2.8, 4.0].map((x, idx) => (
          <group key={`wheel-pair-${idx}`} position={[x, 0.45, 0]}>
            <mesh position={[0, 0, -1.0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.45, 0.45, 0.3, 16]} />
              {getMaterial('TRUCK-TANK-01', '#0f172a', 0.9, 0.1)}
            </mesh>
            <mesh position={[0, 0, 1.0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.45, 0.45, 0.3, 16]} />
              {getMaterial('TRUCK-TANK-01', '#0f172a', 0.9, 0.1)}
            </mesh>
          </group>
        ))}
      </group>

      {/* ============================================================ */}
      {/* 3. AGV-LIFT-01: Autonomous Guided Transport Forklift */}
      {/* ============================================================ */}
      <group
        ref={agv1Ref}
        position={[20, 0, 24]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectAsset('AGV-LIFT-01');
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHoverAsset('AGV-LIFT-01');
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onHoverAsset(null);
        }}
      >
        {/* Chassis Body */}
        <mesh position={[0, 0.4, 0]} castShadow>
          <boxGeometry args={[1.8, 0.6, 1.2]} />
          {getMaterial('AGV-LIFT-01', '#eab308', 0.3, 0.7)}
        </mesh>

        {/* Vertical Fork Mast */}
        <mesh position={[0.8, 1.2, 0]} castShadow>
          <boxGeometry args={[0.15, 1.8, 0.9]} />
          {getMaterial('AGV-LIFT-01', '#1e293b', 0.4, 0.7)}
        </mesh>

        {/* Forks & Payload Crate */}
        <mesh position={[1.4, 0.6, 0]} castShadow>
          <boxGeometry args={[1.0, 0.8, 0.9]} />
          {getMaterial('AGV-LIFT-01', '#0284c7', 0.4, 0.5)}
        </mesh>

        {/* Safety Lidar Rotating Dome & Laser Beacon */}
        <group ref={agvLidarRef} position={[-0.6, 0.85, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.12, 0.12, 0.2, 16]} />
            {getMaterial('AGV-LIFT-01', '#0f172a', 0.2, 0.9)}
          </mesh>
          <pointLight color="#00f0ff" intensity={1.5} distance={3.5} decay={2} />
        </group>
      </group>

      {/* ============================================================ */}
      {/* 4. AGV-TUG-01: Electric Tow Tractor AGV */}
      {/* ============================================================ */}
      <group
        ref={agv2Ref}
        position={[22, 0, 12]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectAsset('AGV-TUG-01');
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHoverAsset('AGV-TUG-01');
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onHoverAsset(null);
        }}
      >
        {/* Tugger Chassis */}
        <mesh position={[0, 0.35, 0]} castShadow>
          <boxGeometry args={[1.4, 0.5, 0.9]} />
          {getMaterial('AGV-TUG-01', '#059669', 0.3, 0.7)}
        </mesh>

        {/* Trailing Material Cart */}
        <mesh position={[-1.8, 0.3, 0]} castShadow>
          <boxGeometry args={[1.6, 0.4, 0.9]} />
          {getMaterial('AGV-TUG-01', '#475569', 0.4, 0.6)}
        </mesh>
      </group>
    </group>
  );
}

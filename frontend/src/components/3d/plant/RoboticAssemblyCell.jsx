import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function RoboticAssemblyCell({
  selectedAsset,
  onSelectAsset,
  hoveredAsset,
  onHoverAsset,
  viewMode = 'CAD',
}) {
  // Conveyor moving items refs
  const tote1Ref = useRef();
  const tote2Ref = useRef();
  const tote3Ref = useRef();
  const tote4Ref = useRef();

  // Robot 1 Articulation refs
  const r1BaseRef = useRef();
  const r1ArmRef = useRef();
  const r1ForearmRef = useRef();
  const r1WristRef = useRef();
  const r1SparkRef = useRef();

  // Robot 2 Articulation refs
  const r2BaseRef = useRef();
  const r2ArmRef = useRef();

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // 1. Conveyor Totes Continuous Motion (Moving along X from -10 to +10)
    const speed = 2.4;
    const totes = [tote1Ref, tote2Ref, tote3Ref, tote4Ref];
    totes.forEach((ref, idx) => {
      if (ref.current) {
        let x = ((time * speed + idx * 5.0) % 20) - 10;
        ref.current.position.x = x;
      }
    });

    // 2. Robot 1: 6-Axis Welding kinematics animation
    if (r1BaseRef.current) {
      r1BaseRef.current.rotation.y = Math.sin(time * 1.5) * 0.6;
    }
    if (r1ArmRef.current) {
      r1ArmRef.current.rotation.z = Math.sin(time * 1.5) * 0.3 - 0.2;
    }
    if (r1ForearmRef.current) {
      r1ForearmRef.current.rotation.z = Math.cos(time * 1.5) * 0.4 + 0.5;
    }
    if (r1WristRef.current) {
      r1WristRef.current.rotation.y = Math.sin(time * 3) * 0.8;
    }
    if (r1SparkRef.current) {
      // Intermittent welding spark flash
      const isWelding = Math.sin(time * 1.5) > 0.1;
      r1SparkRef.current.intensity = isWelding ? (Math.random() > 0.3 ? 3.0 : 0.2) : 0.0;
    }

    // 3. Robot 2: Pick & Place kinematic cycle
    if (r2BaseRef.current) {
      r2BaseRef.current.rotation.y = Math.cos(time * 1.2) * 0.9;
    }
    if (r2ArmRef.current) {
      r2ArmRef.current.rotation.z = Math.sin(time * 2.4) * 0.4 - 0.3;
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
        assetId === 'ROBOT-WELD-01'
          ? '#ef4444'
          : assetId === 'CONV-MAIN-01'
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
    <group position={[0, 0, 8]}>
      {/* ============================================================ */}
      {/* 1. CONV-MAIN-01: Main High-Speed Assembly Conveyor Line */}
      {/* ============================================================ */}
      <group
        position={[0, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectAsset('CONV-MAIN-01');
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHoverAsset('CONV-MAIN-01');
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onHoverAsset(null);
        }}
      >
        {/* Conveyor Bed Extrusion */}
        <mesh position={[0, 1.0, 0]} castShadow receiveShadow>
          <boxGeometry args={[22, 0.3, 1.8]} />
          {getMaterial('CONV-MAIN-01', '#1e293b', 0.5, 0.5)}
        </mesh>

        {/* Rubber Belt Top Surface */}
        <mesh position={[0, 1.18, 0]} receiveShadow>
          <boxGeometry args={[21.8, 0.05, 1.5]} />
          {getMaterial('CONV-MAIN-01', '#0f172a', 0.8, 0.2)}
        </mesh>

        {/* Conveyor Side Guide Rails (Safety Yellow) */}
        {[-0.85, 0.85].map((z, idx) => (
          <mesh key={`rail-${idx}`} position={[0, 1.35, z]} castShadow>
            <boxGeometry args={[22, 0.15, 0.08]} />
            {getMaterial('CONV-MAIN-01', '#eab308', 0.3, 0.6)}
          </mesh>
        ))}

        {/* Structural Leg Stands */}
        {[-9, -5, -1, 3, 7].map((x, idx) => (
          <group key={`leg-${idx}`} position={[x, 0, 0]}>
            <mesh position={[0, 0.5, -0.8]} castShadow>
              <cylinderGeometry args={[0.08, 0.08, 1.0, 12]} />
              {getMaterial('CONV-MAIN-01', '#64748b', 0.4, 0.7)}
            </mesh>
            <mesh position={[0, 0.5, 0.8]} castShadow>
              <cylinderGeometry args={[0.08, 0.08, 1.0, 12]} />
              {getMaterial('CONV-MAIN-01', '#64748b', 0.4, 0.7)}
            </mesh>
          </group>
        ))}

        {/* Drive Motor Gearbox at End */}
        <mesh position={[10.5, 0.9, -1.2]} castShadow>
          <boxGeometry args={[1.2, 0.9, 0.8]} />
          {getMaterial('CONV-MAIN-01', '#0284c7', 0.3, 0.7)}
        </mesh>

        {/* 4 Continuously Moving Industrial Totes / Pallets on Belt */}
        <group ref={tote1Ref} position={[0, 1.45, 0]}>
          <mesh castShadow>
            <boxGeometry args={[1.4, 0.5, 1.1]} />
            {getMaterial('CONV-MAIN-01', '#0284c7', 0.4, 0.4)}
          </mesh>
          {/* Internal Payload Part */}
          <mesh position={[0, 0.3, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 0.4, 16]} />
            {getMaterial('CONV-MAIN-01', '#94a3b8', 0.2, 0.9)}
          </mesh>
        </group>

        <group ref={tote2Ref} position={[0, 1.45, 0]}>
          <mesh castShadow>
            <boxGeometry args={[1.4, 0.5, 1.1]} />
            {getMaterial('CONV-MAIN-01', '#059669', 0.4, 0.4)}
          </mesh>
        </group>

        <group ref={tote3Ref} position={[0, 1.45, 0]}>
          <mesh castShadow>
            <boxGeometry args={[1.4, 0.5, 1.1]} />
            {getMaterial('CONV-MAIN-01', '#d97706', 0.4, 0.4)}
          </mesh>
        </group>

        <group ref={tote4Ref} position={[0, 1.45, 0]}>
          <mesh castShadow>
            <boxGeometry args={[1.4, 0.5, 1.1]} />
            {getMaterial('CONV-MAIN-01', '#0284c7', 0.4, 0.4)}
          </mesh>
        </group>
      </group>

      {/* ============================================================ */}
      {/* 2. ROBOT-WELD-01: 6-Axis Articulated Spot-Welding Robot */}
      {/* ============================================================ */}
      <group
        position={[-3, 0, -2.4]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectAsset('ROBOT-WELD-01');
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHoverAsset('ROBOT-WELD-01');
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onHoverAsset(null);
        }}
      >
        {/* Heavy Cast Iron Base Pedestal */}
        <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.8, 1.0, 0.8, 24]} />
          {getMaterial('ROBOT-WELD-01', '#1e293b', 0.5, 0.5)}
        </mesh>

        {/* Rotating Waist Turntable (J1 Axis) */}
        <group ref={r1BaseRef} position={[0, 0.8, 0]}>
          <mesh position={[0, 0.25, 0]} castShadow>
            <cylinderGeometry args={[0.65, 0.7, 0.5, 24]} />
            {getMaterial('ROBOT-WELD-01', '#ea580c', 0.3, 0.7)}
          </mesh>

          {/* Lower Arm Shoulder Pivot (J2 Axis) */}
          <group ref={r1ArmRef} position={[0, 0.5, 0]}>
            <mesh position={[0, 1.2, 0]} castShadow>
              <boxGeometry args={[0.4, 2.4, 0.5]} />
              {getMaterial('ROBOT-WELD-01', '#ea580c', 0.3, 0.7)}
            </mesh>

            {/* Elbow Joint & Forearm (J3 Axis) */}
            <group ref={r1ForearmRef} position={[0, 2.4, 0]}>
              <mesh position={[0, 0.9, 0]} castShadow>
                <boxGeometry args={[0.32, 1.8, 0.35]} />
                {getMaterial('ROBOT-WELD-01', '#1e293b', 0.3, 0.8)}
              </mesh>

              {/* Articulated Wrist & Welding Torch (J4/J5/J6 Axis) */}
              <group ref={r1WristRef} position={[0, 1.8, 0]}>
                <mesh position={[0, 0.3, 0]} castShadow>
                  <cylinderGeometry args={[0.15, 0.2, 0.6, 16]} />
                  {getMaterial('ROBOT-WELD-01', '#64748b', 0.2, 0.9)}
                </mesh>
                {/* Welding Torch Nozzle */}
                <mesh position={[0, 0.7, 0.2]} rotation={[Math.PI / 4, 0, 0]} castShadow>
                  <coneGeometry args={[0.08, 0.4, 16]} />
                  {getMaterial('ROBOT-WELD-01', '#38bdf8', 0.2, 0.9)}
                </mesh>
                {/* Welding Arc Flash Light */}
                <pointLight
                  ref={r1SparkRef}
                  position={[0, 0.9, 0.4]}
                  color="#38bdf8"
                  intensity={2.5}
                  distance={6}
                  decay={2}
                />
              </group>
            </group>
          </group>
        </group>
      </group>

      {/* ============================================================ */}
      {/* 3. ROBOT-PAL-01: High-Speed Palletizer Robot */}
      {/* ============================================================ */}
      <group
        position={[5, 0, 2.4]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectAsset('ROBOT-PAL-01');
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHoverAsset('ROBOT-PAL-01');
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onHoverAsset(null);
        }}
      >
        {/* Base Pedestal */}
        <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.8, 1.0, 0.8, 24]} />
          {getMaterial('ROBOT-PAL-01', '#1e293b', 0.5, 0.5)}
        </mesh>

        {/* Rotating Waist */}
        <group ref={r2BaseRef} position={[0, 0.8, 0]}>
          <mesh position={[0, 0.25, 0]} castShadow>
            <cylinderGeometry args={[0.65, 0.7, 0.5, 24]} />
            {getMaterial('ROBOT-PAL-01', '#0284c7', 0.3, 0.7)}
          </mesh>

          {/* Articulated Boom Arm */}
          <group ref={r2ArmRef} position={[0, 0.5, 0]}>
            <mesh position={[0, 1.4, 0]} castShadow>
              <boxGeometry args={[0.45, 2.8, 0.45]} />
              {getMaterial('ROBOT-PAL-01', '#0284c7', 0.3, 0.7)}
            </mesh>
            {/* Suction Gripper Head */}
            <mesh position={[0, 2.8, 0.5]} castShadow>
              <boxGeometry args={[0.8, 0.15, 0.8]} />
              {getMaterial('ROBOT-PAL-01', '#334155', 0.3, 0.8)}
            </mesh>
          </group>
        </group>
      </group>

      {/* Safety Laser Enclosure Boundary Fences */}
      <mesh position={[0, 1.1, -3.8]} castShadow>
        <boxGeometry args={[20, 2.2, 0.05]} />
        <meshStandardMaterial color="#0284c7" wireframe transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

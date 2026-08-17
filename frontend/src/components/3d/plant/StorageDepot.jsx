import React from 'react';
import * as THREE from 'three';

export default function StorageDepot({
  selectedAsset,
  onSelectAsset,
  hoveredAsset,
  onHoverAsset,
  viewMode = 'CAD',
}) {
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
      const color = assetId === 'TANK-CYL-01' ? '#f59e0b' : '#3b82f6';
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

    // Realistic CAD mode — metallic storage equipment colors, no idle blue glow
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

  // Helper for Horton Sphere creation
  const renderHortonSphere = (id, position) => {
    const legCount = 8;
    const sphereRadius = 3.5;
    const centerHeight = 4.5;

    return (
      <group
        key={id}
        position={position}
        onClick={(e) => {
          e.stopPropagation();
          onSelectAsset(id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHoverAsset(id);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onHoverAsset(null);
        }}
      >
        {/* Concrete Footing Ring */}
        <mesh position={[0, 0.2, 0]} receiveShadow>
          <cylinderGeometry args={[4.4, 4.8, 0.4, 32]} />
          {getMaterial(id, '#1e293b', 0.8, 0.2)}
        </mesh>

        {/* 8 Structural Tubular Legs */}
        {Array.from({ length: legCount }).map((_, idx) => {
          const angle = (idx / legCount) * Math.PI * 2;
          const legRadius = 3.2;
          const x = Math.cos(angle) * legRadius;
          const z = Math.sin(angle) * legRadius;

          return (
            <group key={`leg-${idx}`}>
              <mesh position={[x, centerHeight / 2, z]} castShadow receiveShadow>
                <cylinderGeometry args={[0.18, 0.22, centerHeight, 16]} />
                {getMaterial(id, '#64748b', 0.4, 0.7)}
              </mesh>
              {/* Footing Plinth */}
              <mesh position={[x, 0.3, z]} castShadow>
                <boxGeometry args={[0.6, 0.3, 0.6]} />
                {getMaterial(id, '#334155', 0.7, 0.3)}
              </mesh>
            </group>
          );
        })}

        {/* Main Pressurized Horton Sphere Vessel */}
        <mesh position={[0, centerHeight, 0]} castShadow receiveShadow>
          <sphereGeometry args={[sphereRadius, 36, 24]} />
          {getMaterial(id, '#f8fafc', 0.25, 0.6)}
        </mesh>

        {/* Equator Stiffener Ring */}
        <mesh position={[0, centerHeight, 0]}>
          <torusGeometry args={[sphereRadius + 0.05, 0.08, 12, 36]} />
          {getMaterial(id, '#0284c7', 0.3, 0.8)}
        </mesh>

        {/* Top Safety Relief Valve & Crown Platform */}
        <group position={[0, centerHeight + sphereRadius, 0]}>
          <mesh position={[0, 0.1, 0]} castShadow>
            <cylinderGeometry args={[1.2, 1.2, 0.1, 20]} />
            {getMaterial(id, '#64748b', 0.4, 0.8)}
          </mesh>
          <mesh position={[0, 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.2, 0.8, 16]} />
            {getMaterial(id, '#f59e0b', 0.3, 0.7)}
          </mesh>
        </group>

        {/* Bottom Drain Sump Valve */}
        <mesh position={[0, centerHeight - sphereRadius - 0.3, 0]} castShadow>
          <cylinderGeometry args={[0.25, 0.25, 0.6, 16]} />
          {getMaterial(id, '#0284c7', 0.3, 0.8)}
        </mesh>
      </group>
    );
  };

  return (
    <group>
      {/* Containment Dike / Concrete Bund Wall around Storage Depot */}
      <mesh position={[-30, 0.4, 20]} receiveShadow>
        <boxGeometry args={[26, 0.8, 28]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} metalness={0.1} />
      </mesh>
      <mesh position={[-30, 0.05, 20]} receiveShadow>
        <boxGeometry args={[25.2, 0.1, 27.2]} />
        <meshStandardMaterial color="#0f172a" roughness={0.95} metalness={0.05} />
      </mesh>

      {/* 1. TANK-SPHERE-01 & TANK-SPHERE-02: Horton Gas Spheres */}
      {renderHortonSphere('TANK-SPHERE-01', [-28, 0, 12])}
      {renderHortonSphere('TANK-SPHERE-02', [-28, 0, 24])}

      {/* ============================================================ */}
      {/* 2. TANK-CYL-01: Heavy Crude Bulk Storage Tank (150k bbl) */}
      {/* ============================================================ */}
      <group
        position={[-38, 0, 10]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectAsset('TANK-CYL-01');
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHoverAsset('TANK-CYL-01');
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onHoverAsset(null);
        }}
      >
        {/* Concrete Base Ring */}
        <mesh position={[0, 0.25, 0]} receiveShadow>
          <cylinderGeometry args={[4.8, 5.0, 0.5, 36]} />
          {getMaterial('TANK-CYL-01', '#1e293b', 0.8, 0.2)}
        </mesh>

        {/* Cylindrical Tank Shell */}
        <mesh position={[0, 3.2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[4.6, 4.6, 5.6, 36]} />
          {getMaterial('TANK-CYL-01', '#94a3b8', 0.35, 0.65)}
        </mesh>

        {/* Floating Roof Recess & Level Float */}
        <mesh position={[0, 5.2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[4.5, 4.5, 0.2, 36]} />
          {getMaterial('TANK-CYL-01', '#475569', 0.5, 0.5)}
        </mesh>

        {/* Wind Girder Ring */}
        <mesh position={[0, 4.8, 0]}>
          <torusGeometry args={[4.65, 0.08, 12, 36]} />
          {getMaterial('TANK-CYL-01', '#0284c7', 0.3, 0.8)}
        </mesh>

        {/* External Spiral Stairway */}
        <mesh position={[4.2, 3.2, 0]} rotation={[0, 0, Math.PI / 8]} castShadow>
          <boxGeometry args={[0.2, 6.0, 0.6]} />
          {getMaterial('TANK-CYL-01', '#cbd5e1', 0.4, 0.8)}
        </mesh>
      </group>

      {/* ============================================================ */}
      {/* 3. TANK-CYL-02: Refined Diesel Storage Tank (100k bbl) */}
      {/* ============================================================ */}
      <group
        position={[-38, 0, 24]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectAsset('TANK-CYL-02');
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHoverAsset('TANK-CYL-02');
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onHoverAsset(null);
        }}
      >
        {/* Concrete Base */}
        <mesh position={[0, 0.25, 0]} receiveShadow>
          <cylinderGeometry args={[4.4, 4.6, 0.5, 36]} />
          {getMaterial('TANK-CYL-02', '#1e293b', 0.8, 0.2)}
        </mesh>

        {/* Cylindrical Shell */}
        <mesh position={[0, 3.2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[4.2, 4.2, 5.6, 36]} />
          {getMaterial('TANK-CYL-02', '#f8fafc', 0.25, 0.6)}
        </mesh>

        {/* Fixed Geodesic Dome Roof */}
        <mesh position={[0, 6.2, 0]} castShadow>
          <sphereGeometry args={[4.25, 32, 16, 0, Math.PI * 2, 0, Math.PI / 3]} />
          {getMaterial('TANK-CYL-02', '#cbd5e1', 0.3, 0.7)}
        </mesh>

        {/* Blue Center Stripe */}
        <mesh position={[0, 3.2, 0]}>
          <cylinderGeometry args={[4.22, 4.22, 0.6, 36, 1, true]} />
          {getMaterial('TANK-CYL-02', '#0284c7', 0.3, 0.8)}
        </mesh>
      </group>

      {/* ============================================================ */}
      {/* 4. SILO-BULK-01: Catalyst & Additive Bulk Storage Silo */}
      {/* ============================================================ */}
      <group
        position={[-20, 0, 30]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectAsset('SILO-BULK-01');
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHoverAsset('SILO-BULK-01');
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onHoverAsset(null);
        }}
      >
        {/* 4 Heavy Support Columns */}
        {[-1.2, 1.2].map((x, i) =>
          [-1.2, 1.2].map((z, j) => (
            <mesh key={`silo-col-${i}-${j}`} position={[x, 1.5, z]} castShadow receiveShadow>
              <cylinderGeometry args={[0.15, 0.18, 3.0, 16]} />
              {getMaterial('SILO-BULK-01', '#475569', 0.4, 0.7)}
            </mesh>
          ))
        )}

        {/* Conical Bottom Discharge Hopper */}
        <mesh position={[0, 2.5, 0]} rotation={[Math.PI, 0, 0]} castShadow receiveShadow>
          <coneGeometry args={[2.0, 2.0, 24]} />
          {getMaterial('SILO-BULK-01', '#64748b', 0.3, 0.75)}
        </mesh>

        {/* Main Vertical Silo Cylinder */}
        <mesh position={[0, 6.2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[2.0, 2.0, 5.4, 28]} />
          {getMaterial('SILO-BULK-01', '#e2e8f0', 0.25, 0.65)}
        </mesh>

        {/* Conical Roof Cap with Dust Collector */}
        <mesh position={[0, 9.4, 0]} castShadow>
          <coneGeometry args={[2.1, 1.0, 28]} />
          {getMaterial('SILO-BULK-01', '#334155', 0.35, 0.7)}
        </mesh>
        <mesh position={[0, 10.2, 0]} castShadow>
          <boxGeometry args={[0.6, 0.8, 0.6]} />
          {getMaterial('SILO-BULK-01', '#0ea5e9', 0.3, 0.7)}
        </mesh>
      </group>
    </group>
  );
}

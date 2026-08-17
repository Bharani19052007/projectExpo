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
  telemetry = null,
}) {
  const groupRef = useRef(null);
  const shaftRef = useRef(null);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const flow = telemetry?.flowRate || 125.6;
    const speedFactor = (flow / 125.6) * 12.0;

    // Motor Shaft & Coupling High-Speed Rotation
    if (shaftRef.current) {
      shaftRef.current.rotation.x += delta * speedFactor;
    }

    if (!groupRef.current) return;

    groupRef.current.children.forEach((child) => {
      const compId = child.userData?.compId;
      if (!compId) return;

      const comp = components.find((c) => c.id === compId || compId.startsWith(c.id));
      if (!comp) return;

      const isSelected = selectedComponent && (selectedComponent.id === compId || compId.startsWith(selectedComponent.id));
      const targetPos = viewMode === 'EXPLODED' && Array.isArray(comp.explodedOffset) ? comp.explodedOffset : comp.position3d;

      if (targetPos && Array.isArray(targetPos) && targetPos.length >= 3) {
        child.position.x = THREE.MathUtils.lerp(child.position.x, targetPos[0], delta * 5);
        child.position.y = THREE.MathUtils.lerp(child.position.y, targetPos[1], delta * 5);
        child.position.z = THREE.MathUtils.lerp(child.position.z, targetPos[2], delta * 5);
      }

      child.traverse((mesh) => {
        if (mesh.isMesh && mesh.material) {
          const defaultColor = mesh.userData?.defaultColor || '#94a3b8';

          if (isHologram) {
            mesh.material.wireframe = true;
            mesh.material.transparent = true;
            if (isSimulatingFailure && isSelected) {
              mesh.material.color.set('#ff2222');
              mesh.material.emissive.set('#ef4444');
              mesh.material.emissiveIntensity = 1.2;
              mesh.material.opacity = 0.95;
            } else if (selectedComponent) {
              if (isSelected) {
                mesh.material.color.set('#00ffff');
                mesh.material.emissive.set('#00ffff');
                mesh.material.emissiveIntensity = 1.4;
                mesh.material.opacity = 1.0;
              } else {
                mesh.material.color.set('#00bfff');
                mesh.material.emissive.set('#004477');
                mesh.material.emissiveIntensity = 0.3;
                mesh.material.opacity = 0.45;
              }
            } else {
              mesh.material.color.set('#00f0ff');
              mesh.material.emissive.set('#0077aa');
              mesh.material.emissiveIntensity = 0.45 + Math.sin(time * 2 + child.position.x) * 0.15;
              mesh.material.opacity = 0.7;
            }
          } else {
            mesh.material.wireframe = false;
            mesh.material.transparent = selectedComponent && !isSelected;

            if (selectedComponent) {
              if (isSelected) {
                mesh.material.opacity = 1.0;
                if (isSimulatingFailure) {
                  mesh.material.color.set('#ef4444');
                  mesh.material.emissive.set('#dc2626');
                  mesh.material.emissiveIntensity = 0.9;
                } else if (viewMode === 'THERMAL') {
                  mesh.material.color.set('#f97316');
                  mesh.material.emissive.set('#ea580c');
                  mesh.material.emissiveIntensity = 0.7;
                } else {
                  mesh.material.color.set('#0284c7');
                  mesh.material.emissive.set('#00e5ff');
                  mesh.material.emissiveIntensity = 0.5;
                }
              } else {
                mesh.material.opacity = 0.75;
                mesh.material.color.set(defaultColor);
                mesh.material.emissive.set('#000000');
                mesh.material.emissiveIntensity = 0;
              }
            } else {
              mesh.material.opacity = 1.0;
              mesh.material.color.set(defaultColor);
              mesh.material.emissive.set('#000000');
              mesh.material.emissiveIntensity = 0;
            }
          }
        }
      });
    });
  });

  return (
    <group>
      {/* 1. STRUCTURAL STEEL SKID BASE */}
      <group position={[0, -0.65, 0]}>
        <mesh position={[0, 0, 0]} userData={{ defaultColor: '#1e293b' }}>
          <boxGeometry args={[4.8, 0.2, 2.2]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.8} />
        </mesh>
      </group>

      <group ref={groupRef}>
        {/* 2. DRIVE END SPHERICAL ROLLER BEARING B-204 (HIGH VIBRATION NODE) */}
        <group
          userData={{ compId: 'COMP-PMP-BEARING-204' }}
          position={[-0.4, 0.4, 0]}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedComponent(components.find((c) => c.id === 'COMP-PMP-BEARING-204'));
          }}
        >
          <mesh rotation={[0, 0, Math.PI / 2]} userData={{ defaultColor: '#f59e0b' }}>
            <cylinderGeometry args={[0.35, 0.35, 0.42, 24]} />
            <meshStandardMaterial color="#f59e0b" metalness={0.85} roughness={0.2} />
          </mesh>
          {/* Tri-Axis Vibration Sensor Node */}
          <mesh position={[0, 0.4, 0]} userData={{ defaultColor: '#ef4444', emissive: '#ef4444', emissiveIntensity: 0.8 }}>
            <boxGeometry args={[0.15, 0.15, 0.15]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.8} />
          </mesh>
        </group>

        {/* 3. FLEXIBLE METALLIC DISC SHAFT COUPLING & SAFETY GUARD */}
        <group
          ref={shaftRef}
          userData={{ compId: 'COMP-PMP-COUPLING' }}
          position={[-1.0, 0.4, 0]}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedComponent(components.find((c) => c.id === 'COMP-PMP-COUPLING'));
          }}
        >
          <mesh rotation={[0, 0, Math.PI / 2]} userData={{ defaultColor: '#eab308' }}>
            <cylinderGeometry args={[0.26, 0.26, 0.48, 20]} />
            <meshStandardMaterial color="#eab308" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>

        {/* 4. DUAL SUCTION STAINLESS STEEL IMPELLER & CENTRIFUGAL PUMP VOLUTE CASING */}
        <group
          userData={{ compId: 'COMP-PMP-IMPELLER' }}
          position={[0.6, 0.4, 0]}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedComponent(components.find((c) => c.id === 'COMP-PMP-IMPELLER'));
          }}
        >
          <mesh rotation={[0, 0, Math.PI / 2]} userData={{ defaultColor: '#0369a1' }}>
            <cylinderGeometry args={[0.68, 0.68, 0.85, 28]} />
            <meshStandardMaterial color="#0369a1" roughness={0.25} metalness={0.7} />
          </mesh>

          {/* Suction Flange */}
          <mesh position={[0.5, 0, 0]} rotation={[0, 0, Math.PI / 2]} userData={{ defaultColor: '#0284c7' }}>
            <cylinderGeometry args={[0.42, 0.42, 0.15, 20]} />
            <meshStandardMaterial color="#0284c7" metalness={0.8} />
          </mesh>
          {/* Discharge Flange Spool */}
          <mesh position={[0, 0.7, 0]} userData={{ defaultColor: '#0284c7' }}>
            <cylinderGeometry args={[0.24, 0.24, 0.6, 20]} />
            <meshStandardMaterial color="#0284c7" metalness={0.8} />
          </mesh>
          {/* Analogue Dial Pressure Gauge */}
          <mesh position={[0.3, 0.9, 0]} rotation={[0, Math.PI / 2, 0]} userData={{ defaultColor: '#f8fafc' }}>
            <cylinderGeometry args={[0.12, 0.12, 0.04, 20]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.1} metalness={0.9} />
          </mesh>
        </group>

        {/* 5. CARTRIDGE MECHANICAL FACE SEAL */}
        <group
          userData={{ compId: 'COMP-PMP-SEAL' }}
          position={[0.1, 0.4, 0]}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedComponent(components.find((c) => c.id === 'COMP-PMP-SEAL'));
          }}
        >
          <mesh rotation={[0, 0, Math.PI / 2]} userData={{ defaultColor: '#0f766e' }}>
            <cylinderGeometry args={[0.3, 0.3, 0.25, 20]} />
            <meshStandardMaterial color="#0f766e" metalness={0.85} roughness={0.2} />
          </mesh>
        </group>

        {/* 6. 90 kW TEFC INDUCTION DRIVE MOTOR */}
        <group
          userData={{ compId: 'COMP-PMP-MOTOR' }}
          position={[-1.9, 0.4, 0]}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedComponent(components.find((c) => c.id === 'COMP-PMP-MOTOR'));
          }}
        >
          {/* Stator Housing (Royal Blue) */}
          <mesh rotation={[0, 0, Math.PI / 2]} userData={{ defaultColor: '#0284c7' }}>
            <cylinderGeometry args={[0.55, 0.55, 1.25, 28]} />
            <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.65} />
          </mesh>
          {/* Rear Fan Cover Shroud */}
          <mesh position={[-0.7, 0, 0]} rotation={[0, 0, Math.PI / 2]} userData={{ defaultColor: '#0f172a' }}>
            <cylinderGeometry args={[0.52, 0.52, 0.22, 24]} />
            <meshStandardMaterial color="#0f172a" metalness={0.5} roughness={0.5} />
          </mesh>
          {/* Top Junction Terminal Box */}
          <mesh position={[0, 0.65, 0]} userData={{ defaultColor: '#1e293b' }}>
            <boxGeometry args={[0.4, 0.25, 0.35]} />
            <meshStandardMaterial color="#1e293b" metalness={0.7} />
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

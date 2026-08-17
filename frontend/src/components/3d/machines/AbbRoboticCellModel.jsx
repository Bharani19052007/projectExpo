import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { HolographicTwinEngine } from '../hologram/HolographicTwinEngine';

export default function AbbRoboticCellModel({
  isHologram = false,
  viewMode = 'CAD',
  selectedComponent,
  setSelectedComponent,
  isSimulatingFailure = false,
  components = [],
  telemetry = null,
}) {
  const groupRef = useRef(null);
  const j1TurretRef = useRef(null);
  const j2ShoulderRef = useRef(null);
  const j3ElbowRef = useRef(null);
  const weldArcRef = useRef(null);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const speedPct = telemetry?.speedRpm || 85;
    const speedFactor = (speedPct / 100) * 1.2;

    // Kinematic Articulated Joint Rotations (Hierarchical 6-Axis Motion)
    if (j1TurretRef.current) {
      j1TurretRef.current.rotation.y = Math.sin(time * 0.9 * speedFactor) * 0.45;
    }
    if (j2ShoulderRef.current) {
      j2ShoulderRef.current.rotation.z = Math.sin(time * 1.2 * speedFactor) * 0.18;
    }
    if (j3ElbowRef.current) {
      j3ElbowRef.current.rotation.z = -Math.cos(time * 1.4 * speedFactor) * 0.22;
    }
    if (weldArcRef.current) {
      weldArcRef.current.intensity = 0.5 + Math.sin(time * 25.0) * 0.5;
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
          const defaultColor = mesh.userData?.defaultColor || '#f59e0b';

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
      {/* 1. HEAVY PEDESTAL MOUNTING BASE */}
      <group position={[0, -0.65, 0]}>
        <mesh position={[0, 0, 0]} userData={{ defaultColor: '#1e293b' }}>
          <cylinderGeometry args={[0.9, 1.0, 0.3, 32]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.8} />
        </mesh>
        {/* Anchor Bolt Flange Lugs */}
        {Array.from({ length: 6 }).map((_, i) => {
          const a = (i / 6) * Math.PI * 2;
          return (
            <mesh key={`lug-${i}`} position={[Math.cos(a) * 0.85, 0.12, Math.sin(a) * 0.85]} userData={{ defaultColor: '#475569' }}>
              <cylinderGeometry args={[0.08, 0.08, 0.1, 12]} />
              <meshStandardMaterial color="#475569" metalness={0.9} />
            </mesh>
          );
        })}
      </group>

      <group ref={groupRef}>
        {/* 2. BASE AZIMUTH MOTOR & J1 SWIVEL TURRET */}
        <group
          ref={j1TurretRef}
          userData={{ compId: 'COMP-ROB-BASE' }}
          position={[0, -0.3, 0]}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedComponent(components.find((c) => c.id === 'COMP-ROB-BASE'));
          }}
        >
          {/* Swivel Housing */}
          <mesh userData={{ defaultColor: '#ea580c' }}>
            <cylinderGeometry args={[0.7, 0.75, 0.45, 32]} />
            <meshStandardMaterial color="#ea580c" roughness={0.3} metalness={0.5} />
          </mesh>
          {/* Dark Metallic Joint Collar */}
          <mesh position={[0, 0.25, 0]} userData={{ defaultColor: '#334155' }}>
            <cylinderGeometry args={[0.65, 0.65, 0.12, 32]} />
            <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.2} />
          </mesh>

          {/* 3. SHOULDER HARMONIC REDUCER J2 & LOWER ARM LINK */}
          <group
            ref={j2ShoulderRef}
            userData={{ compId: 'COMP-ROB-SHOULDER' }}
            position={[0, 0.5, 0]}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedComponent(components.find((c) => c.id === 'COMP-ROB-SHOULDER'));
            }}
          >
            {/* Shoulder Casting (ABB Orange) */}
            <mesh position={[0, 0.6, 0]} userData={{ defaultColor: '#ea580c' }}>
              <boxGeometry args={[0.42, 1.4, 0.42]} />
              <meshStandardMaterial color="#ea580c" roughness={0.3} metalness={0.5} />
            </mesh>
            {/* Gas Spring Damper Counter-weight Cylinder */}
            <mesh position={[-0.32, 0.5, 0]} rotation={[0, 0, -0.15]} userData={{ defaultColor: '#1e293b' }}>
              <cylinderGeometry args={[0.1, 0.1, 1.1, 20]} />
              <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.1} />
            </mesh>

            {/* 4. ELBOW CYCLOIDAL DRIVE J3 & UPPER ARM LINK */}
            <group
              ref={j3ElbowRef}
              userData={{ compId: 'COMP-ROB-ELBOW' }}
              position={[0, 1.3, 0]}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedComponent(components.find((c) => c.id === 'COMP-ROB-ELBOW'));
              }}
            >
              {/* Elbow Joint Pivot Housing */}
              <mesh userData={{ defaultColor: '#334155' }}>
                <cylinderGeometry args={[0.26, 0.26, 0.46, 20]} rotation={[Math.PI / 2, 0, 0]} />
                <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.2} />
              </mesh>
              {/* Forearm Extension Casting */}
              <mesh position={[0.45, 0, 0]} rotation={[0, 0, -Math.PI / 2]} userData={{ defaultColor: '#ea580c' }}>
                <boxGeometry args={[0.32, 1.1, 0.32]} />
                <meshStandardMaterial color="#ea580c" roughness={0.3} metalness={0.5} />
              </mesh>

              {/* 5. LASER-GUIDED WELDING TORCH END EFFECTOR (J4/J5/J6 WRIST) */}
              <group
                userData={{ compId: 'COMP-ROB-TORCH' }}
                position={[1.0, 0, 0]}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedComponent(components.find((c) => c.id === 'COMP-ROB-TORCH'));
                }}
              >
                {/* Spherical Wrist Joint */}
                <mesh userData={{ defaultColor: '#1e293b' }}>
                  <sphereGeometry args={[0.2, 20, 20]} />
                  <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.15} />
                </mesh>
                {/* Welding Torch Tool Body */}
                <mesh position={[0.25, -0.15, 0]} rotation={[0, 0, -0.6]} userData={{ defaultColor: '#e2e8f0' }}>
                  <cylinderGeometry args={[0.06, 0.04, 0.5, 16]} />
                  <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.1} />
                </mesh>
                {/* Copper Gas Nozzle Tip */}
                <mesh position={[0.38, -0.32, 0]} rotation={[0, 0, -0.6]} userData={{ defaultColor: '#b45309' }}>
                  <cylinderGeometry args={[0.03, 0.015, 0.15, 12]} />
                  <meshStandardMaterial color="#b45309" metalness={0.95} roughness={0.1} />
                </mesh>
                {/* Welding Arc Light Point Source */}
                <pointLight ref={weldArcRef} position={[0.42, -0.38, 0]} color="#38bdf8" intensity={1.5} distance={3} />
              </group>
            </group>
          </group>
        </group>

        {/* 6. IRC5 CONTROL CABINET */}
        <group position={[1.8, 0.4, -1.2]} userData={{ defaultColor: '#334155' }}>
          <mesh castShadow userData={{ defaultColor: '#334155' }}>
            <boxGeometry args={[0.9, 1.6, 0.8]} />
            <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.7} />
          </mesh>
          {/* Green Status Beacon Light */}
          <mesh position={[0, 0.9, 0]} userData={{ defaultColor: '#22c55e', emissive: '#22c55e', emissiveIntensity: 0.8 }}>
            <cylinderGeometry args={[0.06, 0.06, 0.22, 16]} />
            <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.8} />
          </mesh>
        </group>

        {/* 7. TEACH PENDANT CONTROLLER */}
        <group position={[1.8, 1.25, -0.7]}>
          <mesh rotation={[0.4, 0, 0]} userData={{ defaultColor: '#1e293b' }}>
            <boxGeometry args={[0.35, 0.5, 0.08]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          <mesh position={[0, 0.04, 0.05]} rotation={[0.4, 0, 0]} userData={{ defaultColor: '#38bdf8', emissive: '#0284c7', emissiveIntensity: 0.5 }}>
            <planeGeometry args={[0.26, 0.32]} />
            <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.5} />
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

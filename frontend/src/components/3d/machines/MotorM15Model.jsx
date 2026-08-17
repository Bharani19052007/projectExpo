import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { HolographicTwinEngine } from '../hologram/HolographicTwinEngine';

export default function MotorM15Model({
  isHologram = false,
  viewMode = 'CAD',
  selectedComponent,
  setSelectedComponent,
  isSimulatingFailure = false,
  components = [],
  telemetry,
}) {
  const groupRef = useRef(null);
  const shaftRef = useRef(null);
  const motorBodyRef = useRef(null);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // High-speed rotor shaft rotation matching RPM telemetry
    if (shaftRef.current) {
      const rpm = telemetry?.speedRpm || 1480;
      const rotSpeed = (rpm / 60) * Math.PI * 2;
      shaftRef.current.rotation.z += delta * Math.min(rotSpeed * 0.1, 25.0);
    }

    // High vibration micro-amplitude jitter on motor body when vibration is elevated
    if (motorBodyRef.current) {
      const vib = telemetry?.vibration || 2.1;
      if (vib > 3.0) {
        const amplitude = (vib - 3.0) * 0.008;
        motorBodyRef.current.position.x = Math.sin(time * 60.0) * amplitude;
        motorBodyRef.current.position.y = Math.cos(time * 60.0) * amplitude;
      } else {
        motorBodyRef.current.position.x = 0;
        motorBodyRef.current.position.y = 0;
      }
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
          mesh.material.transparent = true;

          if (isHologram) {
            mesh.material.wireframe = true;
            if (isSimulatingFailure && isSelected) {
              mesh.material.color.set('#ff2222');
              mesh.material.emissive.set('#ef4444');
              mesh.material.emissiveIntensity = 1.0;
              mesh.material.opacity = 0.95;
            } else if (selectedComponent) {
              if (isSelected) {
                mesh.material.color.set('#00ffff');
                mesh.material.emissive.set('#00ffff');
                mesh.material.emissiveIntensity = 1.2;
                mesh.material.opacity = 0.95;
              } else {
                mesh.material.color.set('#00bfff');
                mesh.material.emissive.set('#005588');
                mesh.material.emissiveIntensity = 0.2;
                mesh.material.opacity = 0.2;
              }
            } else {
              mesh.material.color.set('#00f0ff');
              mesh.material.emissive.set('#0088cc');
              mesh.material.emissiveIntensity = 0.4 + Math.sin(time * 2 + child.position.x) * 0.15;
              mesh.material.opacity = 0.55;
            }
          } else {
            mesh.material.wireframe = false;
            if (selectedComponent) {
              if (isSelected) {
                mesh.material.opacity = 1.0;
                if (isSimulatingFailure || compId === 'COMP-MTR-DE-BEARING') {
                  mesh.material.color.set('#ef4444');
                  mesh.material.emissive.set('#dc2626');
                  mesh.material.emissiveIntensity = 0.8;
                } else if (viewMode === 'THERMAL') {
                  mesh.material.color.set('#f97316');
                  mesh.material.emissive.set('#ea580c');
                  mesh.material.emissiveIntensity = 0.6;
                } else {
                  mesh.material.color.set('#0284c7');
                  mesh.material.emissive.set('#0369a1');
                  mesh.material.emissiveIntensity = 0.4;
                }
              } else {
                mesh.material.opacity = 0.25;
                if (mesh.userData?.defaultColor) {
                  mesh.material.color.set(mesh.userData.defaultColor);
                  mesh.material.emissive.set('#000000');
                  mesh.material.emissiveIntensity = 0;
                }
              }
            } else {
              mesh.material.opacity = 1.0;
              if (mesh.userData?.defaultColor) {
                mesh.material.color.set(mesh.userData.defaultColor);
                mesh.material.emissive.set('#000000');
                mesh.material.emissiveIntensity = 0;
              }
            }
          }
        }
      });
    });
  });

  return (
    <group>
      {/* HEAVY CAST-IRON MOTOR MOUNTING BASE SKID */}
      <group position={[0, -0.65, 0]}>
        <mesh position={[0, 0, 0]} userData={{ defaultColor: '#334155' }}>
          <boxGeometry args={[4.2, 0.15, 2.2]} />
          <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.8} />
        </mesh>
      </group>

      <group ref={groupRef}>
        <group ref={motorBodyRef}>
          {/* 1. Cast-Iron Ribbed Stator Housing & Cooling Fins */}
          <group
            userData={{ compId: 'COMP-MTR-HOUSING' }}
            position={[0, 0.4, 0]}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedComponent(components.find((c) => c.id === 'COMP-MTR-HOUSING'));
            }}
          >
            <mesh rotation={[Math.PI / 2, 0, 0]} userData={{ defaultColor: '#15803d' }}>
              <cylinderGeometry args={[0.75, 0.75, 2.2, 24]} />
              <meshStandardMaterial color="#15803d" roughness={0.4} metalness={0.6} />
            </mesh>

            {/* Longitudinal Cooling Fins */}
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i / 12) * Math.PI * 2;
              return (
                <mesh
                  key={`fin-${i}`}
                  position={[Math.cos(angle) * 0.78, 0, Math.sin(angle) * 0.78]}
                  rotation={[0, -angle, 0]}
                  userData={{ defaultColor: '#334155' }}
                >
                  <boxGeometry args={[0.04, 2.0, 0.12]} />
                  <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.7} />
                </mesh>
              );
            })}
          </group>

          {/* 2. Copper Stator Windings */}
          <group
            userData={{ compId: 'COMP-MTR-STATOR' }}
            position={[0, 0.4, 0]}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedComponent(components.find((c) => c.id === 'COMP-MTR-STATOR'));
            }}
          >
            <mesh rotation={[Math.PI / 2, 0, 0]} userData={{ defaultColor: '#b45309' }}>
              <cylinderGeometry args={[0.55, 0.55, 1.8, 24]} />
              <meshStandardMaterial color="#b45309" roughness={0.2} metalness={0.9} />
            </mesh>
          </group>

          {/* 3. Drive End Spherical Roller Bearing B-15 (HIGH VIBRATION RISK NODE) */}
          <group
            userData={{ compId: 'COMP-MTR-DE-BEARING' }}
            position={[0, 0.4, 1.05]}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedComponent(components.find((c) => c.id === 'COMP-MTR-DE-BEARING'));
            }}
          >
            <mesh rotation={[Math.PI / 2, 0, 0]} userData={{ defaultColor: '#dc2626' }}>
              <cylinderGeometry args={[0.42, 0.42, 0.25, 24]} />
              <meshStandardMaterial color="#dc2626" emissive="#ef4444" emissiveIntensity={0.6} />
            </mesh>
          </group>

          {/* 4. Non-Drive End Bearing Assembly & Cooling Fan Shield */}
          <group
            userData={{ compId: 'COMP-MTR-NDE-BEARING' }}
            position={[0, 0.4, -1.05]}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedComponent(components.find((c) => c.id === 'COMP-MTR-NDE-BEARING'));
            }}
          >
            <mesh rotation={[Math.PI / 2, 0, 0]} userData={{ defaultColor: '#475569' }}>
              <cylinderGeometry args={[0.72, 0.72, 0.35, 24]} />
              <meshStandardMaterial color="#475569" metalness={0.8} />
            </mesh>
          </group>

          {/* 5. Precision Steel Output Shaft */}
          <group
            ref={shaftRef}
            userData={{ compId: 'COMP-MTR-SHAFT' }}
            position={[0, 0.4, 1.4]}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedComponent(components.find((c) => c.id === 'COMP-MTR-SHAFT'));
            }}
          >
            <mesh rotation={[Math.PI / 2, 0, 0]} userData={{ defaultColor: '#e2e8f0' }}>
              <cylinderGeometry args={[0.2, 0.2, 0.9, 20]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.98} roughness={0.08} />
            </mesh>
            {/* Shaft Drive Keyway Slot */}
            <mesh position={[0, 0.21, 0.1]} userData={{ defaultColor: '#0f172a' }}>
              <boxGeometry args={[0.06, 0.04, 0.4]} />
              <meshStandardMaterial color="#0f172a" />
            </mesh>
          </group>

          {/* 6. Top Industrial Power Junction Box */}
          <group
            userData={{ compId: 'COMP-MTR-JUNCTION' }}
            position={[0, 1.35, 0]}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedComponent(components.find((c) => c.id === 'COMP-MTR-JUNCTION'));
            }}
          >
            <mesh userData={{ defaultColor: '#2563eb' }}>
              <boxGeometry args={[0.7, 0.45, 0.7]} />
              <meshStandardMaterial color="#2563eb" roughness={0.3} metalness={0.6} />
            </mesh>
            {/* Cable Glands */}
            <mesh position={[0.38, 0, 0]} rotation={[0, 0, Math.PI / 2]} userData={{ defaultColor: '#d97706' }}>
              <cylinderGeometry args={[0.06, 0.06, 0.12, 12]} />
              <meshStandardMaterial color="#d97706" metalness={0.9} />
            </mesh>
          </group>

          {/* 7. Multi-Axis Vibration & Thermal IIoT Sensors */}
          <group
            userData={{ compId: 'COMP-MTR-SENSORS' }}
            position={[0.7, 0.8, 0.8]}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedComponent(components.find((c) => c.id === 'COMP-MTR-SENSORS'));
            }}
          >
            <mesh userData={{ defaultColor: '#ef4444' }}>
              <cylinderGeometry args={[0.08, 0.08, 0.18, 16]} />
              <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.8} />
            </mesh>
          </group>
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

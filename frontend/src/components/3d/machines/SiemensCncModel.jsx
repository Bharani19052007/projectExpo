import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { HolographicTwinEngine } from '../hologram/HolographicTwinEngine';

export default function SiemensCncModel({
  isHologram = false,
  viewMode = 'CAD',
  selectedComponent,
  setSelectedComponent,
  isSimulatingFailure = false,
  components = [],
  telemetry = null,
}) {
  const groupRef = useRef(null);
  const spindleRef = useRef(null);
  const zAxisRef = useRef(null);
  const tableRef = useRef(null);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const rpm = telemetry?.speedRpm || 1250;
    const speedFactor = (rpm / 1250) * 15.0;

    // High-Speed Spindle Rotation
    if (spindleRef.current) {
      spindleRef.current.rotation.y += delta * speedFactor;
    }

    // Z-Axis Machining Feed Motion
    if (zAxisRef.current) {
      zAxisRef.current.position.y = 0.8 + Math.sin(time * 3.0) * 0.08;
    }

    // Rotary Table Motion
    if (tableRef.current) {
      tableRef.current.rotation.z = Math.sin(time * 1.5) * 0.15;
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
                if (isSimulatingFailure) {
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
                mesh.material.opacity = 0.3;
                if (mesh.userData?.defaultColor) {
                  mesh.material.color.set(mesh.userData.defaultColor);
                  mesh.material.emissive.set('#000000');
                  mesh.material.emissiveIntensity = 0;
                }
              }
            } else {
              mesh.material.opacity = mesh.userData?.isGlass ? 0.35 : 1.0;
              if (mesh.userData?.defaultColor) {
                mesh.material.color.set(mesh.userData.defaultColor);
                mesh.material.emissive.set(mesh.userData?.emissive || '#000000');
                mesh.material.emissiveIntensity = mesh.userData?.emissiveIntensity || 0;
              }
            }
          }
        }
      });
    });
  });

  return (
    <group>
      {/* 1. HEAVY CAST-IRON MACHINE BASE & LEVELING FEET */}
      <group position={[0, -0.65, 0]}>
        <mesh position={[0, 0, 0]} userData={{ defaultColor: '#1e293b' }}>
          <boxGeometry args={[4.8, 0.25, 3.2]} />
          <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.8} />
        </mesh>
        {/* Leveling Feet */}
        {[-2.2, 2.2].map((x, i) =>
          [-1.4, 1.4].map((z, j) => (
            <mesh key={`foot-${i}-${j}`} position={[x, -0.18, z]} userData={{ defaultColor: '#475569' }}>
              <cylinderGeometry args={[0.15, 0.2, 0.12, 12]} />
              <meshStandardMaterial color="#475569" metalness={0.9} />
            </mesh>
          ))
        )}
      </group>

      <group ref={groupRef}>
        {/* 2. ENCLOSURE CABINET & INTERIOR CHAMBER */}
        <group userData={{ compId: 'COMP-CNC-ENCLOSURE' }}>
          {/* Main Enclosure Body (DMG MORI White & Slate) */}
          <mesh position={[0, 1.2, 0]} userData={{ defaultColor: '#f8fafc' }}>
            <boxGeometry args={[4.4, 2.4, 2.8]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.25} metalness={0.1} />
          </mesh>
          {/* Cobalt Blue Front Accent Band */}
          <mesh position={[0, 2.2, 1.42]} userData={{ defaultColor: '#0284c7' }}>
            <boxGeometry args={[4.42, 0.4, 0.04]} />
            <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.4} />
          </mesh>
          {/* Polycarbonate Glass Inspection Window */}
          <mesh position={[0, 1.1, 1.42]} userData={{ defaultColor: '#38bdf8', isGlass: true }}>
            <boxGeometry args={[2.8, 1.5, 0.05]} />
            <meshStandardMaterial color="#38bdf8" transparent opacity={0.35} roughness={0.05} />
          </mesh>
          {/* Interior Coolant Chamber Lighting */}
          <pointLight position={[0, 1.8, 0]} color="#38bdf8" intensity={1.2} distance={4} />
        </group>

        {/* 3. ELECTRO-SPINDLE MOTOR & SPINDLE HEAD */}
        <group
          ref={zAxisRef}
          userData={{ compId: 'COMP-CNC-SPINDLE' }}
          position={[0, 0.8, 0]}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedComponent(components.find((c) => c.id === 'COMP-CNC-SPINDLE'));
          }}
        >
          {/* Spindle Housing Block */}
          <mesh userData={{ defaultColor: '#0284c7' }}>
            <boxGeometry args={[0.9, 1.1, 0.9]} />
            <meshStandardMaterial color="#0284c7" roughness={0.2} metalness={0.8} />
          </mesh>
          {/* Electro-Spindle Cartridge */}
          <group ref={spindleRef} position={[0, -0.4, 0]}>
            <mesh userData={{ defaultColor: '#e2e8f0' }}>
              <cylinderGeometry args={[0.22, 0.18, 0.7, 24]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.1} />
            </mesh>
            {/* Carbide Endmill Cutting Tool Bit */}
            <mesh position={[0, -0.45, 0]} userData={{ defaultColor: '#cbd5e1' }}>
              <cylinderGeometry args={[0.05, 0.05, 0.3, 16]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.98} roughness={0.05} />
            </mesh>
          </group>
        </group>

        {/* 4. MAIN SPINDLE CERAMIC BEARING B-204 */}
        <group
          userData={{ compId: 'COMP-CNC-BEARING-204' }}
          position={[0, 0.6, 0]}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedComponent(components.find((c) => c.id === 'COMP-CNC-BEARING-204'));
          }}
        >
          <mesh rotation={[Math.PI / 2, 0, 0]} userData={{ defaultColor: '#b45309' }}>
            <torusGeometry args={[0.26, 0.06, 12, 24]} />
            <meshStandardMaterial color="#b45309" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>

        {/* 5. 32-STATION AUTOMATIC TOOL CHANGER (ATC) CAROUSEL */}
        <group
          userData={{ compId: 'COMP-CNC-TOOLCAR' }}
          position={[-1.6, 1.2, 0]}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedComponent(components.find((c) => c.id === 'COMP-CNC-TOOLCAR'));
          }}
        >
          <mesh rotation={[0, 0, Math.PI / 2]} userData={{ defaultColor: '#475569' }}>
            <cylinderGeometry args={[0.75, 0.75, 0.35, 32]} />
            <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Tool Holders around circumference */}
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i / 8) * Math.PI * 2;
            return (
              <mesh key={`tool-${i}`} position={[0.2, Math.sin(a) * 0.55, Math.cos(a) * 0.55]} userData={{ defaultColor: '#e2e8f0' }}>
                <cylinderGeometry args={[0.04, 0.04, 0.25, 12]} />
                <meshStandardMaterial color="#e2e8f0" metalness={0.95} />
              </mesh>
            );
          })}
        </group>

        {/* 6. PRECISION BALL SCREWS & LINEAR GUIDE RAILS */}
        <group
          userData={{ compId: 'COMP-CNC-BALLSCREW' }}
          position={[0, 0.6, -0.9]}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedComponent(components.find((c) => c.id === 'COMP-CNC-BALLSCREW'));
          }}
        >
          {[-0.6, 0.6].map((x, i) => (
            <mesh key={`rail-${i}`} position={[x, 0, 0]} userData={{ defaultColor: '#e2e8f0' }}>
              <boxGeometry args={[0.1, 2.2, 0.1]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.1} />
            </mesh>
          ))}
          {/* Central Precision Ball Screw */}
          <mesh position={[0, 0, 0]} userData={{ defaultColor: '#94a3b8' }}>
            <cylinderGeometry args={[0.06, 0.06, 2.2, 16]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.15} />
          </mesh>
        </group>

        {/* 7. 5-AXIS ROTARY TRUNNION WORK TABLE */}
        <group ref={tableRef} position={[0, -0.2, 0.2]}>
          <mesh userData={{ defaultColor: '#334155' }}>
            <cylinderGeometry args={[0.85, 0.85, 0.22, 32]} />
            <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* T-Slots */}
          <mesh position={[0, 0.12, 0]} userData={{ defaultColor: '#0f172a' }}>
            <boxGeometry args={[1.5, 0.02, 0.06]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
        </group>

        {/* 8. SWIVEL SINUMERIK TOUCH CONTROLLER PANEL */}
        <group position={[2.1, 1.2, 1.2]}>
          <mesh rotation={[0, -0.3, 0]} userData={{ defaultColor: '#0284c7' }}>
            <boxGeometry args={[0.45, 0.7, 0.12]} />
            <meshStandardMaterial color="#0284c7" metalness={0.5} />
          </mesh>
          <mesh position={[-0.06, 0.05, 0.12]} rotation={[0, -0.3, 0]} userData={{ defaultColor: '#38bdf8', emissive: '#0284c7', emissiveIntensity: 0.6 }}>
            <planeGeometry args={[0.35, 0.5]} />
            <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.6} />
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

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { HolographicTwinEngine } from '../hologram/HolographicTwinEngine';

export default function SchneiderConveyorModel({
  isHologram = false,
  viewMode = 'CAD',
  selectedComponent,
  setSelectedComponent,
  isSimulatingFailure = false,
  components = [],
  telemetry = null,
}) {
  const groupRef = useRef(null);
  const beltRef = useRef(null);
  const toteRef = useRef(null);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const speed = telemetry?.speedRpm || 38;
    const speedFactor = (speed / 38) * 0.6;

    if (toteRef.current) {
      toteRef.current.position.x = ((time * speedFactor) % 4.8) - 2.4;
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
      {/* 1. HEAVY STRUCTURAL STEEL CHANNEL FRAME & SUPPORT LEGS */}
      <group position={[0, -0.6, 0]}>
        {[-2.2, 0, 2.2].map((x, i) => (
          <mesh key={`leg-${i}`} position={[x, -0.3, 0]} userData={{ defaultColor: '#334155' }}>
            <boxGeometry args={[0.16, 0.8, 1.3]} />
            <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
      </group>

      <group ref={groupRef}>
        {/* 2. STRUCTURAL CHANNEL SIDE FRAMES */}
        <group
          userData={{ compId: 'COMP-CNV-FRAME' }}
          position={[0, -0.2, 0]}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedComponent(components.find((c) => c.id === 'COMP-CNV-FRAME'));
          }}
        >
          {[-0.65, 0.65].map((z, i) => (
            <mesh key={`rail-${i}`} position={[0, 0, z]} userData={{ defaultColor: '#475569' }}>
              <boxGeometry args={[5.2, 0.16, 0.08]} />
              <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
            </mesh>
          ))}
          {/* Yellow Safety Side Guide Rails */}
          {[-0.62, 0.62].map((z, i) => (
            <mesh key={`guide-${i}`} position={[0, 0.22, z]} userData={{ defaultColor: '#eab308' }}>
              <boxGeometry args={[5.2, 0.06, 0.04]} />
              <meshStandardMaterial color="#eab308" metalness={0.8} />
            </mesh>
          ))}
        </group>

        {/* 3. HELICAL-BEVEL GEARMOTOR DRIVE UNIT & DRIVE DRUM */}
        <group
          userData={{ compId: 'COMP-CNV-DRIVE' }}
          position={[2.4, 0, -0.8]}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedComponent(components.find((c) => c.id === 'COMP-CNV-DRIVE'));
          }}
        >
          <mesh rotation={[0, 0, Math.PI / 2]} userData={{ defaultColor: '#0284c7' }}>
            <cylinderGeometry args={[0.3, 0.3, 0.6, 20]} />
            <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.7} />
          </mesh>
          {/* Gearbox Housing */}
          <mesh position={[0, 0, 0.4]} userData={{ defaultColor: '#1e293b' }}>
            <boxGeometry args={[0.45, 0.45, 0.35]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} />
          </mesh>
        </group>

        {/* 4. HIGH-TRACTION VULCANIZED RUBBER CONVEYOR BELT */}
        <group
          ref={beltRef}
          userData={{ compId: 'COMP-CNV-BELT' }}
          position={[0, 0.05, 0]}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedComponent(components.find((c) => c.id === 'COMP-CNV-BELT'));
          }}
        >
          <mesh userData={{ defaultColor: '#1e293b' }}>
            <boxGeometry args={[5.0, 0.12, 1.2]} />
            <meshStandardMaterial color="#1e293b" roughness={0.7} metalness={0.1} />
          </mesh>
          {/* Array of Steel Bed Idler Rollers */}
          {[-2.0, -1.2, -0.4, 0.4, 1.2, 2.0].map((x, i) => (
            <mesh key={`roller-${i}`} position={[x, -0.08, 0]} rotation={[Math.PI / 2, 0, 0]} userData={{ defaultColor: '#cbd5e1' }}>
              <cylinderGeometry args={[0.08, 0.08, 1.22, 16]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
            </mesh>
          ))}
        </group>

        {/* 5. AUTOMATED TOTE PALLETS & OVERHEAD OPTICAL BARCODE SCANNER ARCH */}
        <group
          userData={{ compId: 'COMP-CNV-TOTES' }}
          position={[0, 0, 0]}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedComponent(components.find((c) => c.id === 'COMP-CNV-TOTES'));
          }}
        >
          {/* Moving Tote Box Container */}
          <mesh ref={toteRef} position={[0, 0.32, 0]} userData={{ defaultColor: '#0284c7' }}>
            <boxGeometry args={[0.7, 0.4, 0.8]} />
            <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.3} />
          </mesh>

          {/* Overhead Barcode Scanning Gantry Arch */}
          <group position={[0, 0.8, 0]}>
            {[-0.7, 0.7].map((z, i) => (
              <mesh key={`arch-${i}`} position={[0, 0, z]} userData={{ defaultColor: '#475569' }}>
                <cylinderGeometry args={[0.04, 0.04, 1.4, 12]} />
                <meshStandardMaterial color="#475569" metalness={0.8} />
              </mesh>
            ))}
            {/* Top Scanning Beam Unit */}
            <mesh position={[0, 0.7, 0]} userData={{ defaultColor: '#a855f7' }}>
              <boxGeometry args={[0.3, 0.15, 1.5]} />
              <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.6} />
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

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { HolographicTwinEngine } from '../hologram/HolographicTwinEngine';

export default function Press45TModel({
  isHologram = false,
  viewMode = 'CAD',
  selectedComponent,
  setSelectedComponent,
  isSimulatingFailure = false,
  components = [],
  telemetry,
}) {
  const groupRef = useRef(null);
  const pressRamRef = useRef(null);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    
    // Dynamic stamping stroke animation based on SPM speed
    if (pressRamRef.current) {
      const spm = telemetry?.speedRpm || 45;
      const strokeFreq = (spm / 60) * Math.PI * 2;
      const strokeProgress = (Math.sin(time * strokeFreq) + 1) * 0.5;
      pressRamRef.current.position.y = 1.7 - strokeProgress * 0.8;
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
      {/* MASSIVE HEAVY STAMPING PRESS FOUNDATION BED */}
      <group position={[0, -0.65, 0]}>
        <mesh position={[0, 0, 0]} userData={{ defaultColor: '#1e293b' }}>
          <boxGeometry args={[4.2, 0.4, 3.4]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.8} />
        </mesh>
      </group>

      <group ref={groupRef}>
        {/* 1. Base Bed & Lower Cushion Cylinder */}
        <group
          userData={{ compId: 'COMP-PRS-RAM' }}
          position={[0, -0.3, 0]}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedComponent(components.find((c) => c.id === 'COMP-PRS-RAM'));
          }}
        >
          <mesh userData={{ defaultColor: '#334155' }}>
            <boxGeometry args={[3.6, 0.5, 2.8]} />
            <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.7} />
          </mesh>
          <mesh position={[0, 0.4, 0]} userData={{ defaultColor: '#e2e8f0' }}>
            <cylinderGeometry args={[0.7, 0.7, 0.3, 32]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.1} />
          </mesh>
        </group>

        {/* 2. Solid Chrome Tie Rod Columns */}
        <group
          userData={{ compId: 'COMP-PRS-COLUMNS' }}
          position={[0, 1.4, 0]}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedComponent(components.find((c) => c.id === 'COMP-PRS-COLUMNS'));
          }}
        >
          {[-1.5, 1.5].map((x, i) =>
            [-1.1, 1.1].map((z, j) => (
              <mesh key={`col-${i}-${j}`} position={[x, 0, z]} userData={{ defaultColor: '#cbd5e1' }}>
                <cylinderGeometry args={[0.18, 0.18, 3.8, 20]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.08} />
              </mesh>
            ))
          )}
        </group>

        {/* 3. Top Hydraulic Crown & Upper Cylinder Housing */}
        <group
          userData={{ compId: 'COMP-PRS-CROWN' }}
          position={[0, 3.2, 0]}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedComponent(components.find((c) => c.id === 'COMP-PRS-CROWN'));
          }}
        >
          <mesh userData={{ defaultColor: '#15803d' }}>
            <boxGeometry args={[4.0, 1.2, 3.2]} />
            <meshStandardMaterial color="#15803d" roughness={0.35} metalness={0.6} />
          </mesh>
          {/* Dual Hydraulic Actuator Drums */}
          {[-1.0, 1.0].map((x, i) => (
            <mesh key={`act-${i}`} position={[x, 0.8, 0]} userData={{ defaultColor: '#1e293b' }}>
              <cylinderGeometry args={[0.45, 0.45, 0.8, 24]} />
              <meshStandardMaterial color="#1e293b" metalness={0.8} />
            </mesh>
          ))}
        </group>

        {/* 4. Moving Hydraulic Stamping Ram & Forming Die */}
        <group
          ref={pressRamRef}
          userData={{ compId: 'COMP-PRS-RAM' }}
          position={[0, 1.7, 0]}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedComponent(components.find((c) => c.id === 'COMP-PRS-RAM'));
          }}
        >
          <mesh userData={{ defaultColor: '#334155' }}>
            <boxGeometry args={[2.8, 0.8, 2.2]} />
            <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.2} />
          </mesh>
          {/* Lower Die Plate */}
          <mesh position={[0, -0.45, 0]} userData={{ defaultColor: '#d97706' }}>
            <boxGeometry args={[2.4, 0.15, 1.8]} />
            <meshStandardMaterial color="#d97706" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>

        {/* 5. Proportional Directional Valve Bank */}
        <group
          userData={{ compId: 'COMP-PRS-VALVE' }}
          position={[1.8, 2.4, 1.4]}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedComponent(components.find((c) => c.id === 'COMP-PRS-VALVE'));
          }}
        >
          <mesh userData={{ defaultColor: '#475569' }}>
            <boxGeometry args={[0.8, 0.7, 0.6]} />
            <meshStandardMaterial color="#475569" metalness={0.8} />
          </mesh>
          {/* Solenoid Valve Coils */}
          {[-0.2, 0.2].map((x, i) => (
            <mesh key={`sol-${i}`} position={[x, 0.4, 0]} userData={{ defaultColor: '#0284c7' }}>
              <cylinderGeometry args={[0.08, 0.08, 0.3, 16]} />
              <meshStandardMaterial color="#0284c7" metalness={0.8} />
            </mesh>
          ))}
        </group>

        {/* 6. Hydraulic Oil Reservoir & Pressure Gauge Assembly */}
        <group
          userData={{ compId: 'COMP-PRS-SENSORS' }}
          position={[-1.8, 2.4, -1.2]}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedComponent(components.find((c) => c.id === 'COMP-PRS-SENSORS'));
          }}
        >
          <mesh userData={{ defaultColor: '#1e293b' }}>
            <boxGeometry args={[0.9, 0.8, 0.7]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          {/* Analogue Pressure Dial Gauge */}
          <mesh position={[0.46, 0.2, 0]} rotation={[0, Math.PI / 2, 0]} userData={{ defaultColor: '#f8fafc' }}>
            <cylinderGeometry args={[0.12, 0.12, 0.04, 20]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.1} metalness={0.9} />
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

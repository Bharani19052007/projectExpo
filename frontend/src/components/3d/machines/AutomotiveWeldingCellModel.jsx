import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { HolographicTwinEngine } from '../hologram/HolographicTwinEngine';

export default function AutomotiveWeldingCellModel({
  isHologram = false,
  viewMode = 'CAD',
  selectedComponent,
  setSelectedComponent,
  isSimulatingFailure = false,
  components = [],
}) {
  const groupRef = useRef(null);
  const robotRef = useRef(null);
  const sparkRef = useRef(null);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    if (robotRef.current) {
      robotRef.current.rotation.y = Math.sin(time * 1.1) * 0.35;
    }
    if (sparkRef.current) {
      sparkRef.current.scale.setScalar(0.7 + Math.random() * 0.5);
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
      {/* WELDING CELL STEEL FLOOR PLATE */}
      <group position={[0, -0.65, 0]}>
        <mesh position={[0, 0, 0]} userData={{ defaultColor: '#1e293b' }}>
          <boxGeometry args={[6.0, 0.15, 2.6]} />
          <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.8} />
        </mesh>
      </group>

      <group ref={groupRef}>
        {/* 1. KR500 Spot Welding Robot Arm */}
        <group ref={robotRef} userData={{ compId: 'weld-robot-arm' }} position={[0, 0.6, 0]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'weld-robot-arm')); }}>
          <mesh userData={{ defaultColor: '#ff5500' }}>
            <cylinderGeometry args={[0.52, 0.52, 0.65, 24]} />
            <meshStandardMaterial color="#ff5500" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.85, 0]} rotation={[0, 0, 0.3]} userData={{ defaultColor: '#ff5500' }}>
            <boxGeometry args={[0.42, 1.4, 0.42]} />
            <meshStandardMaterial color="#ff5500" roughness={0.3} />
          </mesh>
        </group>

        {/* 2. Water-Cooled Laser Welding Head */}
        <group userData={{ compId: 'laser-weld-head' }} position={[1.2, 1.2, 0]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'laser-weld-head')); }}>
          <mesh userData={{ defaultColor: '#ef4444' }}>
            <boxGeometry args={[0.32, 0.55, 0.32]} />
            <meshStandardMaterial color="#ef4444" metalness={0.8} />
          </mesh>
          {/* Arc Spark Light Nozzle */}
          <mesh ref={sparkRef} position={[0, -0.42, 0]} userData={{ defaultColor: '#38bdf8' }}>
            <sphereGeometry args={[0.16, 12, 12]} />
            <meshStandardMaterial color="#38bdf8" emissive="#00ffff" emissiveIntensity={1.5} />
          </mesh>
        </group>

        {/* 3. Inverter Welding Power Source */}
        <group userData={{ compId: 'welding-power-source' }} position={[2.2, 0.4, 0]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'welding-power-source')); }}>
          <mesh userData={{ defaultColor: '#334155' }}>
            <boxGeometry args={[0.85, 1.25, 0.75]} />
            <meshStandardMaterial color="#334155" roughness={0.4} />
          </mesh>
        </group>

        {/* 4. Water Cooling Chiller */}
        <group userData={{ compId: 'water-chiller' }} position={[2.2, 0.4, -1.0]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'water-chiller')); }}>
          <mesh userData={{ defaultColor: '#0284c7' }}>
            <boxGeometry args={[0.75, 1.05, 0.65]} />
            <meshStandardMaterial color="#0284c7" />
          </mesh>
        </group>

        {/* 5. Fume Extraction Hood */}
        <group userData={{ compId: 'fume-extractor' }} position={[0, 2.0, 0]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'fume-extractor')); }}>
          <mesh userData={{ defaultColor: '#475569' }}>
            <coneGeometry args={[0.85, 0.65, 24]} rotation={[Math.PI, 0, 0]} />
            <meshStandardMaterial color="#475569" roughness={0.4} />
          </mesh>
        </group>

        {/* 6. Pneumatic Body Clamping Fixtures */}
        <group userData={{ compId: 'clamping-fixture' }} position={[-1.2, 0.4, 0.8]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'clamping-fixture')); }}>
          <mesh userData={{ defaultColor: '#64748b' }}>
            <boxGeometry args={[0.85, 0.45, 0.85]} />
            <meshStandardMaterial color="#64748b" metalness={0.8} />
          </mesh>
        </group>

        {/* 7. Safety Interlock Barrier */}
        <group userData={{ compId: 'safety-barrier' }} position={[0, 0.6, 1.8]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'safety-barrier')); }}>
          <mesh userData={{ defaultColor: '#f59e0b' }}>
            <boxGeometry args={[4.2, 1.9, 0.05]} />
            <meshStandardMaterial color="#f59e0b" wireframe={true} />
          </mesh>
        </group>

        {/* 8. Smart Welding Teach Console */}
        <group userData={{ compId: 'weld-teach-console' }} position={[-1.8, 0.4, 1.0]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'weld-teach-console')); }}>
          <mesh userData={{ defaultColor: '#1e293b' }}>
            <boxGeometry args={[0.38, 0.55, 0.12]} rotation={[0.3, 0, 0]} />
            <meshStandardMaterial color="#1e293b" />
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

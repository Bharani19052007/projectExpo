import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { HolographicTwinEngine } from '../hologram/HolographicTwinEngine';

export default function SteamBoilerModel({
  isHologram = false,
  viewMode = 'CAD',
  selectedComponent,
  setSelectedComponent,
  isSimulatingFailure = false,
  components = [],
  telemetry = null,
}) {
  const groupRef = useRef(null);
  const flameRef = useRef(null);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const temp = telemetry?.temperature || 182.4;
    const pulseFactor = (temp / 182.4) * 12.0;

    if (flameRef.current) {
      flameRef.current.scale.y = 1.0 + Math.sin(time * pulseFactor) * 0.22;
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
              mesh.material.opacity = 1.0;
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
      {/* 1. STEEL BASE SADDLE SUPPORTS */}
      <group position={[0, -0.65, 0]}>
        {[-1.2, 1.2].map((x, i) => (
          <mesh key={`saddle-${i}`} position={[x, 0.1, 0]} userData={{ defaultColor: '#334155' }}>
            <boxGeometry args={[0.5, 0.3, 2.2]} />
            <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.8} />
          </mesh>
        ))}
      </group>

      <group ref={groupRef}>
        {/* 2. HIGH-PRESSURE WATER-TUBE BOILER DRUM SHELL */}
        <group
          userData={{ compId: 'COMP-BLR-DRUM' }}
          position={[0, 0.6, 0]}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedComponent(components.find((c) => c.id === 'COMP-BLR-DRUM'));
          }}
        >
          <mesh rotation={[0, 0, Math.PI / 2]} userData={{ defaultColor: '#cbd5e1' }}>
            <cylinderGeometry args={[0.95, 0.95, 3.8, 32]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.25} metalness={0.8} />
          </mesh>
          {/* End Dish Heads */}
          {[-1.9, 1.9].map((x, i) => (
            <mesh key={`head-${i}`} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]} userData={{ defaultColor: '#94a3b8' }}>
              <sphereGeometry args={[0.95, 24, 16]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.8} />
            </mesh>
          ))}
          {/* Flue Stack Connection */}
          <mesh position={[1.4, 1.2, 0]} userData={{ defaultColor: '#475569' }}>
            <cylinderGeometry args={[0.3, 0.35, 1.2, 20]} />
            <meshStandardMaterial color="#475569" roughness={0.5} />
          </mesh>
        </group>

        {/* 3. LOW-NOx DUAL-FUEL GAS BURNER */}
        <group
          userData={{ compId: 'COMP-BLR-BURNER' }}
          position={[-2.3, 0.6, 0]}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedComponent(components.find((c) => c.id === 'COMP-BLR-BURNER'));
          }}
        >
          <mesh rotation={[0, 0, Math.PI / 2]} userData={{ defaultColor: '#dc2626' }}>
            <cylinderGeometry args={[0.55, 0.55, 0.9, 24]} />
            <meshStandardMaterial color="#dc2626" roughness={0.3} />
          </mesh>
          {/* Combustion Flame Cone */}
          <mesh ref={flameRef} position={[0.6, 0, 0]} rotation={[0, 0, -Math.PI / 2]} userData={{ defaultColor: '#f59e0b', emissive: '#ef4444', emissiveIntensity: 1.0 }}>
            <coneGeometry args={[0.35, 0.9, 16]} />
            <meshStandardMaterial color="#f59e0b" emissive="#ef4444" emissiveIntensity={1.0} />
          </mesh>
        </group>

        {/* 4. MEMBRANE WATER WALL TUBE BANK */}
        <group
          userData={{ compId: 'COMP-BLR-TUBES' }}
          position={[0, 0.6, 0.98]}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedComponent(components.find((c) => c.id === 'COMP-BLR-TUBES'));
          }}
        >
          {[-1.2, -0.6, 0, 0.6, 1.2].map((x, i) => (
            <mesh key={`tube-${i}`} position={[x, 0, 0]} userData={{ defaultColor: '#64748b' }}>
              <cylinderGeometry args={[0.06, 0.06, 1.8, 16]} />
              <meshStandardMaterial color="#64748b" metalness={0.9} />
            </mesh>
          ))}
        </group>

        {/* 5. SPRING-LOADED SAFETY RELIEF VALVE BANK */}
        <group
          userData={{ compId: 'COMP-BLR-VALVE' }}
          position={[0, 1.85, 0]}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedComponent(components.find((c) => c.id === 'COMP-BLR-VALVE'));
          }}
        >
          {[-0.6, 0.6].map((x, i) => (
            <group key={`valve-${i}`} position={[x, 0, 0]}>
              <mesh userData={{ defaultColor: '#ef4444' }}>
                <cylinderGeometry args={[0.14, 0.14, 0.7, 16]} />
                <meshStandardMaterial color="#ef4444" metalness={0.9} />
              </mesh>
              {/* Valve Lever */}
              <mesh position={[0.15, 0.3, 0]} rotation={[0, 0, 0.3]} userData={{ defaultColor: '#dc2626' }}>
                <boxGeometry args={[0.3, 0.04, 0.04]} />
                <meshStandardMaterial color="#dc2626" />
              </mesh>
            </group>
          ))}
          {/* Pressure Gauge Dial */}
          <mesh position={[0, 0.3, 0.3]} rotation={[Math.PI / 2, 0, 0]} userData={{ defaultColor: '#f8fafc' }}>
            <cylinderGeometry args={[0.14, 0.14, 0.04, 20]} />
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

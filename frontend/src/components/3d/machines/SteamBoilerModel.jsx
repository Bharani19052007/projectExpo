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
}) {
  const groupRef = useRef(null);
  const flameRef = useRef(null);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    if (flameRef.current) {
      flameRef.current.scale.y = 1.0 + Math.sin(time * 12.0) * 0.18;
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
      {/* BOILER STEEL BASE SADDLE MOUNT */}
      <group position={[-0.8, -0.9, 0]}>
        <mesh position={[0, 0, 0]} userData={{ defaultColor: '#334155' }}>
          <boxGeometry args={[3.2, 0.2, 2.0]} />
          <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.8} />
        </mesh>
      </group>

      <group ref={groupRef}>
        {/* 1. High-Efficiency Dual-Fuel Burner */}
        <group userData={{ compId: 'burner-unit' }} position={[-2.2, 0.4, 0]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'burner-unit')); }}>
          <mesh userData={{ defaultColor: '#dc2626' }}>
            <cylinderGeometry args={[0.52, 0.52, 1.2, 24]} rotation={[0, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#dc2626" roughness={0.3} />
          </mesh>
          {/* Animated Combustion Flame Chamber */}
          <mesh ref={flameRef} position={[0.75, 0, 0]} userData={{ defaultColor: '#f59e0b' }}>
            <coneGeometry args={[0.32, 0.85, 16]} rotation={[0, 0, -Math.PI / 2]} />
            <meshStandardMaterial color="#f59e0b" emissive="#ef4444" emissiveIntensity={1.0} />
          </mesh>
        </group>

        {/* 2. Water Drum Assembly (Lower Drum) */}
        <group userData={{ compId: 'water-drum' }} position={[-0.8, -0.6, 0]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'water-drum')); }}>
          <mesh rotation={[0, 0, Math.PI / 2]} userData={{ defaultColor: '#334155' }}>
            <cylinderGeometry args={[0.52, 0.52, 2.3, 32]} />
            <meshStandardMaterial color="#334155" metalness={0.7} />
          </mesh>
        </group>

        {/* 3. Steam Drum Vessel (Upper Main Drum) */}
        <group userData={{ compId: 'steam-drum' }} position={[-0.8, 1.2, 0]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'steam-drum')); }}>
          <mesh rotation={[0, 0, Math.PI / 2]} userData={{ defaultColor: '#0284c7' }}>
            <cylinderGeometry args={[0.68, 0.68, 2.5, 32]} />
            <meshStandardMaterial color="#0284c7" metalness={0.8} />
          </mesh>
        </group>

        {/* 4. Multi-Stage Feed Water Pump */}
        <group userData={{ compId: 'feed-pump' }} position={[0.8, -0.4, 0.8]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'feed-pump')); }}>
          <mesh userData={{ defaultColor: '#0f766e' }}>
            <cylinderGeometry args={[0.38, 0.38, 0.95, 24]} />
            <meshStandardMaterial color="#0f766e" metalness={0.8} />
          </mesh>
        </group>

        {/* 5. Safety Pressure Relief Valve */}
        <group userData={{ compId: 'safety-valve' }} position={[-0.8, 2.0, 0]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'safety-valve')); }}>
          <mesh userData={{ defaultColor: '#ef4444' }}>
            <cylinderGeometry args={[0.16, 0.16, 0.65, 16]} />
            <meshStandardMaterial color="#ef4444" metalness={0.9} />
          </mesh>
        </group>

        {/* 6. Dual Pressure & Temp Gauges */}
        <group userData={{ compId: 'pressure-gauge' }} position={[0.8, 1.2, 0.8]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'pressure-gauge')); }}>
          <mesh userData={{ defaultColor: '#cbd5e1' }}>
            <cylinderGeometry args={[0.2, 0.2, 0.1, 24]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
          </mesh>
        </group>

        {/* 7. Exhaust Flue Economizer */}
        <group userData={{ compId: 'economizer' }} position={[1.8, 1.6, -0.6]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'economizer')); }}>
          <mesh userData={{ defaultColor: '#475569' }}>
            <boxGeometry args={[0.95, 1.15, 0.85]} />
            <meshStandardMaterial color="#475569" roughness={0.4} />
          </mesh>
        </group>

        {/* 8. Tubular Heat Exchanger */}
        <group userData={{ compId: 'heat-exchanger' }} position={[2.2, 0.2, -0.6]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'heat-exchanger')); }}>
          <mesh rotation={[0, 0, Math.PI / 2]} userData={{ defaultColor: '#64748b' }}>
            <cylinderGeometry args={[0.42, 0.42, 1.3, 24]} />
            <meshStandardMaterial color="#64748b" metalness={0.8} />
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

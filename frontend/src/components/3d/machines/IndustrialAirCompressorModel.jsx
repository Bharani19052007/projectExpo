import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { HolographicTwinEngine } from '../hologram/HolographicTwinEngine';

export default function IndustrialAirCompressorModel({
  isHologram = false,
  viewMode = 'CAD',
  selectedComponent,
  setSelectedComponent,
  isSimulatingFailure = false,
  components = [],
}) {
  const groupRef = useRef(null);
  const fanRef = useRef(null);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    if (fanRef.current) {
      fanRef.current.rotation.z += delta * 9.0;
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
      {/* COMPRESSOR SKID BASE FRAME */}
      <group position={[0, -0.65, 0]}>
        <mesh position={[0, 0, 0]} userData={{ defaultColor: '#1e293b' }}>
          <boxGeometry args={[6.4, 0.15, 2.4]} />
          <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.8} />
        </mesh>
      </group>

      <group ref={groupRef}>
        {/* 1. 200kW Compressor Motor */}
        <group userData={{ compId: 'compressor-motor' }} position={[-2.2, 0.4, 0]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'compressor-motor')); }}>
          <mesh userData={{ defaultColor: '#1e3a8a' }}>
            <cylinderGeometry args={[0.62, 0.62, 1.5, 32]} rotation={[0, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#1e3a8a" roughness={0.3} metalness={0.8} />
          </mesh>
          {/* Terminal Box */}
          <mesh position={[0, 0.6, 0]} userData={{ defaultColor: '#1e293b' }}>
            <boxGeometry args={[0.4, 0.3, 0.4]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        </group>

        {/* 2. Forced Air Cooling Fan */}
        <group ref={fanRef} userData={{ compId: 'cooling-fan' }} position={[-1.0, 0.8, 0]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'cooling-fan')); }}>
          <mesh userData={{ defaultColor: '#0ea5e9' }}>
            <cylinderGeometry args={[0.45, 0.45, 0.15, 16]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color="#0ea5e9" metalness={0.9} />
          </mesh>
        </group>

        {/* 3. Heavy-Duty Air Filter */}
        <group userData={{ compId: 'air-filter' }} position={[-0.2, 1.2, 0]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'air-filter')); }}>
          <mesh userData={{ defaultColor: '#eab308' }}>
            <cylinderGeometry args={[0.38, 0.38, 0.75, 24]} />
            <meshStandardMaterial color="#eab308" roughness={0.5} />
          </mesh>
        </group>

        {/* 4. Oil Coalescing Separator */}
        <group userData={{ compId: 'oil-separator' }} position={[0.8, 0.4, 0]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'oil-separator')); }}>
          <mesh userData={{ defaultColor: '#475569' }}>
            <cylinderGeometry args={[0.48, 0.48, 1.2, 24]} />
            <meshStandardMaterial color="#475569" metalness={0.8} />
          </mesh>
        </group>

        {/* 5. Rotary Screw Element */}
        <group userData={{ compId: 'screw-element' }} position={[0, 0, 0]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'screw-element')); }}>
          <mesh userData={{ defaultColor: '#334155' }}>
            <boxGeometry args={[1.3, 0.85, 0.85]} />
            <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.7} />
          </mesh>
        </group>

        {/* 6. High-Pressure Receiver Tank */}
        <group userData={{ compId: 'pressure-tank' }} position={[2.0, 0, 0]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'pressure-tank')); }}>
          <mesh rotation={[0, 0, Math.PI / 2]} userData={{ defaultColor: '#0284c7' }}>
            <cylinderGeometry args={[0.75, 0.75, 1.9, 32]} />
            <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.6} />
          </mesh>
          {/* ASME Nameplate & Pressure Relief Valve */}
          <mesh position={[0, 0.8, 0]} userData={{ defaultColor: '#ef4444' }}>
            <cylinderGeometry args={[0.1, 0.1, 0.4, 16]} />
            <meshStandardMaterial color="#ef4444" metalness={0.9} />
          </mesh>
        </group>

        {/* 7. Heavy Thrust Bearings */}
        <group userData={{ compId: 'thrust-bearings' }} position={[0, -0.6, 0]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'thrust-bearings')); }}>
          <mesh userData={{ defaultColor: '#94a3b8' }}>
            <cylinderGeometry args={[0.28, 0.28, 0.35, 20]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} />
          </mesh>
        </group>

        {/* 8. Xe-Series Controller Cabinet */}
        <group userData={{ compId: 'control-cabinet-comp' }} position={[2.8, 0.4, 0.6]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'control-cabinet-comp')); }}>
          <mesh userData={{ defaultColor: '#1e293b' }}>
            <boxGeometry args={[0.65, 1.3, 0.55]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          <mesh position={[-0.33, 0.3, 0]} rotation={[0, -Math.PI / 2, 0]} userData={{ defaultColor: '#0284c7' }}>
            <planeGeometry args={[0.4, 0.3]} />
            <meshBasicMaterial color="#0284c7" />
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

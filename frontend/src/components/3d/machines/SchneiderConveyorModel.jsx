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
}) {
  const groupRef = useRef(null);
  const beltRef = useRef(null);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    if (beltRef.current) {
      beltRef.current.position.x = (time * 0.6) % 0.8 - 0.4;
    }

    if (!groupRef.current) return;

    groupRef.current.children.forEach((child) => {
      const compId = child.userData?.compId;
      if (!compId) return;

      const comp = components.find((c) => c.id === compId || compId.startsWith(c.id));
      if (!comp) return;

      const isSelected = selectedComponent && (selectedComponent.id === compId || compId.startsWith(selectedComponent.id));
      const targetPos = viewMode === 'EXPLODED' && comp.explodedOffset ? comp.explodedOffset : comp.position3d;

      child.position.x = THREE.MathUtils.lerp(child.position.x, targetPos[0], delta * 5);
      child.position.y = THREE.MathUtils.lerp(child.position.y, targetPos[1], delta * 5);
      child.position.z = THREE.MathUtils.lerp(child.position.z, targetPos[2], delta * 5);

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
      {/* STEEL CHASSIS SUPPORT FRAME */}
      <group position={[0, -0.6, 0]}>
        <mesh position={[0, 0, 0]} userData={{ defaultColor: '#0f766e' }}>
          <boxGeometry args={[5.6, 0.12, 1.4]} />
          <meshStandardMaterial color="#0f766e" roughness={0.3} metalness={0.7} />
        </mesh>
        {/* Support Legs */}
        {[-2.5, 0, 2.5].map((x, i) => (
          <mesh key={i} position={[x, -0.4, 0]} userData={{ defaultColor: '#334155' }}>
            <boxGeometry args={[0.15, 0.8, 1.2]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
        ))}
      </group>

      <group ref={groupRef}>
        {/* 1. High-Speed Sorting Belt */}
        <group userData={{ compId: 'sorting-belt' }} position={[0, 0, 0]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'sorting-belt')); }}>
          <mesh userData={{ defaultColor: '#1e293b' }}>
            <boxGeometry args={[5.2, 0.22, 1.1]} />
            <meshStandardMaterial color="#1e293b" roughness={0.6} />
          </mesh>
        </group>

        {/* 2. Pneumatic Diverter Arms */}
        <group userData={{ compId: 'diverter-arm' }} position={[1.2, 0.4, 0]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'diverter-arm')); }}>
          <mesh rotation={[0, Math.PI / 6, 0]} userData={{ defaultColor: '#eab308' }}>
            <boxGeometry args={[0.9, 0.28, 0.12]} />
            <meshStandardMaterial color="#eab308" metalness={0.7} />
          </mesh>
        </group>

        {/* 3. Photoelectric Sensor Array */}
        <group userData={{ compId: 'photoelectric-sensors' }} position={[-1.2, 0.4, 0.6]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'photoelectric-sensors')); }}>
          <mesh userData={{ defaultColor: '#0284c7' }}>
            <cylinderGeometry args={[0.08, 0.08, 0.55, 16]} />
            <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={0.6} />
          </mesh>
        </group>

        {/* 4. Variable Frequency Drive VFD */}
        <group userData={{ compId: 'vfd-drive' }} position={[2.2, 0.6, 0.8]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'vfd-drive')); }}>
          <mesh userData={{ defaultColor: '#1e293b' }}>
            <boxGeometry args={[0.55, 0.85, 0.45]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        </group>

        {/* 5. Vulcanized Drive Roller */}
        <group userData={{ compId: 'drive-roller' }} position={[-2.2, 0.2, 0]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'drive-roller')); }}>
          <mesh rotation={[Math.PI / 2, 0, 0]} userData={{ defaultColor: '#334155' }}>
            <cylinderGeometry args={[0.28, 0.28, 1.2, 24]} />
            <meshStandardMaterial color="#334155" roughness={0.3} />
          </mesh>
        </group>

        {/* 6. Sealed Roller Bearings */}
        <group userData={{ compId: 'roller-bearings' }} position={[-2.2, -0.4, 0]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'roller-bearings')); }}>
          <mesh userData={{ defaultColor: '#94a3b8' }}>
            <boxGeometry args={[0.35, 0.35, 0.35]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} />
          </mesh>
        </group>

        {/* 7. Package Barcode Scanner */}
        <group userData={{ compId: 'package-scanner' }} position={[0, 1.6, 0]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'package-scanner')); }}>
          <mesh userData={{ defaultColor: '#a855f7' }}>
            <boxGeometry args={[0.45, 0.35, 1.3]} />
            <meshStandardMaterial color="#a855f7" metalness={0.8} />
          </mesh>
        </group>

        {/* 8. Diverter Servo Motor */}
        <group userData={{ compId: 'diverter-motor' }} position={[1.8, 0.4, -0.6]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'diverter-motor')); }}>
          <mesh userData={{ defaultColor: '#0284c7' }}>
            <cylinderGeometry args={[0.22, 0.22, 0.65, 20]} rotation={[0, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#0284c7" metalness={0.8} />
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

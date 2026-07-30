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
}) {
  const groupRef = useRef(null);
  const spindleRef = useRef(null);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    if (spindleRef.current) {
      spindleRef.current.rotation.y += delta * 15.0;
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
      {/* CNC CAST IRON BASE BED */}
      <group position={[0, -0.65, 0]}>
        <mesh position={[0, 0, 0]} userData={{ defaultColor: '#1e293b' }}>
          <boxGeometry args={[5.5, 0.15, 2.5]} />
          <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.8} />
        </mesh>
      </group>

      <group ref={groupRef}>
        {/* 1. High-Speed 12,000 RPM Spindle */}
        <group ref={spindleRef} userData={{ compId: 'spindle-head' }} position={[0, 0.8, 0]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'spindle-head')); }}>
          <mesh userData={{ defaultColor: '#0284c7' }}>
            <cylinderGeometry args={[0.32, 0.26, 0.95, 24]} />
            <meshStandardMaterial color="#0284c7" roughness={0.2} metalness={0.9} />
          </mesh>
          {/* Carbide End Mill Tool Bit */}
          <mesh position={[0, -0.55, 0]} userData={{ defaultColor: '#f1f5f9' }}>
            <cylinderGeometry args={[0.06, 0.06, 0.25, 16]} />
            <meshStandardMaterial color="#f1f5f9" metalness={0.98} roughness={0.05} />
          </mesh>
        </group>

        {/* 2. 5-Axis Rotary Trunnion Table */}
        <group userData={{ compId: 'rotary-table' }} position={[0, -0.4, 0]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'rotary-table')); }}>
          <mesh userData={{ defaultColor: '#334155' }}>
            <cylinderGeometry args={[0.75, 0.75, 0.32, 32]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
        </group>

        {/* 3. 30-Tool Automatic Tool Changer */}
        <group userData={{ compId: 'tool-magazine' }} position={[-1.8, 0.8, 0]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'tool-magazine')); }}>
          <mesh rotation={[0, 0, Math.PI / 2]} userData={{ defaultColor: '#64748b' }}>
            <cylinderGeometry args={[0.75, 0.75, 0.45, 24]} />
            <meshStandardMaterial color="#64748b" metalness={0.7} />
          </mesh>
        </group>

        {/* 4. High-Pressure Coolant Flush Pump */}
        <group userData={{ compId: 'coolant-pump' }} position={[1.8, -0.4, 0.8]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'coolant-pump')); }}>
          <mesh userData={{ defaultColor: '#0ea5e9' }}>
            <cylinderGeometry args={[0.26, 0.26, 0.75, 20]} />
            <meshStandardMaterial color="#0ea5e9" metalness={0.8} />
          </mesh>
        </group>

        {/* 5. Linear Motion Guide Rails */}
        <group userData={{ compId: 'guide-rails' }} position={[0, 0, -0.8]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'guide-rails')); }}>
          {[-0.5, 0.5].map((x, i) => (
            <mesh key={i} position={[x, 0, 0]} userData={{ defaultColor: '#cbd5e1' }}>
              <boxGeometry args={[0.12, 0.12, 2.3]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.95} />
            </mesh>
          ))}
        </group>

        {/* 6. Automated Chip Conveyor */}
        <group userData={{ compId: 'chip-conveyor' }} position={[2.2, -0.8, 0]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'chip-conveyor')); }}>
          <mesh userData={{ defaultColor: '#1e293b' }}>
            <boxGeometry args={[1.7, 0.28, 0.65]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        </group>

        {/* 7. SINUMERIK CNC Touch Controller */}
        <group userData={{ compId: 'cnc-touch-panel' }} position={[2.2, 0.6, 1.0]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'cnc-touch-panel')); }}>
          <mesh userData={{ defaultColor: '#0284c7' }}>
            <boxGeometry args={[0.42, 0.65, 0.12]} rotation={[0, -0.3, 0]} />
            <meshStandardMaterial color="#0284c7" />
          </mesh>
          <mesh position={[-0.06, 0.05, 0.12]} rotation={[0, -0.3, 0]} userData={{ defaultColor: '#38bdf8' }}>
            <planeGeometry args={[0.3, 0.45]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
        </group>

        {/* 8. Enclosure Window Panel */}
        <group userData={{ compId: 'enclosure-door' }} position={[0, 0.4, 1.4]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'enclosure-door')); }}>
          <mesh userData={{ defaultColor: '#38bdf8' }}>
            <boxGeometry args={[2.2, 1.7, 0.05]} />
            <meshStandardMaterial color="#38bdf8" transparent={true} opacity={0.25} roughness={0.1} />
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

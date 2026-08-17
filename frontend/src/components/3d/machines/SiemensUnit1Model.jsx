import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { HolographicTwinEngine } from '../hologram/HolographicTwinEngine';

export default function SiemensUnit1Model({
  isHologram = false,
  viewMode = 'CAD',
  selectedComponent,
  setSelectedComponent,
  isSimulatingFailure = false,
  components = [],
}) {
  const groupRef = useRef(null);
  const rollersRef = useRef(null);
  const cutterRef = useRef(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();

    // Rotate chromium rollers
    if (rollersRef.current) {
      rollersRef.current.children.forEach((child) => {
        if (child.isMesh) {
          child.rotation.x += delta * 4.0;
        }
      });
    }

    // High-speed cutter rotation
    if (cutterRef.current) {
      cutterRef.current.rotation.z += delta * 6.0;
    }

    // Smooth exploded view translation and component highlight shaders
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
      {/* BASE INDUSTRIAL STEEL FRAME SKID */}
      <group position={[0, -0.65, 0]}>
        <mesh position={[0, 0, 0]} userData={{ defaultColor: '#00507a' }}>
          <boxGeometry args={[7.2, 0.15, 2.2]} />
          <meshStandardMaterial color="#00507a" roughness={0.3} metalness={0.7} />
        </mesh>
        {/* Safety Hazard Stripes along frame */}
        {[-3.4, 3.4].map((x, i) => (
          <mesh key={i} position={[x, 0.08, 0]} userData={{ defaultColor: '#eab308' }}>
            <boxGeometry args={[0.2, 0.02, 2.2]} />
            <meshStandardMaterial color="#eab308" roughness={0.4} />
          </mesh>
        ))}
      </group>

      {/* COMPONENT GROUP ASSEMBLY */}
      <group ref={groupRef}>
        
        {/* 1. Main Drive Motor */}
        <group userData={{ compId: 'main-drive-motor' }} position={[-2.2, 0.4, 0]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'main-drive-motor')); }}>
          {/* Cast Iron Stator Body with Ribbed Heatsink */}
          <mesh userData={{ defaultColor: '#00507a' }}>
            <cylinderGeometry args={[0.55, 0.55, 1.4, 32]} rotation={[0, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#00507a" roughness={0.3} metalness={0.8} />
          </mesh>
          {/* Cooling Fan Shroud */}
          <mesh position={[-0.8, 0, 0]} userData={{ defaultColor: '#1e293b' }}>
            <cylinderGeometry args={[0.58, 0.58, 0.3, 32]} rotation={[0, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Electrical Terminal Box */}
          <mesh position={[0, 0.55, 0]} userData={{ defaultColor: '#003d5c' }}>
            <boxGeometry args={[0.4, 0.3, 0.4]} />
            <meshStandardMaterial color="#003d5c" metalness={0.8} />
          </mesh>
          {/* Drive Shaft Coupling */}
          <mesh position={[0.8, 0, 0]} userData={{ defaultColor: '#cbd5e1' }}>
            <cylinderGeometry args={[0.18, 0.18, 0.3, 20]} rotation={[0, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
          </mesh>
        </group>

        {/* 2. Chrome Web Rollers */}
        <group ref={rollersRef} userData={{ compId: 'chrome-web-rollers' }} position={[-1.2, 0.4, 0]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'chrome-web-rollers')); }}>
          {[-0.6, -0.2, 0.2, 0.6].map((yOffset, i) => (
            <group key={i} position={[0, yOffset, 0]}>
              <mesh rotation={[Math.PI / 2, 0, 0]} userData={{ defaultColor: '#f1f5f9' }}>
                <cylinderGeometry args={[0.16, 0.16, 1.8, 32]} />
                <meshStandardMaterial color="#f1f5f9" metalness={0.98} roughness={0.05} />
              </mesh>
              {/* SKF Pillow Block Bearings on side caps */}
              {[-0.95, 0.95].map((z, j) => (
                <mesh key={j} position={[0, 0, z]} userData={{ defaultColor: '#334155' }}>
                  <boxGeometry args={[0.2, 0.2, 0.1]} />
                  <meshStandardMaterial color="#334155" metalness={0.8} />
                </mesh>
              ))}
            </group>
          ))}
        </group>

        {/* 3. Web Tension System */}
        <group userData={{ compId: 'web-tension-system' }} position={[-0.2, 1.2, 0]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'web-tension-system')); }}>
          <mesh userData={{ defaultColor: '#475569' }}>
            <boxGeometry args={[0.8, 0.4, 1.4]} />
            <meshStandardMaterial color="#475569" roughness={0.4} metalness={0.6} />
          </mesh>
          {/* Dual Pneumatic Air Cylinders */}
          {[-0.5, 0.5].map((z, i) => (
            <mesh key={i} position={[0, -0.3, z]} userData={{ defaultColor: '#0284c7' }}>
              <cylinderGeometry args={[0.08, 0.08, 0.5, 16]} />
              <meshStandardMaterial color="#0284c7" metalness={0.9} />
            </mesh>
          ))}
        </group>

        {/* 4. Servo Motors */}
        <group userData={{ compId: 'servo-motors' }} position={[0.8, 0, 0]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'servo-motors')); }}>
          <mesh userData={{ defaultColor: '#0284c7' }}>
            <cylinderGeometry args={[0.35, 0.35, 0.9, 24]} rotation={[0, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.8} />
          </mesh>
          <mesh position={[0.5, 0, 0]} userData={{ defaultColor: '#0f172a' }}>
            <boxGeometry args={[0.2, 0.4, 0.4]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
        </group>

        {/* 5. Helical Gearbox */}
        <group userData={{ compId: 'helical-gearbox' }} position={[1.8, 0, 0]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'helical-gearbox')); }}>
          <mesh userData={{ defaultColor: '#334155' }}>
            <boxGeometry args={[1.2, 1.0, 1.0]} />
            <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.7} />
          </mesh>
          {/* Oil Sight Glass & Filler Cap */}
          <mesh position={[0.61, 0.2, 0]} rotation={[0, Math.PI / 2, 0]} userData={{ defaultColor: '#38bdf8' }}>
            <cylinderGeometry args={[0.08, 0.08, 0.02, 16]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.1} />
          </mesh>
        </group>

        {/* 6. Rotary Web Cutter */}
        <group ref={cutterRef} userData={{ compId: 'rotary-cutter' }} position={[2.8, 0.4, 0]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'rotary-cutter')); }}>
          <mesh rotation={[Math.PI / 2, 0, 0]} userData={{ defaultColor: '#e2e8f0' }}>
            <cylinderGeometry args={[0.45, 0.45, 1.4, 32]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.98} roughness={0.1} />
          </mesh>
        </group>

        {/* 7. Electrical Cabinet */}
        <group userData={{ compId: 'electrical-cabinet' }} position={[3.8, 0.4, 0.8]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'electrical-cabinet')); }}>
          <mesh userData={{ defaultColor: '#64748b' }}>
            <boxGeometry args={[1.0, 1.8, 0.8]} />
            <meshStandardMaterial color="#64748b" roughness={0.5} />
          </mesh>
          {/* Touchscreen HMI Display */}
          <mesh position={[-0.51, 0.4, 0]} rotation={[0, -Math.PI / 2, 0]} userData={{ defaultColor: '#0284c7' }}>
            <planeGeometry args={[0.5, 0.4]} />
            <meshBasicMaterial color="#0284c7" />
          </mesh>
          {/* Stack Light Tower */}
          <group position={[0, 1.0, 0]}>
            <mesh position={[0, 0.1, 0]} userData={{ defaultColor: '#22c55e' }}>
              <cylinderGeometry args={[0.05, 0.05, 0.1, 16]} />
              <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.6} />
            </mesh>
            <mesh position={[0, 0.22, 0]} userData={{ defaultColor: '#eab308' }}>
              <cylinderGeometry args={[0.05, 0.05, 0.1, 16]} />
              <meshStandardMaterial color="#eab308" emissive="#eab308" emissiveIntensity={0.6} />
            </mesh>
          </group>
        </group>

      </group>

      {/* 8. HOLOGRAPHIC DIGITAL TWIN ENGINE OVERLAY (IF HOLOGRAM MODE ENABLED) */}
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

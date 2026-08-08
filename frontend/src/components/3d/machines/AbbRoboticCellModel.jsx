import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { HolographicTwinEngine } from '../hologram/HolographicTwinEngine';

export default function AbbRoboticCellModel({
  isHologram = false,
  viewMode = 'CAD',
  selectedComponent,
  setSelectedComponent,
  isSimulatingFailure = false,
  components = [],
}) {
  const groupRef = useRef(null);
  const robotGroupRef = useRef(null);
  const upperArmRef = useRef(null);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    if (robotGroupRef.current) {
      robotGroupRef.current.rotation.y = Math.sin(time * 0.9) * 0.45;
    }
    if (upperArmRef.current) {
      upperArmRef.current.rotation.z = Math.cos(time * 1.4) * 0.15;
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
      {/* HEAVY ROBOT BASE PEDESTAL */}
      <group position={[0, -0.65, 0]}>
        <mesh position={[0, 0, 0]} userData={{ defaultColor: '#1e293b' }}>
          <cylinderGeometry args={[0.85, 0.95, 0.3, 32]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.8} />
        </mesh>
      </group>

      <group ref={groupRef}>
        {/* 1. Base Swivel Spindle */}
        <group userData={{ compId: 'base-spindle' }} position={[0, -0.4, 0]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'base-spindle')); }}>
          <mesh userData={{ defaultColor: '#334155' }}>
            <cylinderGeometry args={[0.75, 0.8, 0.4, 32]} />
            <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.8} />
          </mesh>
        </group>

        {/* 2. 6-Axis ABB Heavy Payload Robot Arm (IRB 6700) */}
        <group ref={robotGroupRef} userData={{ compId: '6axis-robot-arm' }} position={[0, 0.6, 0]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === '6axis-robot-arm')); }}>
          
          {/* Axis 1 Base Turret */}
          <mesh position={[0, 0, 0]} userData={{ defaultColor: '#ff5500' }}>
            <cylinderGeometry args={[0.55, 0.55, 0.6, 24]} />
            <meshStandardMaterial color="#ff5500" roughness={0.3} metalness={0.5} />
          </mesh>

          {/* Axis 2 Lower Arm Link */}
          <mesh position={[0, 0.8, 0]} rotation={[0, 0, 0.2]} userData={{ defaultColor: '#ff5500' }}>
            <boxGeometry args={[0.4, 1.4, 0.4]} />
            <meshStandardMaterial color="#ff5500" roughness={0.3} metalness={0.5} />
          </mesh>

          {/* Counter-weight Hydraulic Cylinder */}
          <mesh position={[-0.35, 0.7, 0]} rotation={[0, 0, -0.2]} userData={{ defaultColor: '#1e293b' }}>
            <cylinderGeometry args={[0.12, 0.12, 1.1, 20]} />
            <meshStandardMaterial color="#1e293b" metalness={0.9} />
          </mesh>

          {/* Axis 3 Upper Arm Link */}
          <group ref={upperArmRef} position={[0.4, 1.5, 0]}>
            <mesh rotation={[0, 0, -0.4]} userData={{ defaultColor: '#ff5500' }}>
              <boxGeometry args={[0.35, 1.2, 0.35]} />
              <meshStandardMaterial color="#ff5500" roughness={0.3} metalness={0.5} />
            </mesh>

            {/* Axis 4/5/6 Spherical Wrist Joint */}
            <mesh position={[0.5, -0.4, 0]} userData={{ defaultColor: '#1e293b' }}>
              <sphereGeometry args={[0.24, 20, 20]} />
              <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>

        </group>

        {/* 3. End-Effector Tooling */}
        <group userData={{ compId: 'end-effector-tooling' }} position={[1.4, 1.2, 0]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'end-effector-tooling')); }}>
          <mesh userData={{ defaultColor: '#e2e8f0' }}>
            <boxGeometry args={[0.35, 0.35, 0.55]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.98} roughness={0.1} />
          </mesh>
          {/* Parallel Gripper Fingers */}
          {[-0.14, 0.14].map((z, i) => (
            <mesh key={i} position={[0.25, 0, z]} userData={{ defaultColor: '#0f766e' }}>
              <boxGeometry args={[0.2, 0.12, 0.06]} />
              <meshStandardMaterial color="#0f766e" metalness={0.8} />
            </mesh>
          ))}
        </group>

        {/* 4. Safety Light Curtain Grid */}
        <group userData={{ compId: 'safety-light-curtain' }} position={[-1.8, 0.8, 1.2]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'safety-light-curtain')); }}>
          <mesh userData={{ defaultColor: '#f59e0b' }}>
            <boxGeometry args={[0.1, 2.0, 0.1]} />
            <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.6} />
          </mesh>
          {/* Infrared Beam Lines */}
          {[-0.8, -0.4, 0, 0.4, 0.8].map((y, i) => (
            <mesh key={i} position={[1.8, y, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.01, 0.01, 3.6, 8]} />
              <meshBasicMaterial color="#ef4444" transparent={true} opacity={0.6} />
            </mesh>
          ))}
        </group>

        {/* 5. Teach Pendant */}
        <group userData={{ compId: 'teach-pendant' }} position={[2.2, 0.4, 1.0]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'teach-pendant')); }}>
          <mesh rotation={[0.4, 0, 0]} userData={{ defaultColor: '#1e293b' }}>
            <boxGeometry args={[0.4, 0.55, 0.1]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          <mesh position={[0, 0.42, 0.06]} rotation={[0.4, 0, 0]} userData={{ defaultColor: '#38bdf8' }}>
            <planeGeometry args={[0.3, 0.35]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
        </group>

        {/* 6. Pneumatic Valve Manifold */}
        <group userData={{ compId: 'pneumatic-valve-manifold' }} position={[1.2, 0.2, -0.6]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'pneumatic-valve-manifold')); }}>
          <mesh userData={{ defaultColor: '#64748b' }}>
            <boxGeometry args={[0.7, 0.35, 0.45]} />
            <meshStandardMaterial color="#64748b" metalness={0.8} />
          </mesh>
        </group>

        {/* 7. IRC5 Control Cabinet */}
        <group userData={{ compId: 'control-cabinet-irc5' }} position={[2.5, 0.6, 0]} onClick={(e) => { e.stopPropagation(); setSelectedComponent(components.find(c => c.id === 'control-cabinet-irc5')); }}>
          <mesh userData={{ defaultColor: '#334155' }}>
            <boxGeometry args={[1.0, 1.8, 0.9]} />
            <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.7} />
          </mesh>
          {/* Status Stack Light */}
          <mesh position={[0, 1.0, 0]} userData={{ defaultColor: '#22c55e' }}>
            <cylinderGeometry args={[0.06, 0.06, 0.25, 16]} />
            <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.8} />
          </mesh>
        </group>

      </group>

      {/* 8. HOLOGRAPHIC TWIN ENGINE OVERLAY */}
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

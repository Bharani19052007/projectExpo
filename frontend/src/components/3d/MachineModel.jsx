import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { industrialMachineComponentsData } from '../../data/mockData';

export default function MachineModel({
  viewMode = 'CAD',
  selectedComponent,
  setSelectedComponent,
}) {
  const groupRef = useRef(null);
  const beaconRef = useRef(null);

  // Micro animation frame loop for smooth transitions, exploded view lerp, highlighting, and mode colors
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const time = state.clock.getElapsedTime();

    // Subtle beacon light pulse
    if (beaconRef.current) {
      beaconRef.current.material.emissiveIntensity = 0.5 + Math.sin(time * 4) * 0.4;
    }

    // Traverse component mesh groups
    groupRef.current.children.forEach((child) => {
      const compId = child.userData?.compId;
      if (!compId) return;

      const comp = industrialMachineComponentsData.find((c) => c.id === compId);
      if (!comp) return;

      const isSelected = selectedComponent?.id === compId;

      // 1. Position Interpolation (Exploded View vs CAD View)
      const targetPos =
        viewMode === 'EXPLODED' && comp.explodedOffset
          ? comp.explodedOffset
          : comp.position3d;

      child.position.x = THREE.MathUtils.lerp(child.position.x, targetPos[0], delta * 4);
      child.position.y = THREE.MathUtils.lerp(child.position.y, targetPos[1], delta * 4);
      child.position.z = THREE.MathUtils.lerp(child.position.z, targetPos[2], delta * 4);

      // 2. Material Opacity & Highlight Handling
      child.traverse((mesh) => {
        if (mesh.isMesh && mesh.material) {
          mesh.material.transparent = true;

          // When a component is selected: ONLY selected component is 1.0 opacity & highlighted, others fade to 0.28
          if (selectedComponent) {
            if (isSelected) {
              mesh.material.opacity = THREE.MathUtils.lerp(mesh.material.opacity, 1.0, delta * 8);
              if (viewMode === 'CAD') {
                mesh.material.color.set('#0284c7'); // Vibrant cyan-blue highlight for selected part
              }
            } else {
              mesh.material.opacity = THREE.MathUtils.lerp(mesh.material.opacity, 0.28, delta * 8);
              if (viewMode === 'CAD' && mesh.userData?.defaultColor) {
                mesh.material.color.set(mesh.userData.defaultColor);
              }
            }
          } else {
            // Default clean view: all full opacity
            mesh.material.opacity = THREE.MathUtils.lerp(mesh.material.opacity, 1.0, delta * 8);

            // View Mode Coloring
            if (viewMode === 'THERMAL') {
              const tempColor =
                comp.temperature > 75
                  ? '#ef4444' // Red hot
                  : comp.temperature > 55
                  ? '#f59e0b' // Amber warm
                  : '#3b82f6'; // Blue cool
              mesh.material.color.set(tempColor);
            } else if (viewMode === 'VIBRATION') {
              const vibColor =
                comp.vibration > 4.0
                  ? '#ef4444' // Red high vibration
                  : comp.vibration > 2.0
                  ? '#f59e0b' // Amber warning
                  : '#10b981'; // Green normal
              mesh.material.color.set(vibColor);
            } else if (mesh.userData?.defaultColor) {
              mesh.material.color.set(mesh.userData.defaultColor);
            }
          }
        }
      });
    });
  });

  // Mesh Click Handler to select component
  const handleMeshClick = (e, compId) => {
    e.stopPropagation();
    const comp = industrialMachineComponentsData.find((c) => c.id === compId);
    if (comp) {
      setSelectedComponent(comp);
    }
  };

  return (
    <group ref={groupRef}>
      
      {/* 1. Base Pedestal & Anchor Assembly */}
      <group
        userData={{ compId: 'base-pedestal' }}
        onClick={(e) => handleMeshClick(e, 'base-pedestal')}
        position={[0, -1.2, 0]}
      >
        {/* Floor Anchor Plate */}
        <mesh castShadow receiveShadow position={[0, -0.15, 0]} userData={{ defaultColor: '#334155' }}>
          <boxGeometry args={[2.2, 0.1, 2.2]} />
          <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.8} />
        </mesh>
        {/* Main Heavy Base Cylinder */}
        <mesh castShadow receiveShadow position={[0, 0.15, 0]} userData={{ defaultColor: '#1e293b' }}>
          <cylinderGeometry args={[0.9, 1.0, 0.5, 32]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.7} />
        </mesh>
        {/* Anchor Bolt Caps */}
        {[-0.85, 0.85].map((x, i) =>
          [-0.85, 0.85].map((z, j) => (
            <mesh key={`bolt-${i}-${j}`} position={[x, -0.05, z]} userData={{ defaultColor: '#64748b' }}>
              <cylinderGeometry args={[0.07, 0.07, 0.15, 12]} />
              <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
            </mesh>
          ))
        )}
      </group>

      {/* 2. Axis 1 Swivel Turntable */}
      <group
        userData={{ compId: 'axis-1-turntable' }}
        onClick={(e) => handleMeshClick(e, 'axis-1-turntable')}
        position={[0, -0.6, 0]}
      >
        {/* Slewing Gear Ring */}
        <mesh castShadow receiveShadow position={[0, 0, 0]} userData={{ defaultColor: '#f97316' }}>
          <cylinderGeometry args={[0.82, 0.85, 0.35, 32]} />
          <meshStandardMaterial color="#f97316" roughness={0.3} metalness={0.5} />
        </mesh>
        {/* Swivel Center Hub */}
        <mesh castShadow receiveShadow position={[0, 0.2, 0]} userData={{ defaultColor: '#475569' }}>
          <cylinderGeometry args={[0.7, 0.7, 0.15, 32]} />
          <meshStandardMaterial color="#475569" roughness={0.2} metalness={0.8} />
        </mesh>
      </group>

      {/* 3. Axis 2 Shoulder Servo Drive */}
      <group
        userData={{ compId: 'axis-2-shoulder' }}
        onClick={(e) => handleMeshClick(e, 'axis-2-shoulder')}
        position={[0, 0.2, 0]}
      >
        {/* Shoulder Housing Fork */}
        <mesh castShadow receiveShadow position={[0, 0, 0]} userData={{ defaultColor: '#ea580c' }}>
          <boxGeometry args={[0.9, 0.9, 0.8]} />
          <meshStandardMaterial color="#ea580c" roughness={0.35} metalness={0.6} />
        </mesh>
        {/* Side Servo Drive Motor Drum */}
        <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 2]} position={[-0.55, 0, 0]} userData={{ defaultColor: '#0284c7' }}>
          <cylinderGeometry args={[0.35, 0.35, 0.45, 24]} />
          <meshStandardMaterial color="#0284c7" roughness={0.25} metalness={0.7} />
        </mesh>
      </group>

      {/* 4. Axis 3 Elbow Joint & Linkage */}
      <group
        userData={{ compId: 'axis-3-elbow' }}
        onClick={(e) => handleMeshClick(e, 'axis-3-elbow')}
        position={[0.5, 1.2, 0]}
      >
        {/* Main Lower Arm Beam */}
        <mesh castShadow receiveShadow rotation={[0, 0, -Math.PI / 6]} position={[-0.2, -0.4, 0]} userData={{ defaultColor: '#f97316' }}>
          <boxGeometry args={[0.4, 1.3, 0.5]} />
          <meshStandardMaterial color="#f97316" roughness={0.3} metalness={0.5} />
        </mesh>
        {/* Elbow Joint Pivot Ring */}
        <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]} position={[0.1, 0.2, 0]} userData={{ defaultColor: '#334155' }}>
          <cylinderGeometry args={[0.32, 0.32, 0.6, 24]} />
          <meshStandardMaterial color="#334155" roughness={0.2} metalness={0.8} />
        </mesh>
        {/* Hydraulic Counterbalance Cylinder */}
        <mesh castShadow receiveShadow rotation={[0, 0, -Math.PI / 4]} position={[-0.4, 0.1, 0.3]} userData={{ defaultColor: '#64748b' }}>
          <cylinderGeometry args={[0.12, 0.12, 1.0, 16]} />
          <meshStandardMaterial color="#64748b" roughness={0.15} metalness={0.9} />
        </mesh>
      </group>

      {/* 5. Axis 4 Forearm Rotary Drive */}
      <group
        userData={{ compId: 'axis-4-forearm' }}
        onClick={(e) => handleMeshClick(e, 'axis-4-forearm')}
        position={[1.4, 1.4, 0]}
      >
        {/* Upper Forearm Tube */}
        <mesh castShadow receiveShadow rotation={[0, 0, -Math.PI / 12]} position={[-0.4, 0, 0]} userData={{ defaultColor: '#ea580c' }}>
          <cylinderGeometry args={[0.26, 0.32, 1.2, 24]} />
          <meshStandardMaterial color="#ea580c" roughness={0.3} metalness={0.5} />
        </mesh>
        {/* Forearm Drive Gear Ring */}
        <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 2]} position={[0.2, 0, 0]} userData={{ defaultColor: '#0f172a' }}>
          <cylinderGeometry args={[0.28, 0.28, 0.25, 24]} />
          <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.8} />
        </mesh>
      </group>

      {/* 6. Axis 5 & 6 Wrist & Mounting Flange */}
      <group
        userData={{ compId: 'axis-5-6-wrist' }}
        onClick={(e) => handleMeshClick(e, 'axis-5-6-wrist')}
        position={[2.2, 1.2, 0]}
      >
        {/* Wrist Pitch Housing */}
        <mesh castShadow receiveShadow position={[-0.2, 0, 0]} userData={{ defaultColor: '#38bdf8' }}>
          <sphereGeometry args={[0.26, 24, 24]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.25} metalness={0.6} />
        </mesh>
        {/* Mounting Tool Flange Ring */}
        <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 2]} position={[0.1, 0, 0]} userData={{ defaultColor: '#94a3b8' }}>
          <cylinderGeometry args={[0.22, 0.22, 0.1, 24]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.1} metalness={0.95} />
        </mesh>
      </group>

      {/* 7. End-Effector Smart Gripper / Tool Head */}
      <group
        userData={{ compId: 'end-effector' }}
        onClick={(e) => handleMeshClick(e, 'end-effector')}
        position={[2.7, 1.0, 0]}
      >
        {/* Gripper Base Housing */}
        <mesh castShadow receiveShadow position={[-0.1, 0, 0]} userData={{ defaultColor: '#0284c7' }}>
          <boxGeometry args={[0.3, 0.35, 0.35]} />
          <meshStandardMaterial color="#0284c7" roughness={0.2} metalness={0.8} />
        </mesh>
        {/* Left Parallel Finger Jaw */}
        <mesh castShadow receiveShadow position={[0.15, 0.12, 0]} userData={{ defaultColor: '#f59e0b' }}>
          <boxGeometry args={[0.25, 0.08, 0.12]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.7} />
        </mesh>
        {/* Right Parallel Finger Jaw */}
        <mesh castShadow receiveShadow position={[0.15, -0.12, 0]} userData={{ defaultColor: '#f59e0b' }}>
          <boxGeometry args={[0.25, 0.08, 0.12]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.7} />
        </mesh>
        {/* Laser Sensor Lens */}
        <mesh position={[0.06, 0, 0]} userData={{ defaultColor: '#ef4444' }}>
          <cylinderGeometry args={[0.04, 0.04, 0.02, 12]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.6} />
        </mesh>
      </group>

      {/* 8. Hydraulic Auxiliary Power Unit */}
      <group
        userData={{ compId: 'hydraulic-pack' }}
        onClick={(e) => handleMeshClick(e, 'hydraulic-pack')}
        position={[-1.8, -0.6, -1.2]}
      >
        {/* Fluid Reservoir Tank */}
        <mesh castShadow receiveShadow position={[0, 0, 0]} userData={{ defaultColor: '#475569' }}>
          <boxGeometry args={[0.9, 1.0, 0.8]} />
          <meshStandardMaterial color="#475569" roughness={0.4} metalness={0.6} />
        </mesh>
        {/* High-Pressure Pump Motor */}
        <mesh castShadow receiveShadow position={[0, 0.65, 0]} userData={{ defaultColor: '#0284c7' }}>
          <cylinderGeometry args={[0.25, 0.25, 0.35, 20]} />
          <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.7} />
        </mesh>
        {/* Pressure Valve Manifold Block */}
        <mesh castShadow receiveShadow position={[0.3, 0.2, 0.3]} userData={{ defaultColor: '#94a3b8' }}>
          <boxGeometry args={[0.25, 0.35, 0.25]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.15} />
        </mesh>
      </group>

      {/* 9. Main PLC & Servo Drive Control Unit */}
      <group
        userData={{ compId: 'control-cabinet' }}
        onClick={(e) => handleMeshClick(e, 'control-cabinet')}
        position={[-1.8, 0.4, 1.2]}
      >
        {/* Control Cabinet Box */}
        <mesh castShadow receiveShadow position={[0, 0, 0]} userData={{ defaultColor: '#f8fafc' }}>
          <boxGeometry args={[0.8, 1.6, 0.9]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.2} metalness={0.3} />
        </mesh>
        {/* Cabinet Door Recess Handle */}
        <mesh position={[0.41, 0, 0]} userData={{ defaultColor: '#0f172a' }}>
          <boxGeometry args={[0.02, 1.4, 0.75]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} />
        </mesh>
        {/* Profinet Communication Status LEDs */}
        <mesh position={[0.42, 0.5, 0.2]} userData={{ defaultColor: '#10b981' }}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.8} />
        </mesh>
      </group>

      {/* 10. Thermal Liquid Cooling Station */}
      <group
        userData={{ compId: 'cooling-unit' }}
        onClick={(e) => handleMeshClick(e, 'cooling-unit')}
        position={[1.8, -0.6, -1.2]}
      >
        {/* Chiller Housing */}
        <mesh castShadow receiveShadow position={[0, 0, 0]} userData={{ defaultColor: '#0284c7' }}>
          <boxGeometry args={[0.9, 0.9, 0.7]} />
          <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.6} />
        </mesh>
        {/* Radiator Fan Grille Mesh */}
        <mesh position={[0, 0, 0.36]} userData={{ defaultColor: '#1e293b' }}>
          <cylinderGeometry args={[0.3, 0.3, 0.02, 24]} />
          <meshStandardMaterial color="#1e293b" roughness={0.5} />
        </mesh>
      </group>

      {/* 11. Safety Beacon Tower & Signal Light */}
      <group
        userData={{ compId: 'safety-beacon' }}
        onClick={(e) => handleMeshClick(e, 'safety-beacon')}
        position={[-1.8, 1.6, 1.2]}
      >
        {/* Support Pole */}
        <mesh castShadow position={[0, -0.2, 0]} userData={{ defaultColor: '#64748b' }}>
          <cylinderGeometry args={[0.03, 0.03, 0.4, 12]} />
          <meshStandardMaterial color="#64748b" metalness={0.9} />
        </mesh>
        {/* Green Stage Light */}
        <mesh position={[0, 0.05, 0]} userData={{ defaultColor: '#10b981' }}>
          <cylinderGeometry args={[0.08, 0.08, 0.08, 16]} />
          <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.3} />
        </mesh>
        {/* Amber Warning Stage Light */}
        <mesh ref={beaconRef} position={[0, 0.15, 0]} userData={{ defaultColor: '#f59e0b' }}>
          <cylinderGeometry args={[0.08, 0.08, 0.08, 16]} />
          <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.8} />
        </mesh>
        {/* Red Alarm Stage Light */}
        <mesh position={[0, 0.25, 0]} userData={{ defaultColor: '#ef4444' }}>
          <cylinderGeometry args={[0.08, 0.08, 0.08, 16]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.3} />
        </mesh>
      </group>

      {/* Render pin marker ONLY for the currently selected component */}
      {selectedComponent && selectedComponent.position3d && (
        <Html
          position={selectedComponent.position3d}
          center
          distanceFactor={8}
          zIndexRange={[100, 0]}
        >
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 text-white border border-cyan-400 text-xs font-mono font-bold shadow-xl backdrop-blur-md animate-bounce">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="truncate max-w-[160px]">{selectedComponent.name}</span>
          </div>
        </Html>
      )}

    </group>
  );
}

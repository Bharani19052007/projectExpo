import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { turbineComponentsData } from '../../data/mockData';

export default function TurbineModel({
  isHologram = false,
  viewMode = 'CAD',
  selectedComponent,
  setSelectedComponent,
  isSimulatingFailure = false,
}) {
  const groupRef = useRef(null);
  const rotorRef = useRef(null);

  // Micro animation loop for rotor rotation, smooth exploded lerp, material opacity & highlight state
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const time = state.clock.getElapsedTime();

    // Rotate internal rotor assembly (rotor shaft, compressor impellers, turbine disc, coupling)
    if (rotorRef.current) {
      rotorRef.current.rotation.x = time * 2.5;
    }

    // Traverse component sub-groups
    groupRef.current.children.forEach((child) => {
      const compId = child.userData?.compId;
      if (!compId) return;

      const comp = turbineComponentsData.find((c) => c.id === compId);
      if (!comp) return;

      const isSelected = selectedComponent?.id === compId;
      const isFailedComp = isSimulatingFailure && (isSelected || comp.id === 'main-bearings' || comp.id === 'turbine-stage');

      // 1. Position Interpolation (Exploded View vs CAD View)
      const targetPos =
        viewMode === 'EXPLODED' && comp.explodedOffset
          ? comp.explodedOffset
          : comp.position3d;

      child.position.x = THREE.MathUtils.lerp(child.position.x, targetPos[0], delta * 4);
      child.position.y = THREE.MathUtils.lerp(child.position.y, targetPos[1], delta * 4);
      child.position.z = THREE.MathUtils.lerp(child.position.z, targetPos[2], delta * 4);

      // 2. Material Logic for Real Machine vs Holographic Digital Twin
      child.traverse((mesh) => {
        if (mesh.isMesh && mesh.material) {
          mesh.material.transparent = true;

          if (isHologram) {
            // HOLOGRAPHIC BLUE DIGITAL TWIN MATERIAL
            mesh.material.wireframe = true;
            if (isFailedComp) {
              mesh.material.color.set('#ff2222');
              mesh.material.emissive.set('#ef4444');
              mesh.material.emissiveIntensity = 0.8 + Math.sin(time * 6) * 0.4;
              mesh.material.opacity = 0.85;
            } else if (selectedComponent) {
              if (isSelected) {
                mesh.material.color.set('#00ffff');
                mesh.material.emissive.set('#00f0ff');
                mesh.material.emissiveIntensity = 0.9;
                mesh.material.opacity = 0.9;
              } else {
                mesh.material.color.set('#00bfff');
                mesh.material.emissive.set('#006699');
                mesh.material.emissiveIntensity = 0.2;
                mesh.material.opacity = 0.22;
              }
            } else {
              mesh.material.color.set('#00f0ff');
              mesh.material.emissive.set('#00a3e0');
              mesh.material.emissiveIntensity = 0.4 + Math.sin(time * 2 + child.position.x) * 0.15;
              mesh.material.opacity = 0.45;
            }
          } else {
            // PHYSICAL REAL MACHINE MATERIAL
            mesh.material.wireframe = false;

            if (selectedComponent) {
              if (isSelected) {
                mesh.material.opacity = THREE.MathUtils.lerp(mesh.material.opacity, 1.0, delta * 8);
                if (isFailedComp) {
                  mesh.material.color.set('#ef4444');
                  mesh.material.emissive.set('#dc2626');
                  mesh.material.emissiveIntensity = 0.7 + Math.sin(time * 6) * 0.3;
                } else if (viewMode === 'CAD') {
                  mesh.material.color.set('#0284c7'); // Vibrant cyan highlight for selected part
                  mesh.material.emissive.set('#0369a1');
                  mesh.material.emissiveIntensity = 0.4;
                }
              } else {
                mesh.material.opacity = THREE.MathUtils.lerp(mesh.material.opacity, 0.25, delta * 8);
                mesh.material.emissiveIntensity = 0;
                if (viewMode === 'CAD' && mesh.userData?.defaultColor) {
                  mesh.material.color.set(mesh.userData.defaultColor);
                }
              }
            } else {
              // Default view
              mesh.material.opacity = THREE.MathUtils.lerp(mesh.material.opacity, 1.0, delta * 8);

              if (isFailedComp) {
                mesh.material.color.set('#ef4444');
                mesh.material.emissive.set('#b91c1c');
                mesh.material.emissiveIntensity = 0.6 + Math.sin(time * 6) * 0.4;
              } else if (viewMode === 'THERMAL') {
                const temp = isFailedComp ? 98 : comp.temperature;
                const tempColor =
                  temp > 75
                    ? '#ef4444' // Red hot
                    : temp > 55
                    ? '#f59e0b' // Amber warm
                    : '#3b82f6'; // Blue cool
                mesh.material.color.set(tempColor);
                mesh.material.emissiveIntensity = 0;
              } else if (viewMode === 'VIBRATION') {
                const vib = isFailedComp ? 8.5 : comp.vibration;
                const vibColor =
                  vib > 4.0
                    ? '#ef4444'
                    : vib > 2.0
                    ? '#f59e0b'
                    : '#10b981';
                mesh.material.color.set(vibColor);
                mesh.material.emissiveIntensity = 0;
              } else if (mesh.userData?.defaultColor) {
                mesh.material.color.set(mesh.userData.defaultColor);
                mesh.material.emissiveIntensity = 0;
              }
            }
          }
        }
      });
    });
  });

  const handleMeshClick = (e, compId) => {
    e.stopPropagation();
    const comp = turbineComponentsData.find((c) => c.id === compId);
    if (comp) {
      setSelectedComponent(comp);
    }
  };

  return (
    <group ref={groupRef}>
      
      {/* Structural Support Base Frame (Skid Rail) */}
      <mesh receiveShadow position={[0, -0.9, 0]} userData={{ defaultColor: '#1e293b' }}>
        <boxGeometry args={[6.8, 0.15, 2.4]} />
        <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.7} />
      </mesh>
      {[-3.0, -1.5, 0, 1.5, 3.0].map((x, i) => (
        <mesh key={`skid-cross-${i}`} position={[x, -0.8, 0]} userData={{ defaultColor: '#334155' }}>
          <boxGeometry args={[0.2, 0.1, 2.5]} />
          <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.8} />
        </mesh>
      ))}

      {/* ROTATING ROTOR SHAFT ASSEMBLY GROUP */}
      <group ref={rotorRef} position={[0, 0, 0]}>
        
        {/* 4. Rotor Shaft */}
        <group
          userData={{ compId: 'rotor-shaft' }}
          onClick={(e) => handleMeshClick(e, 'rotor-shaft')}
          position={[0, 0, 0]}
        >
          {/* Main Central Shaft Tube */}
          <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0]} userData={{ defaultColor: '#cbd5e1' }}>
            <cylinderGeometry args={[0.18, 0.18, 5.8, 32]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.15} metalness={0.95} />
          </mesh>
          {/* Shaft Keyway Notches & Step Shoulders */}
          {[-1.5, 0, 1.0, 2.2].map((x, i) => (
            <mesh key={`shaft-step-${i}`} rotation={[0, 0, Math.PI / 2]} position={[x, 0, 0]} userData={{ defaultColor: '#94a3b8' }}>
              <cylinderGeometry args={[0.24, 0.24, 0.2, 24]} />
              <meshStandardMaterial color="#94a3b8" roughness={0.1} metalness={0.9} />
            </mesh>
          ))}
        </group>

        {/* 1. Compressor Stage 1 (LP Axial Blades & Inlet Cone) */}
        <group
          userData={{ compId: 'compressor-stage-1' }}
          onClick={(e) => handleMeshClick(e, 'compressor-stage-1')}
          position={[-2.0, 0, 0]}
        >
          {/* Aerodynamic Nose Cone */}
          <mesh castShadow receiveShadow rotation={[0, 0, -Math.PI / 2]} position={[-0.45, 0, 0]} userData={{ defaultColor: '#38bdf8' }}>
            <coneGeometry args={[0.42, 0.5, 24]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.2} metalness={0.8} />
          </mesh>
          {/* Impeller Disc 1 */}
          <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0]} userData={{ defaultColor: '#0284c7' }}>
            <cylinderGeometry args={[0.75, 0.8, 0.3, 32]} />
            <meshStandardMaterial color="#0284c7" roughness={0.25} metalness={0.8} />
          </mesh>
          {/* Titanium Rotor Blades */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            return (
              <mesh
                key={`blade-1-${i}`}
                rotation={[angle, 0, 0]}
                position={[0, Math.sin(angle) * 0.55, Math.cos(angle) * 0.55]}
                userData={{ defaultColor: '#e2e8f0' }}
              >
                <boxGeometry args={[0.15, 0.45, 0.04]} />
                <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.1} />
              </mesh>
            );
          })}
        </group>

        {/* 2. Compressor Stage 2 (HP Centrifugal Impeller Wheel) */}
        <group
          userData={{ compId: 'compressor-stage-2' }}
          onClick={(e) => handleMeshClick(e, 'compressor-stage-2')}
          position={[-1.0, 0, 0]}
        >
          {/* Centrifugal Impeller Backplate */}
          <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0]} userData={{ defaultColor: '#0284c7' }}>
            <cylinderGeometry args={[0.9, 0.95, 0.35, 32]} />
            <meshStandardMaterial color="#0284c7" roughness={0.2} metalness={0.8} />
          </mesh>
          {/* Curved Curved Vane Blades */}
          {Array.from({ length: 14 }).map((_, i) => {
            const angle = (i / 14) * Math.PI * 2;
            return (
              <mesh
                key={`blade-2-${i}`}
                rotation={[angle, Math.PI / 6, 0]}
                position={[0.05, Math.sin(angle) * 0.65, Math.cos(angle) * 0.65]}
                userData={{ defaultColor: '#94a3b8' }}
              >
                <boxGeometry args={[0.18, 0.5, 0.05]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.15} />
              </mesh>
            );
          })}
        </group>

        {/* 3. Turbine Stage (High-Temp Single-Crystal Disc) */}
        <group
          userData={{ compId: 'turbine-stage' }}
          onClick={(e) => handleMeshClick(e, 'turbine-stage')}
          position={[1.0, 0, 0]}
        >
          {/* Turbine Rotor Disc */}
          <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0]} userData={{ defaultColor: '#ea580c' }}>
            <cylinderGeometry args={[0.85, 0.85, 0.4, 32]} />
            <meshStandardMaterial color="#ea580c" roughness={0.3} metalness={0.7} />
          </mesh>
          {/* High-Temp Superalloy Blades */}
          {Array.from({ length: 16 }).map((_, i) => {
            const angle = (i / 16) * Math.PI * 2;
            return (
              <mesh
                key={`turb-blade-${i}`}
                rotation={[angle, -Math.PI / 4, 0]}
                position={[0, Math.sin(angle) * 0.65, Math.cos(angle) * 0.65]}
                userData={{ defaultColor: '#f97316' }}
              >
                <boxGeometry args={[0.22, 0.4, 0.06]} />
                <meshStandardMaterial color="#f97316" metalness={0.8} roughness={0.2} />
              </mesh>
            );
          })}
        </group>

        {/* 8. Coupling (Flexible Diaphragm Pack) */}
        <group
          userData={{ compId: 'coupling' }}
          onClick={(e) => handleMeshClick(e, 'coupling')}
          position={[3.0, 0, 0]}
        >
          {/* Coupling Hub Flange */}
          <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0]} userData={{ defaultColor: '#475569' }}>
            <cylinderGeometry args={[0.42, 0.42, 0.3, 24]} />
            <meshStandardMaterial color="#475569" roughness={0.2} metalness={0.9} />
          </mesh>
          {/* Diaphragm Flexible Plates */}
          {[-0.1, 0.1].map((x, i) => (
            <mesh key={`diaphragm-${i}`} rotation={[0, 0, Math.PI / 2]} position={[x, 0, 0]} userData={{ defaultColor: '#cbd5e1' }}>
              <cylinderGeometry args={[0.45, 0.45, 0.04, 24]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
            </mesh>
          ))}
        </group>

      </group>

      {/* STATIC CASINGS, BEARINGS & AUXILIARY SUBSYSTEMS */}

      {/* 5. Main Bearings (Hydrodynamic Tilting-Pad Pedestals) */}
      <group
        userData={{ compId: 'main-bearings' }}
        onClick={(e) => handleMeshClick(e, 'main-bearings')}
        position={[-1.5, 0, 0]}
      >
        {/* Drive-End Bearing Block */}
        <mesh castShadow receiveShadow position={[0, -0.2, 0]} userData={{ defaultColor: '#334155' }}>
          <boxGeometry args={[0.6, 1.2, 1.0]} />
          <meshStandardMaterial color="#334155" roughness={0.35} metalness={0.7} />
        </mesh>
        {/* Bearing Housing Cap */}
        <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 2]} position={[0, 0.4, 0]} userData={{ defaultColor: '#0284c7' }}>
          <cylinderGeometry args={[0.45, 0.45, 0.58, 24]} />
          <meshStandardMaterial color="#0284c7" roughness={0.25} metalness={0.8} />
        </mesh>
      </group>

      {/* 6. Cooling System (Closed-Loop Steam/Air Manifold) */}
      <group
        userData={{ compId: 'cooling-system' }}
        onClick={(e) => handleMeshClick(e, 'cooling-system')}
        position={[0.5, 0.8, 0]}
      >
        {/* Cooling Pipe Ring Header */}
        <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0]} userData={{ defaultColor: '#b45309' }}>
          <torusGeometry args={[0.9, 0.08, 16, 32]} />
          <meshStandardMaterial color="#b45309" roughness={0.2} metalness={0.9} />
        </mesh>
        {/* Air Exchanger Feed Pipes */}
        {[-0.6, 0.6].map((z, i) => (
          <mesh key={`cool-pipe-${i}`} position={[0, -0.3, z]} userData={{ defaultColor: '#d97706' }}>
            <cylinderGeometry args={[0.06, 0.06, 0.8, 16]} />
            <meshStandardMaterial color="#d97706" metalness={0.9} roughness={0.15} />
          </mesh>
        ))}
      </group>

      {/* 7. Gearbox (Speed Reduction Planetary Transmission) */}
      <group
        userData={{ compId: 'gearbox' }}
        onClick={(e) => handleMeshClick(e, 'gearbox')}
        position={[2.2, 0, 0]}
      >
        {/* Gearbox Casing */}
        <mesh castShadow receiveShadow position={[0, -0.1, 0]} userData={{ defaultColor: '#1e293b' }}>
          <boxGeometry args={[0.9, 1.4, 1.2]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.6} />
        </mesh>
        {/* Inspection Cover Plate */}
        <mesh position={[0, 0.61, 0]} userData={{ defaultColor: '#0284c7' }}>
          <boxGeometry args={[0.7, 0.02, 0.9]} />
          <meshStandardMaterial color="#0284c7" roughness={0.2} metalness={0.7} />
        </mesh>
      </group>

      {/* 9. Lubrication Unit (Skid Oil Station & Reservoir) */}
      <group
        userData={{ compId: 'lubrication-unit' }}
        onClick={(e) => handleMeshClick(e, 'lubrication-unit')}
        position={[0, -1.2, -1.2]}
      >
        {/* Oil Reservoir Tank */}
        <mesh castShadow receiveShadow position={[0, 0.3, 0]} userData={{ defaultColor: '#475569' }}>
          <boxGeometry args={[1.6, 0.6, 0.9]} />
          <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.6} />
        </mesh>
        {/* Lube Oil Pump Motor */}
        <mesh castShadow receiveShadow position={[-0.5, 0.7, 0]} userData={{ defaultColor: '#0284c7' }}>
          <cylinderGeometry args={[0.22, 0.22, 0.35, 20]} />
          <meshStandardMaterial color="#0284c7" roughness={0.25} metalness={0.8} />
        </mesh>
        {/* Duplex Filter Block */}
        <mesh castShadow receiveShadow position={[0.5, 0.7, 0]} userData={{ defaultColor: '#94a3b8' }}>
          <cylinderGeometry args={[0.18, 0.18, 0.4, 20]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      {/* 10. Sensor Module (Bently Nevada Proximity Rack & Keyphasor) */}
      <group
        userData={{ compId: 'sensor-module' }}
        onClick={(e) => handleMeshClick(e, 'sensor-module')}
        position={[-1.5, 0.8, 0.8]}
      >
        {/* Sensor Junction Box */}
        <mesh castShadow receiveShadow position={[0, 0, 0]} userData={{ defaultColor: '#f8fafc' }}>
          <boxGeometry args={[0.4, 0.5, 0.3]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.2} metalness={0.4} />
        </mesh>
        {/* Proximity Probe Cables */}
        <mesh position={[0, -0.3, -0.3]} userData={{ defaultColor: '#0f172a' }}>
          <cylinderGeometry args={[0.02, 0.02, 0.6, 12]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} />
        </mesh>
      </group>

      {/* 11. Control Unit (Woodward TMR Governor Cabinet) */}
      <group
        userData={{ compId: 'control-unit' }}
        onClick={(e) => handleMeshClick(e, 'control-unit')}
        position={[1.5, 0.8, 1.2]}
      >
        {/* Governor Cabinet Box */}
        <mesh castShadow receiveShadow position={[0, 0, 0]} userData={{ defaultColor: '#334155' }}>
          <boxGeometry args={[0.7, 1.2, 0.6]} />
          <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.5} />
        </mesh>
        {/* Digital Status Screen LED Panel */}
        <mesh position={[0, 0.3, 0.31]} userData={{ defaultColor: '#38bdf8' }}>
          <boxGeometry args={[0.4, 0.25, 0.02]} />
          <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.6} />
        </mesh>
      </group>

      {/* Pin Marker on Selected Component */}
      {selectedComponent && selectedComponent.position3d && (
        <Html
          position={selectedComponent.position3d}
          center
          distanceFactor={8}
          zIndexRange={[100, 0]}
        >
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-white border text-xs font-mono font-bold shadow-xl backdrop-blur-md animate-bounce ${
            isSimulatingFailure
              ? 'bg-red-900/90 border-red-400'
              : 'bg-slate-900/90 border-cyan-400'
          }`}>
            <span className={`w-2 h-2 rounded-full animate-ping ${isSimulatingFailure ? 'bg-red-400' : 'bg-cyan-400'}`} />
            <span className="truncate max-w-[160px]">{selectedComponent.name}</span>
          </div>
        </Html>
      )}

    </group>
  );
}

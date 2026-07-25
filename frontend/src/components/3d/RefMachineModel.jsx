import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { refMachineComponentsData } from '../../data/mockData';

export default function RefMachineModel({
  isHologram = false,
  viewMode = 'CAD',
  selectedComponent,
  setSelectedComponent,
  isSimulatingFailure = false,
}) {
  const groupRef = useRef(null);
  const rollersRef = useRef(null);

  // Micro animation loop for roller rotation, smooth exploded lerp, material opacity & highlight state
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const time = state.clock.getElapsedTime();

    // Rotate internal roller assembly
    if (rollersRef.current) {
      rollersRef.current.children.forEach((child) => {
        if (child.isMesh) {
          child.rotation.z = time * 2.0;
        }
      });
    }

    // Traverse component sub-groups
    groupRef.current.children.forEach((child) => {
      const compId = child.userData?.compId;
      if (!compId) return;

      const comp = refMachineComponentsData.find((c) => c.id === compId || compId.startsWith(c.id));
      if (!comp) return;

      const isSelected = selectedComponent && (selectedComponent.id === compId || compId.startsWith(selectedComponent.id));
      const isFailedComp = isSimulatingFailure && (isSelected || compId.includes('front') || compId.includes('bearing'));

      // 1. Position Interpolation (Exploded View vs CAD View)
      const targetPos =
        viewMode === 'EXPLODED' && comp.explodedOffset
          ? comp.explodedOffset
          : comp.position3d;

      child.position.x = THREE.MathUtils.lerp(child.position.x, targetPos[0], delta * 5);
      child.position.y = THREE.MathUtils.lerp(child.position.y, targetPos[1], delta * 5);
      child.position.z = THREE.MathUtils.lerp(child.position.z, targetPos[2], delta * 5);

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
              mesh.material.emissiveIntensity = 0.9;
              mesh.material.opacity = 0.9;
            } else if (selectedComponent) {
              if (isSelected) {
                mesh.material.color.set('#00ffff');
                mesh.material.emissive.set('#00f0ff');
                mesh.material.emissiveIntensity = 1.0;
                mesh.material.opacity = 0.95;
              } else {
                mesh.material.color.set('#00bfff');
                mesh.material.emissive.set('#006699');
                mesh.material.emissiveIntensity = 0.25;
                mesh.material.opacity = 0.25;
              }
            } else {
              mesh.material.color.set('#00f0ff');
              mesh.material.emissive.set('#00a3e0');
              mesh.material.emissiveIntensity = 0.5 + Math.sin(time * 2 + child.position.x) * 0.15;
              mesh.material.opacity = 0.55;
            }
          } else {
            // PHYSICAL REAL MACHINE MATERIAL (Siemens Blue, Brushed Steel, Chrome)
            mesh.material.wireframe = false;

            if (selectedComponent) {
              if (isSelected) {
                mesh.material.opacity = THREE.MathUtils.lerp(mesh.material.opacity, 1.0, delta * 8);
                if (isFailedComp) {
                  mesh.material.color.set('#ef4444');
                  mesh.material.emissive.set('#dc2626');
                  mesh.material.emissiveIntensity = 0.8;
                } else if (viewMode === 'CAD') {
                  mesh.material.color.set('#0284c7'); // Vibrant cyan highlight for selected part
                  mesh.material.emissive.set('#0369a1');
                  mesh.material.emissiveIntensity = 0.5;
                }
              } else {
                mesh.material.opacity = THREE.MathUtils.lerp(mesh.material.opacity, 0.3, delta * 8);
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
                mesh.material.emissiveIntensity = 0.7;
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
    const comp = refMachineComponentsData.find((c) => c.id === compId);
    if (comp) {
      setSelectedComponent(comp);
    }
  };

  return (
    <group ref={groupRef}>
      
      {/* Base Foundation Platform Frame */}
      <mesh receiveShadow position={[0, -0.9, 0]} userData={{ defaultColor: '#334155' }}>
        <boxGeometry args={[6.4, 0.15, 2.6]} />
        <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.8} />
      </mesh>
      {[-2.8, -1.4, 0, 1.4, 2.8].map((x, i) => (
        <mesh key={`skid-${i}`} position={[x, -0.8, 0]} userData={{ defaultColor: '#1e293b' }}>
          <boxGeometry args={[0.22, 0.1, 2.7]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.7} />
        </mesh>
      ))}

      {/* 12. CONTROL CABINET (Siemens Industrial Blue Enclosure & HMI Console) */}
      <group
        userData={{ compId: 'control-cabinet' }}
        onClick={(e) => handleMeshClick(e, 'control-cabinet')}
        position={[2.2, 0.4, 1.0]}
      >
        {/* Main Siemens Blue Unit 1 Enclosure */}
        <mesh castShadow receiveShadow position={[0, 0, 0]} userData={{ defaultColor: '#0284c7' }}>
          <boxGeometry args={[1.0, 2.4, 1.1]} />
          <meshStandardMaterial color="#0284c7" roughness={0.25} metalness={0.5} />
        </mesh>
        
        {/* White Unit 1 Label Board */}
        <mesh position={[0.51, 0.8, -0.1]} userData={{ defaultColor: '#f8fafc' }}>
          <boxGeometry args={[0.02, 0.4, 0.6]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.2} />
        </mesh>

        {/* HMI Operator Console Arm & Swivel Bracket */}
        <mesh castShadow position={[-0.2, 0.6, 0.65]} userData={{ defaultColor: '#64748b' }}>
          <cylinderGeometry args={[0.04, 0.04, 0.6, 16]} />
          <meshStandardMaterial color="#64748b" metalness={0.9} />
        </mesh>
        
        {/* Siemens SIMATIC HMI Touchscreen Screen Frame */}
        <mesh castShadow position={[-0.35, 0.8, 0.85]} userData={{ defaultColor: '#0f172a' }}>
          <boxGeometry args={[0.1, 0.45, 0.65]} />
          <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.8} />
        </mesh>

        {/* HMI Screen Display Surface */}
        <mesh position={[-0.41, 0.82, 0.85]} userData={{ defaultColor: '#38bdf8' }}>
          <boxGeometry args={[0.02, 0.32, 0.48]} />
          <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.8} />
        </mesh>

        {/* Yellow E-Stop Safety Button */}
        <mesh position={[-0.41, 0.65, 1.1]} userData={{ defaultColor: '#eab308' }}>
          <cylinderGeometry args={[0.03, 0.03, 0.04, 16]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#eab308" emissive="#eab308" emissiveIntensity={0.5} />
        </mesh>

        {/* E-Stop Knob Red Head */}
        <mesh position={[-0.44, 0.65, 1.1]} userData={{ defaultColor: '#ef4444' }}>
          <cylinderGeometry args={[0.02, 0.02, 0.03, 16]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.6} />
        </mesh>
      </group>

      {/* 3. TURBINE ROTOR (Multi-Roller Overhead Web Assembly) */}
      <group
        userData={{ compId: 'turbine-rotor' }}
        onClick={(e) => handleMeshClick(e, 'turbine-rotor')}
        position={[-0.2, 1.2, 0]}
      >
        {/* Overhead Steel Support Structure Rails */}
        <mesh castShadow receiveShadow position={[0, 0.8, 0]} userData={{ defaultColor: '#64748b' }}>
          <boxGeometry args={[3.8, 0.1, 1.4]} />
          <meshStandardMaterial color="#64748b" roughness={0.2} metalness={0.9} />
        </mesh>
        
        {/* 6 Precision Ground Chrome Cylinder Rollers */}
        <group ref={rollersRef}>
          {[-1.5, -0.9, -0.3, 0.3, 0.9, 1.5].map((x, i) => (
            <mesh key={`roller-${i}`} castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]} position={[x, 0.4, 0]} userData={{ defaultColor: '#f1f5f9' }}>
              <cylinderGeometry args={[0.24, 0.24, 1.2, 32]} />
              <meshStandardMaterial color="#f1f5f9" metalness={0.95} roughness={0.08} />
            </mesh>
          ))}
        </group>

        {/* Continuous Web / Film Path Ribbon Overhead */}
        <mesh position={[0, 0.52, 0]} userData={{ defaultColor: '#38bdf8' }}>
          <boxGeometry args={[3.6, 0.02, 1.0]} />
          <meshStandardMaterial color="#38bdf8" transparent opacity={0.7} emissive="#0284c7" emissiveIntensity={0.3} />
        </mesh>
      </group>

      {/* 10. HYDRAULIC SYSTEM (Foreground Pump & Valve Manifold Unit with Dual Gauges) */}
      <group
        userData={{ compId: 'hydraulic-system' }}
        onClick={(e) => handleMeshClick(e, 'hydraulic-system')}
        position={[-1.2, -1.0, 1.0]}
      >
        {/* Hydraulic Base Block */}
        <mesh castShadow receiveShadow position={[0, 0, 0]} userData={{ defaultColor: '#475569' }}>
          <boxGeometry args={[1.2, 0.45, 0.7]} />
          <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.7} />
        </mesh>

        {/* Dual Round Analogue Pressure Dial Gauges */}
        {[-0.3, 0.3].map((x, i) => (
          <group key={`gauge-${i}`} position={[x, 0.35, 0.25]}>
            <mesh userData={{ defaultColor: '#f8fafc' }}>
              <cylinderGeometry args={[0.1, 0.1, 0.04, 24]} rotation={[Math.PI / 2, 0, 0]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.1} metalness={0.9} />
            </mesh>
            <mesh position={[0, 0, 0.03]} userData={{ defaultColor: '#ef4444' }}>
              <boxGeometry args={[0.01, 0.08, 0.01]} />
              <meshStandardMaterial color="#ef4444" />
            </mesh>
          </group>
        ))}

        {/* Control Valves & Piping */}
        <mesh castShadow position={[0, 0.35, -0.1]} userData={{ defaultColor: '#0284c7' }}>
          <cylinderGeometry args={[0.08, 0.08, 0.3, 16]} />
          <meshStandardMaterial color="#0284c7" roughness={0.2} metalness={0.8} />
        </mesh>
      </group>

      {/* 1. COMPRESSOR STAGE 1 (Main Web Intake Assembly) */}
      <group
        userData={{ compId: 'compressor-stage-1' }}
        onClick={(e) => handleMeshClick(e, 'compressor-stage-1')}
        position={[-2.2, 0.4, 0]}
      >
        <mesh castShadow receiveShadow position={[0, 0, 0]} userData={{ defaultColor: '#0284c7' }}>
          <boxGeometry args={[0.9, 1.4, 1.2]} />
          <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.6} />
        </mesh>
        <mesh castShadow position={[0, 0.8, 0]} userData={{ defaultColor: '#f1f5f9' }}>
          <cylinderGeometry args={[0.3, 0.3, 0.3, 24]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color="#f1f5f9" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      {/* 2. COMPRESSOR STAGE 2 (High-Pressure Roller Drive) */}
      <group
        userData={{ compId: 'compressor-stage-2' }}
        onClick={(e) => handleMeshClick(e, 'compressor-stage-2')}
        position={[-1.2, 0.4, 0]}
      >
        <mesh castShadow receiveShadow position={[0, 0, 0]} userData={{ defaultColor: '#334155' }}>
          <boxGeometry args={[0.8, 1.4, 1.1]} />
          <meshStandardMaterial color="#334155" roughness={0.35} metalness={0.7} />
        </mesh>
      </group>

      {/* 4. MAIN SHAFT (Central Drive Line) */}
      <group
        userData={{ compId: 'main-shaft' }}
        onClick={(e) => handleMeshClick(e, 'main-shaft')}
        position={[0, 0, 0]}
      >
        <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0]} userData={{ defaultColor: '#cbd5e1' }}>
          <cylinderGeometry args={[0.18, 0.18, 4.8, 32]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.12} metalness={0.95} />
        </mesh>
      </group>

      {/* 5. FRONT BEARING (Drive-End Support Bearing) */}
      <group
        userData={{ compId: 'front-bearing' }}
        onClick={(e) => handleMeshClick(e, 'front-bearing')}
        position={[-1.5, 0, 0]}
      >
        <mesh castShadow receiveShadow position={[0, -0.1, 0]} userData={{ defaultColor: '#0284c7' }}>
          <boxGeometry args={[0.5, 0.8, 0.8]} />
          <meshStandardMaterial color="#0284c7" roughness={0.25} metalness={0.8} />
        </mesh>
      </group>

      {/* 6. REAR BEARING (Non-Drive Support Bearing) */}
      <group
        userData={{ compId: 'rear-bearing' }}
        onClick={(e) => handleMeshClick(e, 'rear-bearing')}
        position={[1.2, 0, 0]}
      >
        <mesh castShadow receiveShadow position={[0, -0.1, 0]} userData={{ defaultColor: '#0284c7' }}>
          <boxGeometry args={[0.5, 0.8, 0.8]} />
          <meshStandardMaterial color="#0284c7" roughness={0.25} metalness={0.8} />
        </mesh>
      </group>

      {/* 7. GEARBOX (Speed Reduction Helical Transmission) */}
      <group
        userData={{ compId: 'gearbox' }}
        onClick={(e) => handleMeshClick(e, 'gearbox')}
        position={[1.8, 0, 0]}
      >
        <mesh castShadow receiveShadow position={[0, 0, 0]} userData={{ defaultColor: '#1e293b' }}>
          <boxGeometry args={[0.8, 1.2, 1.0]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.6} />
        </mesh>
      </group>

      {/* 8. COOLING FAN (Radiator Module Shroud) */}
      <group
        userData={{ compId: 'cooling-fan' }}
        onClick={(e) => handleMeshClick(e, 'cooling-fan')}
        position={[0.8, 0.8, 0]}
      >
        <mesh castShadow receiveShadow position={[0, 0, 0]} userData={{ defaultColor: '#0284c7' }}>
          <boxGeometry args={[0.6, 0.6, 0.6]} />
          <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.7} />
        </mesh>
        <mesh position={[0, 0, 0.31]} userData={{ defaultColor: '#0f172a' }}>
          <cylinderGeometry args={[0.22, 0.22, 0.02, 24]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
      </group>

      {/* 9. LUBRICATION UNIT (Central Greasing Station) */}
      <group
        userData={{ compId: 'lubrication-unit' }}
        onClick={(e) => handleMeshClick(e, 'lubrication-unit')}
        position={[0, -1.2, -1.0]}
      >
        <mesh castShadow receiveShadow position={[0, 0.3, 0]} userData={{ defaultColor: '#475569' }}>
          <boxGeometry args={[1.2, 0.5, 0.7]} />
          <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.6} />
        </mesh>
      </group>

      {/* 11. SENSOR MODULE (Laser Web Tension & Vibration Instrumentation) */}
      <group
        userData={{ compId: 'sensor-module' }}
        onClick={(e) => handleMeshClick(e, 'sensor-module')}
        position={[-1.2, 1.2, 0.8]}
      >
        <mesh castShadow receiveShadow position={[0, 0, 0]} userData={{ defaultColor: '#f8fafc' }}>
          <boxGeometry args={[0.35, 0.4, 0.3]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.2} metalness={0.4} />
        </mesh>
      </group>

      {/* FLOATING BINARY DATA MATRIX STREAM OVERLAY FOR HOLOGRAPHIC TWIN */}
      {isHologram && (
        <group position={[0, 0, 0]}>
          <Html position={[-1.5, 1.8, 0]} center distanceFactor={10}>
            <div className="font-mono text-cyan-400 font-bold text-[10px] tracking-widest bg-cyan-950/70 p-2 rounded border border-cyan-500/50 backdrop-blur-sm pointer-events-none select-none opacity-90 animate-pulse shadow-lg">
              <div>1 0 1 0 1 1 0 0 1 1</div>
              <div>0 0 1 0 0 1 0 1 1 0</div>
              <div>1 1 0 0 1 0 1 0 0 1</div>
            </div>
          </Html>

          <Html position={[1.5, 1.5, 0.8]} center distanceFactor={10}>
            <div className="font-mono text-cyan-300 font-bold text-[10px] tracking-widest bg-cyan-950/70 p-2 rounded border border-cyan-500/50 backdrop-blur-sm pointer-events-none select-none opacity-90 shadow-lg">
              <div>DIGITAL TWIN NODE</div>
              <div>WEB SPEED: 1450 RPM</div>
              <div>TENSION: 210 BAR</div>
            </div>
          </Html>
        </group>
      )}

    </group>
  );
}

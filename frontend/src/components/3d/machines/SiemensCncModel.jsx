import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function SiemensCncModel({
  isHologram = false,
  viewMode = 'CAD',
  selectedComponent,
  setSelectedComponent,
  isSimulatingFailure = false,
  components = [],
  telemetry = null,
}) {
  const groupRef = useRef(null);
  const spindleRef = useRef(null);
  const zAxisRef = useRef(null);
  const tableRef = useRef(null);
  const atcRef = useRef(null);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const rpm = telemetry?.speedRpm || 1250;
    const speedFactor = (rpm / 1250) * 12.0;

    // High-Speed Spindle Rotation
    if (spindleRef.current) {
      spindleRef.current.rotation.y += delta * speedFactor;
    }

    // Z-Axis Machining Feed Motion
    if (zAxisRef.current) {
      zAxisRef.current.position.y = 0.8 + Math.sin(time * 2.5) * 0.08;
    }

    // Rotary Table Motion
    if (tableRef.current) {
      tableRef.current.rotation.y = Math.sin(time * 1.2) * 0.25;
    }

    // Tool Changer Drum Slow Motion
    if (atcRef.current) {
      atcRef.current.rotation.z = time * 0.2;
    }

    if (!groupRef.current) return;

    groupRef.current.children.forEach((child) => {
      const compId = child.userData?.compId;
      if (!compId) return;

      const comp = components.find((c) => c.id === compId || compId.startsWith(c.id) || c.id.includes(compId));
      const isSelected = selectedComponent && (selectedComponent.id === compId || compId.startsWith(selectedComponent.id) || selectedComponent.id.includes(compId));

      if (comp) {
        const targetPos = viewMode === 'EXPLODED' && Array.isArray(comp.explodedOffset) ? comp.explodedOffset : comp.position3d;
        if (targetPos && Array.isArray(targetPos) && targetPos.length >= 3) {
          child.position.x = THREE.MathUtils.lerp(child.position.x, targetPos[0], delta * 5);
          child.position.y = THREE.MathUtils.lerp(child.position.y, targetPos[1], delta * 5);
          child.position.z = THREE.MathUtils.lerp(child.position.z, targetPos[2], delta * 5);
        }
      }

      child.traverse((mesh) => {
        if (mesh.isMesh && mesh.material) {
          const defaultColor = mesh.userData?.defaultColor || '#64748b';

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
            mesh.material.transparent = mesh.userData?.isGlass ? true : (selectedComponent && !isSelected);

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
                mesh.material.opacity = mesh.userData?.isGlass ? 0.25 : 0.75;
                mesh.material.color.set(defaultColor);
                mesh.material.emissive.set('#000000');
                mesh.material.emissiveIntensity = 0;
              }
            } else {
              mesh.material.opacity = mesh.userData?.isGlass ? 0.35 : 1.0;
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
      {/* 1. HEAVY CAST-IRON MACHINE BASE & BED */}
      <group position={[0, -0.65, 0]}>
        <mesh position={[0, 0, 0]} userData={{ defaultColor: '#1e293b' }}>
          <boxGeometry args={[4.8, 0.25, 3.2]} />
          <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.8} />
        </mesh>
        {/* Leveling Feet */}
        {[-2.2, 2.2].map((x, i) =>
          [-1.4, 1.4].map((z, j) => (
            <mesh key={`foot-${i}-${j}`} position={[x, -0.18, z]} userData={{ defaultColor: '#475569' }}>
              <cylinderGeometry args={[0.15, 0.2, 0.12, 12]} />
              <meshStandardMaterial color="#475569" metalness={0.9} />
            </mesh>
          ))
        )}
      </group>

      <group ref={groupRef}>
        
        {/* 2. OPEN-FRAME INDUSTRIAL ENCLOSURE (DARK GRAPHITE & GLASS) */}
        <group 
          userData={{ compId: 'enclosure-door' }} 
          onClick={(e) => { 
            e.stopPropagation(); 
            setSelectedComponent(components.find(c => c.id === 'enclosure-door' || c.id.includes('enclosure')) || { id: 'enclosure-door', name: 'Enclosure Door & Interlock' }); 
          }}
        >
          {/* Back Wall (Dark Industrial Slate) */}
          <mesh position={[0, 1.2, -1.35]} userData={{ defaultColor: '#0f172a' }}>
            <boxGeometry args={[4.4, 2.4, 0.1]} />
            <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.6} />
          </mesh>
          {/* Left Side Panel */}
          <mesh position={[-2.15, 1.2, 0]} userData={{ defaultColor: '#1e293b' }}>
            <boxGeometry args={[0.1, 2.4, 2.6]} />
            <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.6} />
          </mesh>
          {/* Right Side Panel */}
          <mesh position={[2.15, 1.2, 0]} userData={{ defaultColor: '#1e293b' }}>
            <boxGeometry args={[0.1, 2.4, 2.6]} />
            <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.6} />
          </mesh>
          {/* Top Canopy & Light Bar */}
          <mesh position={[0, 2.35, 0]} userData={{ defaultColor: '#0284c7' }}>
            <boxGeometry args={[4.4, 0.1, 2.8]} />
            <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.5} />
          </mesh>
          {/* Front Clear Polycarbonate Glass Safety Door */}
          <mesh position={[0, 1.1, 1.35]} userData={{ defaultColor: '#38bdf8', isGlass: true }}>
            <boxGeometry args={[3.2, 1.8, 0.04]} />
            <meshStandardMaterial color="#38bdf8" transparent opacity={0.25} roughness={0.05} />
          </mesh>
          {/* Interior Coolant Chamber Lighting */}
          <pointLight position={[0, 1.8, 0]} color="#38bdf8" intensity={1.5} distance={5} />
        </group>

        {/* 3. ELECTRO-SPINDLE MOTOR & SPINDLE HEAD */}
        <group
          ref={zAxisRef}
          userData={{ compId: 'spindle-head' }}
          position={[0, 0.8, 0]}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedComponent(components.find(c => c.id === 'spindle-head' || c.id.includes('spindle')) || { id: 'spindle-head', name: 'High-Speed 12,000 RPM Spindle' });
          }}
        >
          {/* Spindle Housing Block */}
          <mesh userData={{ defaultColor: '#0284c7' }}>
            <boxGeometry args={[0.9, 1.1, 0.9]} />
            <meshStandardMaterial color="#0284c7" roughness={0.2} metalness={0.8} />
          </mesh>
          {/* Rotating Spindle Cartridge */}
          <group ref={spindleRef} position={[0, -0.65, 0]}>
            <mesh userData={{ defaultColor: '#cbd5e1' }}>
              <cylinderGeometry args={[0.22, 0.22, 0.5, 32]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
            </mesh>
            {/* HSK-A63 Tool Holder & Endmill */}
            <mesh position={[0, -0.35, 0]} userData={{ defaultColor: '#e2e8f0' }}>
              <cylinderGeometry args={[0.12, 0.05, 0.35, 24]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>
          {/* Dual Coolant Spray Nozzles */}
          {[-0.32, 0.32].map((x, i) => (
            <mesh key={i} position={[x, -0.5, 0.25]} rotation={[0.4, 0, x > 0 ? -0.3 : 0.3]} userData={{ defaultColor: '#f59e0b' }}>
              <cylinderGeometry args={[0.03, 0.03, 0.3, 12]} />
              <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.7} />
            </mesh>
          ))}
        </group>

        {/* 4. 5-AXIS ROTARY TRUNNION TABLE */}
        <group
          ref={tableRef}
          userData={{ compId: 'rotary-table' }}
          position={[0, -0.4, 0]}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedComponent(components.find(c => c.id === 'rotary-table' || c.id.includes('trunnion') || c.id.includes('table')) || { id: 'rotary-table', name: '5-Axis Rotary Trunnion Table' });
          }}
        >
          {/* Trunnion Support Bridge */}
          <mesh userData={{ defaultColor: '#334155' }}>
            <boxGeometry args={[2.4, 0.3, 1.4]} />
            <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.8} />
          </mesh>
          {/* Rotary Table Platter */}
          <mesh position={[0, 0.22, 0]} userData={{ defaultColor: '#94a3b8' }}>
            <cylinderGeometry args={[0.75, 0.75, 0.15, 36]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Clamped Machining Billet Aluminum Workpiece */}
          <mesh position={[0, 0.42, 0]} userData={{ defaultColor: '#38bdf8' }}>
            <boxGeometry args={[0.45, 0.25, 0.45]} />
            <meshStandardMaterial color="#38bdf8" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>

        {/* 5. 30-TOOL AUTOMATIC TOOL CHANGER (ATC) CAROUSEL */}
        <group
          userData={{ compId: 'tool-magazine' }}
          position={[-1.8, 0.8, 0]}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedComponent(components.find(c => c.id === 'tool-magazine' || c.id.includes('tool') || c.id.includes('atc')) || { id: 'tool-magazine', name: '30-Tool Automatic Tool Changer' });
          }}
        >
          {/* ATC Rotating Drum Carousel */}
          <group ref={atcRef} rotation={[0, 0, Math.PI / 2]}>
            <mesh userData={{ defaultColor: '#0f766e' }}>
              <cylinderGeometry args={[0.85, 0.85, 0.2, 32]} />
              <meshStandardMaterial color="#0f766e" roughness={0.3} metalness={0.7} />
            </mesh>
            {/* Tool Pockets around perimeter */}
            {Array.from({ length: 12 }).map((_, idx) => {
              const angle = (idx / 12) * Math.PI * 2;
              return (
                <mesh
                  key={idx}
                  position={[Math.cos(angle) * 0.72, Math.sin(angle) * 0.72, 0.15]}
                  userData={{ defaultColor: '#e2e8f0' }}
                >
                  <cylinderGeometry args={[0.05, 0.05, 0.2, 12]} />
                  <meshStandardMaterial color="#e2e8f0" metalness={0.9} />
                </mesh>
              );
            })}
          </group>
          {/* Twin-Arm Tool Gripper */}
          <mesh position={[0.6, -0.4, 0]} userData={{ defaultColor: '#f59e0b' }}>
            <boxGeometry args={[0.6, 0.12, 0.18]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.6} />
          </mesh>
        </group>

        {/* 6. HIGH-PRESSURE COOLANT PUMP & TANK */}
        <group
          userData={{ compId: 'coolant-pump' }}
          position={[1.8, -0.4, 0.8]}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedComponent(components.find(c => c.id === 'coolant-pump' || c.id.includes('coolant')) || { id: 'coolant-pump', name: 'High-Pressure Coolant Flush Pump' });
          }}
        >
          {/* Coolant Filtration Tank */}
          <mesh userData={{ defaultColor: '#0284c7' }}>
            <boxGeometry args={[0.9, 0.6, 0.9]} />
            <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.6} />
          </mesh>
          {/* High-Pressure 70-Bar Multi-Stage Pump Motor */}
          <mesh position={[0, 0.5, 0]} userData={{ defaultColor: '#0369a1' }}>
            <cylinderGeometry args={[0.18, 0.18, 0.5, 24]} />
            <meshStandardMaterial color="#0369a1" roughness={0.2} metalness={0.8} />
          </mesh>
        </group>

        {/* 7. LINEAR MOTION ROLLER GUIDE RAILS */}
        <group
          userData={{ compId: 'guide-rails' }}
          position={[0, 0, -0.8]}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedComponent(components.find(c => c.id === 'guide-rails' || c.id.includes('guide')) || { id: 'guide-rails', name: 'Linear Motion Guide Rails' });
          }}
        >
          {[-0.8, 0.8].map((x, i) => (
            <mesh key={i} position={[x, 0.8, 0]} userData={{ defaultColor: '#e2e8f0' }}>
              <boxGeometry args={[0.08, 2.0, 0.06]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.05} />
            </mesh>
          ))}
          {/* Roller Carriage Blocks */}
          {[-0.8, 0.8].map((x, i) => (
            <mesh key={`block-${i}`} position={[x, 0.8, 0.05]} userData={{ defaultColor: '#0284c7' }}>
              <boxGeometry args={[0.18, 0.35, 0.12]} />
              <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.8} />
            </mesh>
          ))}
        </group>

        {/* 8. AUTOMATED CHIP CONVEYOR */}
        <group
          userData={{ compId: 'chip-conveyor' }}
          position={[1.8, -0.5, -0.8]}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedComponent(components.find(c => c.id === 'chip-conveyor' || c.id.includes('chip')) || { id: 'chip-conveyor', name: 'Automated Chip Conveyor' });
          }}
        >
          {/* Inclined Chute */}
          <mesh position={[0, 0.3, 0]} rotation={[0, 0, -0.35]} userData={{ defaultColor: '#334155' }}>
            <boxGeometry args={[1.4, 0.25, 0.5]} />
            <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.7} />
          </mesh>
        </group>

        {/* 9. SINUMERIK CNC TOUCH OPERATOR CONSOLE */}
        <group
          userData={{ compId: 'cnc-controller' }}
          position={[2.4, 1.2, 1.0]}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedComponent(components.find(c => c.id === 'cnc-controller' || c.id.includes('controller') || c.id.includes('hmi')) || { id: 'cnc-controller', name: 'SINUMERIK CNC Touch Controller' });
          }}
        >
          {/* Articulated Pendant Arm */}
          <mesh position={[-0.25, 0, 0]} rotation={[0, 0, Math.PI / 2]} userData={{ defaultColor: '#475569' }}>
            <cylinderGeometry args={[0.06, 0.06, 0.5, 16]} />
            <meshStandardMaterial color="#475569" metalness={0.8} />
          </mesh>
          {/* 19" Operator Touch Panel Housing */}
          <mesh userData={{ defaultColor: '#0f172a' }}>
            <boxGeometry args={[0.1, 0.9, 0.7]} />
            <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.7} />
          </mesh>
          {/* Glowing CNC Interface Display Screen */}
          <mesh position={[0.06, 0, 0]} userData={{ defaultColor: '#0284c7' }}>
            <boxGeometry args={[0.01, 0.75, 0.55]} />
            <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={0.6} />
          </mesh>
        </group>

      </group>
    </group>
  );
}

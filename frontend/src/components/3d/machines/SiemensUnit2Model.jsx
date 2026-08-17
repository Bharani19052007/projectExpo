import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function SiemensUnit2Model({
  isHologram = false,
  viewMode = 'CAD',
  selectedComponent,
  setSelectedComponent,
  isSimulatingFailure = false,
  components = [],
}) {
  const groupRef = useRef(null);
  const armRef = useRef(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();

    // Packaging arm vertical pick & place sweep motion
    if (armRef.current) {
      armRef.current.position.y = 0.8 + Math.sin(time * 2.5) * 0.18;
      armRef.current.rotation.y = Math.cos(time * 1.5) * 0.25;
    }

    groupRef.current.children.forEach((child) => {
      const compId = child.userData?.compId;
      if (!compId) return;

      const comp = components.find((c) => c.id === compId || compId.startsWith(c.id));
      const isSelected = selectedComponent && (selectedComponent.id === compId || compId.startsWith(selectedComponent.id));
      
      // Interpolate exploded offsets smoothly
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
      {/* BASE ALUMINUM EXTRUSION CHASSIS SKID */}
      <group position={[0, -0.6, 0]}>
        <mesh position={[0, 0, 0]} userData={{ defaultColor: '#64748b' }}>
          <boxGeometry args={[6.8, 0.12, 2.0]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.3} />
        </mesh>
        {[-3.2, 0, 3.2].map((x, i) => (
          <mesh key={i} position={[x, -0.2, 0]} userData={{ defaultColor: '#334155' }}>
            <cylinderGeometry args={[0.08, 0.08, 0.35, 16]} />
            <meshStandardMaterial color="#334155" metalness={0.9} />
          </mesh>
        ))}
      </group>

      <group ref={groupRef}>
        
        {/* 1. High-Speed Belt Conveyor */}
        <group 
          userData={{ compId: 'conveyor-belt' }} 
          position={[-2.5, 0.2, 0]} 
          onClick={(e) => { 
            e.stopPropagation(); 
            setSelectedComponent(components.find(c => c.id === 'conveyor-belt') || { id: 'conveyor-belt', name: 'High-Speed Belt Conveyor' }); 
          }}
        >
          {/* Main Conveyor Belt Bed */}
          <mesh userData={{ defaultColor: '#475569' }}>
            <boxGeometry args={[2.8, 0.25, 0.9]} />
            <meshStandardMaterial color="#475569" roughness={0.6} />
          </mesh>
          {/* Conveyor Rubber Top Surface */}
          <mesh position={[0, 0.13, 0]} userData={{ defaultColor: '#0284c7' }}>
            <boxGeometry args={[2.75, 0.02, 0.85]} />
            <meshStandardMaterial color="#0284c7" roughness={0.4} metalness={0.2} />
          </mesh>
          {/* Stainless Guide Rails */}
          {[-0.42, 0.42].map((z, i) => (
            <mesh key={i} position={[0, 0.2, z]} userData={{ defaultColor: '#cbd5e1' }}>
              <boxGeometry args={[2.8, 0.1, 0.04]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.95} />
            </mesh>
          ))}
          {/* Drive Rollers on ends */}
          {[-1.3, 1.3].map((x, i) => (
            <mesh key={i} position={[x, 0, 0]} rotation={[Math.PI / 2, 0, 0]} userData={{ defaultColor: '#94a3b8' }}>
              <cylinderGeometry args={[0.15, 0.15, 0.92, 24]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.8} />
            </mesh>
          ))}
        </group>

        {/* 2. Robotic Packaging Arm */}
        <group 
          ref={armRef} 
          userData={{ compId: 'packaging-arm' }} 
          position={[-1.2, 0.8, 0]} 
          onClick={(e) => { 
            e.stopPropagation(); 
            setSelectedComponent(components.find(c => c.id === 'packaging-arm') || { id: 'packaging-arm', name: 'Robotic Packaging Arm' }); 
          }}
        >
          {/* Vertical Post */}
          <mesh userData={{ defaultColor: '#0284c7' }}>
            <cylinderGeometry args={[0.22, 0.22, 1.0, 24]} />
            <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.7} />
          </mesh>
          {/* Horizontal Extension Arm */}
          <mesh position={[0.4, 0.4, 0]} userData={{ defaultColor: '#0369a1' }}>
            <boxGeometry args={[0.9, 0.2, 0.2]} />
            <meshStandardMaterial color="#0369a1" roughness={0.3} metalness={0.8} />
          </mesh>
          {/* Vacuum Suction Cup End-Effector */}
          <mesh position={[0.8, 0.1, 0]} userData={{ defaultColor: '#f59e0b' }}>
            <cylinderGeometry args={[0.12, 0.08, 0.2, 16]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.2} />
          </mesh>
        </group>

        {/* 3. Automated Carton Loader */}
        <group 
          userData={{ compId: 'carton-loader' }} 
          position={[0, 0.4, 0]} 
          onClick={(e) => { 
            e.stopPropagation(); 
            setSelectedComponent(components.find(c => c.id === 'carton-loader') || { id: 'carton-loader', name: 'Automated Carton Loader' }); 
          }}
        >
          <mesh userData={{ defaultColor: '#d97706' }}>
            <boxGeometry args={[1.0, 0.9, 1.0]} />
            <meshStandardMaterial color="#d97706" roughness={0.6} />
          </mesh>
          {/* Cardboard Box Stack Mock */}
          <mesh position={[0, 0.5, 0]} userData={{ defaultColor: '#b45309' }}>
            <boxGeometry args={[0.8, 0.4, 0.8]} />
            <meshStandardMaterial color="#b45309" roughness={0.8} />
          </mesh>
        </group>

        {/* 4. Multi-Axis Servo Drive */}
        <group 
          userData={{ compId: 'servo-axis' }} 
          position={[1.2, 0, 0]} 
          onClick={(e) => { 
            e.stopPropagation(); 
            setSelectedComponent(components.find(c => c.id === 'servo-axis') || { id: 'servo-axis', name: 'Multi-Axis Servo Drive' }); 
          }}
        >
          <mesh userData={{ defaultColor: '#0f766e' }}>
            <cylinderGeometry args={[0.35, 0.35, 0.9, 24]} rotation={[0, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#0f766e" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>

        {/* 5. Pneumatic Cylinder Pusher */}
        <group 
          userData={{ compId: 'pneumatic-cylinder' }} 
          position={[2.0, 0.4, 0]} 
          onClick={(e) => { 
            e.stopPropagation(); 
            setSelectedComponent(components.find(c => c.id === 'pneumatic-cylinder') || { id: 'pneumatic-cylinder', name: 'Pneumatic Cylinder Pusher' }); 
          }}
        >
          <mesh userData={{ defaultColor: '#e2e8f0' }}>
            <cylinderGeometry args={[0.12, 0.12, 1.0, 20]} rotation={[0, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.1} />
          </mesh>
        </group>

        {/* 6. Vision Inspection Camera */}
        <group 
          userData={{ compId: 'vision-camera' }} 
          position={[0, 1.6, 0.8]} 
          onClick={(e) => { 
            e.stopPropagation(); 
            setSelectedComponent(components.find(c => c.id === 'vision-camera') || { id: 'vision-camera', name: 'Vision Inspection Camera' }); 
          }}
        >
          <mesh userData={{ defaultColor: '#38bdf8' }}>
            <boxGeometry args={[0.3, 0.3, 0.4]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.2} metalness={0.8} />
          </mesh>
          <mesh position={[0, -0.16, 0]} rotation={[Math.PI / 2, 0, 0]} userData={{ defaultColor: '#ffffff' }}>
            <cylinderGeometry args={[0.08, 0.08, 0.05, 16]} />
            <meshStandardMaterial color="#ffffff" emissive="#38bdf8" emissiveIntensity={0.6} />
          </mesh>
        </group>

        {/* 7. Barcode & QR Scanner */}
        <group 
          userData={{ compId: 'barcode-scanner' }} 
          position={[-1.8, 1.2, 0.6]} 
          onClick={(e) => { 
            e.stopPropagation(); 
            setSelectedComponent(components.find(c => c.id === 'barcode-scanner') || { id: 'barcode-scanner', name: 'Barcode & QR Scanner' }); 
          }}
        >
          <mesh userData={{ defaultColor: '#a855f7' }}>
            <boxGeometry args={[0.25, 0.25, 0.3]} />
            <meshStandardMaterial color="#a855f7" metalness={0.8} />
          </mesh>
        </group>

        {/* 8. Heat Sealing Unit */}
        <group 
          userData={{ compId: 'sealing-unit' }} 
          position={[3.0, 0.4, 0]} 
          onClick={(e) => { 
            e.stopPropagation(); 
            setSelectedComponent(components.find(c => c.id === 'sealing-unit') || { id: 'sealing-unit', name: 'Heat Sealing Unit' }); 
          }}
        >
          <mesh userData={{ defaultColor: '#dc2626' }}>
            <boxGeometry args={[0.8, 0.8, 0.8]} />
            <meshStandardMaterial color="#dc2626" roughness={0.4} metalness={0.6} />
          </mesh>
          <mesh position={[0, 0.42, 0]} userData={{ defaultColor: '#ea580c' }}>
            <boxGeometry args={[0.6, 0.05, 0.6]} />
            <meshStandardMaterial color="#ea580c" emissive="#ea580c" emissiveIntensity={0.5} />
          </mesh>
        </group>

      </group>
    </group>
  );
}

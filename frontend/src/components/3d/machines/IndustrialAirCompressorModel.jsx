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
  telemetry = null,
}) {
  const groupRef = useRef(null);
  const fanRef = useRef(null);
  const screwRef = useRef(null);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const press = telemetry?.pressure || 7.1;
    const speedFactor = (press / 7.1) * 10.0;

    if (fanRef.current) {
      fanRef.current.rotation.z += delta * speedFactor;
    }
    if (screwRef.current) {
      screwRef.current.rotation.x += delta * speedFactor * 1.5;
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
                mesh.material.opacity = 0.3;
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
                mesh.material.emissive.set(mesh.userData?.emissive || '#000000');
                mesh.material.emissiveIntensity = mesh.userData?.emissiveIntensity || 0;
              }
            }
          }
        }
      });
    });
  });

  return (
    <group>
      {/* 1. COMPRESSOR SKID BASE FRAME */}
      <group position={[0, -0.65, 0]}>
        <mesh position={[0, 0, 0]} userData={{ defaultColor: '#1e293b' }}>
          <boxGeometry args={[5.2, 0.2, 2.6]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.8} />
        </mesh>
      </group>

      <group ref={groupRef}>
        {/* 2. 110 kW VFD INVERTER MOTOR */}
        <group
          userData={{ compId: 'COMP-CMP-MOTOR' }}
          position={[-1.8, 0.5, 0]}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedComponent(components.find((c) => c.id === 'COMP-CMP-MOTOR'));
          }}
        >
          <mesh rotation={[0, 0, Math.PI / 2]} userData={{ defaultColor: '#1e3a8a' }}>
            <cylinderGeometry args={[0.6, 0.6, 1.4, 28]} />
            <meshStandardMaterial color="#1e3a8a" roughness={0.3} metalness={0.7} />
          </mesh>
          {/* Terminal Junction Box */}
          <mesh position={[0, 0.65, 0]} userData={{ defaultColor: '#1e293b' }}>
            <boxGeometry args={[0.4, 0.25, 0.35]} />
            <meshStandardMaterial color="#1e293b" metalness={0.7} />
          </mesh>
        </group>

        {/* 3. ASYMMETRIC TWIN HELICAL SCREW ROTORS & CASING */}
        <group
          userData={{ compId: 'COMP-CMP-SCREW' }}
          position={[-0.2, 0.5, 0]}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedComponent(components.find((c) => c.id === 'COMP-CMP-SCREW'));
          }}
        >
          <mesh ref={screwRef} userData={{ defaultColor: '#334155' }}>
            <boxGeometry args={[1.4, 0.85, 0.85]} />
            <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.8} />
          </mesh>
          {/* Air Filter Intake Canister */}
          <mesh position={[-0.3, 0.75, 0]} userData={{ defaultColor: '#f59e0b' }}>
            <cylinderGeometry args={[0.32, 0.32, 0.6, 20]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.4} />
          </mesh>
        </group>

        {/* 4. TANDEM ANGULAR CONTACT THRUST BEARINGS */}
        <group
          userData={{ compId: 'COMP-CMP-BEARING' }}
          position={[0.6, 0.5, 0]}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedComponent(components.find((c) => c.id === 'COMP-CMP-BEARING'));
          }}
        >
          <mesh rotation={[0, 0, Math.PI / 2]} userData={{ defaultColor: '#475569' }}>
            <cylinderGeometry args={[0.36, 0.36, 0.3, 24]} />
            <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>

        {/* 5. FORCED AIR COOLING FAN & HEAT EXCHANGER MATRIX */}
        <group
          ref={fanRef}
          userData={{ compId: 'COMP-CMP-FAN' }}
          position={[-0.8, 1.3, 0]}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedComponent(components.find((c) => c.id === 'COMP-CMP-FAN'));
          }}
        >
          <mesh rotation={[Math.PI / 2, 0, 0]} userData={{ defaultColor: '#0ea5e9' }}>
            <cylinderGeometry args={[0.48, 0.48, 0.15, 16]} />
            <meshStandardMaterial color="#0ea5e9" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>

        {/* 6. AIR RECEIVER TANK & OIL SEPARATOR VESSEL */}
        <group
          userData={{ compId: 'COMP-CMP-TANK' }}
          position={[1.7, 0.6, 0]}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedComponent(components.find((c) => c.id === 'COMP-CMP-TANK'));
          }}
        >
          <mesh rotation={[0, 0, Math.PI / 2]} userData={{ defaultColor: '#0284c7' }}>
            <cylinderGeometry args={[0.7, 0.7, 1.8, 28]} />
            <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.65} />
          </mesh>
          {/* Safety Relief Valve */}
          <mesh position={[0, 0.85, 0]} userData={{ defaultColor: '#ef4444' }}>
            <cylinderGeometry args={[0.08, 0.08, 0.35, 16]} />
            <meshStandardMaterial color="#ef4444" metalness={0.9} />
          </mesh>
          {/* Analogue Pressure Dial Gauge */}
          <mesh position={[0.4, 0.5, 0]} rotation={[0, Math.PI / 2, 0]} userData={{ defaultColor: '#f8fafc' }}>
            <cylinderGeometry args={[0.12, 0.12, 0.04, 20]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.1} metalness={0.9} />
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

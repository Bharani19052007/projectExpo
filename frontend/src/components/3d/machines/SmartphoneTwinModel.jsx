import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function SmartphoneTwinModel({
  isHologram = false,
  viewMode = 'CAD',
  selectedComponent,
  setSelectedComponent,
  isSimulatingFailure = false,
  components = [],
  telemetry = null,
}) {
  const groupRef = useRef(null);

  // Live Socket Telemetry Values
  const batteryPct = Math.round(telemetry?.battery ?? 23);
  const tempVal = Number((telemetry?.temperature ?? 28).toFixed(1));
  const cpuPct = Number((telemetry?.cpu ?? 19.2).toFixed(1));
  const isCharging = Boolean(telemetry?.charging);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    if (!groupRef.current) return;

    // Subtle gentle float in regular CAD view
    if (viewMode === 'CAD' && !selectedComponent) {
      groupRef.current.rotation.y = Math.sin(time * 0.6) * 0.12;
    } else if (viewMode !== 'CAD' || selectedComponent) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, delta * 4);
    }

    groupRef.current.children.forEach((child) => {
      const compId = child.userData?.compId;
      if (!compId) return;

      const comp = components.find((c) => c.id === compId || compId.startsWith(c.id));
      const isSelected = selectedComponent && (selectedComponent.id === compId || compId.startsWith(selectedComponent.id));

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
          const defaultColor = mesh.userData?.defaultColor || '#0284c7';
          const defaultEmissive = mesh.userData?.emissive || '#000000';
          const defaultEmissiveIntensity = mesh.userData?.emissiveIntensity ?? 0;
          const hasEmissive = Boolean(mesh.material.emissive && mesh.material.emissive.set);

          if (isHologram) {
            mesh.material.wireframe = true;
            mesh.material.transparent = true;
            if (isSimulatingFailure && isSelected) {
              mesh.material.color.set('#ff2222');
              if (hasEmissive) {
                mesh.material.emissive.set('#ef4444');
                mesh.material.emissiveIntensity = 1.2;
              }
              mesh.material.opacity = 0.95;
            } else if (selectedComponent) {
              if (isSelected) {
                mesh.material.color.set('#00ffff');
                if (hasEmissive) {
                  mesh.material.emissive.set('#00ffff');
                  mesh.material.emissiveIntensity = 1.4;
                }
                mesh.material.opacity = 1.0;
              } else {
                mesh.material.color.set('#00bfff');
                if (hasEmissive) {
                  mesh.material.emissive.set('#004477');
                  mesh.material.emissiveIntensity = 0.3;
                }
                mesh.material.opacity = 0.4;
              }
            } else {
              mesh.material.color.set('#00f0ff');
              if (hasEmissive) {
                mesh.material.emissive.set('#0077aa');
                mesh.material.emissiveIntensity = 0.45 + Math.sin(time * 2 + child.position.x) * 0.15;
              }
              mesh.material.opacity = 0.75;
            }
          } else {
            mesh.material.wireframe = false;
            mesh.material.transparent = Boolean(selectedComponent && !isSelected);

            if (selectedComponent) {
              if (isSelected) {
                mesh.material.opacity = 1.0;
                if (isSimulatingFailure) {
                  mesh.material.color.set('#ef4444');
                  if (hasEmissive) {
                    mesh.material.emissive.set('#dc2626');
                    mesh.material.emissiveIntensity = 0.9;
                  }
                } else if (viewMode === 'THERMAL') {
                  const thermalColor = tempVal > 40 ? '#ef4444' : tempVal > 30 ? '#f97316' : '#0284c7';
                  mesh.material.color.set(thermalColor);
                  if (hasEmissive) {
                    mesh.material.emissive.set(thermalColor);
                    mesh.material.emissiveIntensity = 0.7;
                  }
                } else {
                  mesh.material.color.set(defaultColor);
                  if (hasEmissive) {
                    mesh.material.emissive.set('#00e5ff');
                    mesh.material.emissiveIntensity = 0.6;
                  }
                }
              } else {
                mesh.material.opacity = 0.7;
                mesh.material.color.set(defaultColor);
                if (hasEmissive) {
                  mesh.material.emissive.set('#000000');
                  mesh.material.emissiveIntensity = 0;
                }
              }
            } else {
              mesh.material.opacity = 1.0;
              mesh.material.color.set(defaultColor);
              if (hasEmissive) {
                mesh.material.emissive.set(defaultEmissive);
                mesh.material.emissiveIntensity = defaultEmissiveIntensity;
              }
            }
          }
        }
      });
    });
  });

  return (
    <group ref={groupRef} scale={[1.2, 1.2, 1.2]}>
      
      {/* 1. FRONT 120HZ AMOLED TOUCH DISPLAY */}
      <group
        userData={{ compId: 'phone-oled-display' }}
        position={[0, 0, 0.22]}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedComponent(components.find((c) => c.id === 'phone-oled-display') || { id: 'phone-oled-display', name: '6.78" 120Hz AMOLED Display' });
        }}
      >
        {/* Front Bezel Frame */}
        <mesh position={[0, 0, 0]} userData={{ defaultColor: '#1e293b' }}>
          <boxGeometry args={[1.56, 3.24, 0.04]} />
          <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.8} />
        </mesh>
        
        {/* Active Super AMOLED Display Glass */}
        <mesh position={[0, 0, 0.025]} userData={{ defaultColor: '#0284c7', emissive: '#0284c7', emissiveIntensity: 0.4 }}>
          <planeGeometry args={[1.46, 3.12]} />
          <meshStandardMaterial color="#0284c7" roughness={0.15} metalness={0.5} emissive="#0284c7" emissiveIntensity={0.4} />
        </mesh>
        
        {/* Screen Status Header Bar */}
        <mesh position={[0, 1.32, 0.03]} userData={{ defaultColor: '#38bdf8', emissive: '#38bdf8', emissiveIntensity: 0.7 }}>
          <planeGeometry args={[1.3, 0.08]} />
          <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.7} />
        </mesh>

        {/* Live Battery & Telemetry Hologram Gauge on Display */}
        <mesh position={[0, 0.2, 0.03]} userData={{ defaultColor: isCharging ? '#10b981' : '#00e5ff', emissive: isCharging ? '#10b981' : '#00e5ff', emissiveIntensity: 0.8 }}>
          <planeGeometry args={[1.0, 0.55]} />
          <meshStandardMaterial 
            color={isCharging ? '#10b981' : '#00e5ff'} 
            emissive={isCharging ? '#10b981' : '#00e5ff'} 
            emissiveIntensity={0.8} 
            transparent 
            opacity={0.9}
          />
        </mesh>

        {/* Top Punch-Hole Selfie Camera */}
        <mesh position={[0, 1.4, 0.032]} userData={{ defaultColor: '#090d16' }}>
          <cylinderGeometry args={[0.04, 0.04, 0.01, 24]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color="#090d16" roughness={0.1} metalness={0.9} />
        </mesh>
      </group>

      {/* 2. MAIN LOGIC BOARD & SOC PROCESSOR */}
      <group
        userData={{ compId: 'phone-soc-motherboard' }}
        position={[0, 0.8, 0.0]}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedComponent(components.find((c) => c.id === 'phone-soc-motherboard') || { id: 'phone-soc-motherboard', name: 'Octa-Core 4nm AI SoC & Mainboard' });
        }}
      >
        {/* Mainboard Multi-Layer PCB */}
        <mesh position={[0, 0, 0]} userData={{ defaultColor: '#065f46' }}>
          <boxGeometry args={[1.4, 1.25, 0.05]} />
          <meshStandardMaterial color="#065f46" roughness={0.4} metalness={0.6} />
        </mesh>
        
        {/* 4nm Octa-Core SoC Processor Die */}
        <mesh position={[0, 0.1, 0.035]} userData={{ defaultColor: '#0284c7', emissive: '#00e5ff', emissiveIntensity: 0.7 }}>
          <boxGeometry args={[0.48, 0.48, 0.04]} />
          <meshStandardMaterial color="#0284c7" roughness={0.2} metalness={0.95} emissive="#00e5ff" emissiveIntensity={0.7} />
        </mesh>
        
        {/* LPDDR5 RAM & UFS Storage Chips */}
        {[-0.38, 0.38].map((x, i) => (
          <mesh key={i} position={[x, -0.22, 0.03]} userData={{ defaultColor: '#1e293b' }}>
            <boxGeometry args={[0.3, 0.38, 0.03]} />
            <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.7} />
          </mesh>
        ))}

        {/* Gold Power Management Circuit Traces */}
        <mesh position={[0, -0.48, 0.03]} userData={{ defaultColor: '#f59e0b', emissive: '#fbbf24', emissiveIntensity: 0.4 }}>
          <boxGeometry args={[1.2, 0.08, 0.02]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.2} metalness={0.9} emissive="#fbbf24" emissiveIntensity={0.4} />
        </mesh>
      </group>

      {/* 3. HIGH-CAPACITY LITHIUM-POLYMER BATTERY */}
      <group
        userData={{ compId: 'phone-li-battery' }}
        position={[0, -0.4, 0.0]}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedComponent(components.find((c) => c.id === 'phone-li-battery') || { id: 'phone-li-battery', name: '5000mAh Li-Po Battery Pack' });
        }}
      >
        {/* Battery Cell Block */}
        <mesh position={[0, 0, 0]} userData={{ defaultColor: isCharging ? '#059669' : '#334155', emissive: isCharging ? '#10b981' : '#0284c7', emissiveIntensity: isCharging ? 0.6 : 0.2 }}>
          <boxGeometry args={[1.35, 1.45, 0.08]} />
          <meshStandardMaterial 
            color={isCharging ? '#059669' : '#334155'} 
            roughness={0.25} 
            metalness={0.7}
            emissive={isCharging ? '#10b981' : '#0284c7'}
            emissiveIntensity={isCharging ? 0.6 : 0.2}
          />
        </mesh>
        
        {/* Battery Safety BMS Circuit Ribbon */}
        <mesh position={[0, 0.78, 0.02]} userData={{ defaultColor: '#f59e0b', emissive: '#d97706', emissiveIntensity: 0.3 }}>
          <boxGeometry args={[1.3, 0.08, 0.05]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.7} emissive="#d97706" emissiveIntensity={0.3} />
        </mesh>
      </group>

      {/* 4. TRIPLE AI CAMERA MODULE & SENSORS */}
      <group
        userData={{ compId: 'phone-camera-module' }}
        position={[-0.38, 0.9, -0.16]}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedComponent(components.find((c) => c.id === 'phone-camera-module') || { id: 'phone-camera-module', name: '50MP Triple Camera Module' });
        }}
      >
        {/* Camera Bump Island Housing */}
        <mesh position={[0, 0, 0]} userData={{ defaultColor: '#1e293b' }}>
          <boxGeometry args={[0.58, 0.98, 0.08]} />
          <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.9} />
        </mesh>
        
        {/* Primary 50MP Sony IMX920 Sensor */}
        <mesh position={[0, 0.28, -0.048]} rotation={[Math.PI / 2, 0, 0]} userData={{ defaultColor: '#0284c7', emissive: '#0284c7', emissiveIntensity: 0.4 }}>
          <cylinderGeometry args={[0.17, 0.17, 0.04, 24]} />
          <meshStandardMaterial color="#0284c7" metalness={0.95} roughness={0.1} emissive="#0284c7" emissiveIntensity={0.4} />
        </mesh>
        
        {/* Ultra-Wide Secondary Lens */}
        <mesh position={[0, -0.12, -0.048]} rotation={[Math.PI / 2, 0, 0]} userData={{ defaultColor: '#38bdf8' }}>
          <cylinderGeometry args={[0.14, 0.14, 0.04, 24]} />
          <meshStandardMaterial color="#38bdf8" metalness={0.95} roughness={0.1} />
        </mesh>
        
        {/* Dual-Tone Halo LED Flash */}
        <mesh position={[0, -0.36, -0.048]} rotation={[Math.PI / 2, 0, 0]} userData={{ defaultColor: '#f59e0b', emissive: '#fbbf24', emissiveIntensity: 0.8 }}>
          <cylinderGeometry args={[0.08, 0.08, 0.03, 16]} />
          <meshStandardMaterial color="#f59e0b" emissive="#fbbf24" emissiveIntensity={0.8} />
        </mesh>
      </group>

      {/* 5. LIQUID COOLING COPPER VAPOR CHAMBER */}
      <group
        userData={{ compId: 'phone-vapor-chamber' }}
        position={[0, 0.2, 0.06]}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedComponent(components.find((c) => c.id === 'phone-vapor-chamber') || { id: 'phone-vapor-chamber', name: 'Liquid Cooling Vapor Chamber' });
        }}
      >
        <mesh position={[0, 0, 0]} userData={{ defaultColor: '#d97706', emissive: '#b45309', emissiveIntensity: 0.35 }}>
          <boxGeometry args={[1.25, 2.1, 0.02]} />
          <meshStandardMaterial color="#d97706" roughness={0.2} metalness={0.95} emissive="#b45309" emissiveIntensity={0.35} />
        </mesh>
      </group>

      {/* 6. 5G SUB-6GHZ & WI-FI 6 MIMO ANTENNAS */}
      <group
        userData={{ compId: 'phone-5g-antennas' }}
        position={[0, 1.48, -0.05]}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedComponent(components.find((c) => c.id === 'phone-5g-antennas') || { id: 'phone-5g-antennas', name: '5G & Wi-Fi 6 MIMO Antennas' });
        }}
      >
        <mesh position={[0, 0, 0]} userData={{ defaultColor: '#0284c7', emissive: '#0ea5e9', emissiveIntensity: 0.45 }}>
          <boxGeometry args={[1.5, 0.14, 0.06]} />
          <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.8} emissive="#0ea5e9" emissiveIntensity={0.45} />
        </mesh>
      </group>

      {/* 7. LINEAR HAPTIC MOTOR & STEREO SPEAKER */}
      <group
        userData={{ compId: 'phone-haptic-speaker' }}
        position={[0.4, -1.25, -0.05]}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedComponent(components.find((c) => c.id === 'phone-haptic-speaker') || { id: 'phone-haptic-speaker', name: 'X-Axis Linear Haptic Motor' });
        }}
      >
        <mesh position={[0, 0, 0]} userData={{ defaultColor: '#64748b' }}>
          <boxGeometry args={[0.38, 0.38, 0.06]} />
          <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[-0.65, 0, 0]} userData={{ defaultColor: '#1e293b' }}>
          <boxGeometry args={[0.65, 0.3, 0.06]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* 8. AEROSPACE ALUMINUM UNIBODY CHASSIS & BACK GLASS */}
      <group
        userData={{ compId: 'phone-chassis' }}
        position={[0, 0, -0.12]}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedComponent(components.find((c) => c.id === 'phone-chassis') || { id: 'phone-chassis', name: 'Aerospace Aluminum Chassis' });
        }}
      >
        {/* Structural Unibody Midframe */}
        <mesh position={[0, 0, 0]} userData={{ defaultColor: '#334155', emissive: '#1e293b', emissiveIntensity: 0.2 }}>
          <boxGeometry args={[1.56, 3.24, 0.06]} />
          <meshStandardMaterial color="#334155" roughness={0.25} metalness={0.85} emissive="#1e293b" emissiveIntensity={0.2} />
        </mesh>

        {/* Side Metal Buttons (Volume & Power) */}
        <mesh position={[0.79, 0.5, 0]} userData={{ defaultColor: '#64748b' }}>
          <boxGeometry args={[0.02, 0.35, 0.03]} />
          <meshStandardMaterial color="#64748b" metalness={0.95} roughness={0.1} />
        </mesh>
        <mesh position={[0.79, 0.1, 0]} userData={{ defaultColor: '#0ea5e9' }}>
          <boxGeometry args={[0.02, 0.25, 0.03]} />
          <meshStandardMaterial color="#0ea5e9" metalness={0.95} roughness={0.1} />
        </mesh>
      </group>

    </group>
  );
}

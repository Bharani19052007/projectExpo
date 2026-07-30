import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles, Html } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Enterprise Holographic Digital Twin Engine
 * Renders:
 * - Animated Laser Scan Line (sweeping up and down machine geometry)
 * - Pulsing Sensor Nodes at component 3D coordinates
 * - Upward Drifting Data Particles
 * - Holographic AR Telemetry Badges (live 3D data overlays)
 * - Energy Flow Conduit Pulse Effects
 */
export function HolographicTwinEngine({ 
  components = [], 
  selectedComponent, 
  setSelectedComponent,
  isSimulatingFailure = false 
}) {
  const scanPlaneRef = useRef(null);
  const ringGroupRef = useRef(null);

  // Laser Scan Sweep Animation & Sensor Pulse Loop
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // 1. Vertical Laser Scan Sweep plane (-1.5 to +2.5 Y axis)
    if (scanPlaneRef.current) {
      scanPlaneRef.current.position.y = (Math.sin(time * 1.8) * 1.8) + 0.5;
    }

    // 2. Pulse sensor rings expanding and fading
    if (ringGroupRef.current) {
      ringGroupRef.current.children.forEach((ring, idx) => {
        if (ring.isMesh) {
          const scale = 1 + ((time * 2 + idx * 0.5) % 1.5);
          ring.scale.set(scale, scale, 1);
          ring.material.opacity = Math.max(0, 1 - (scale - 1) / 1.5);
        }
      });
    }
  });

  return (
    <group>
      {/* 1. ANIMATED CYAN LASER SCAN SWEEP PLANE */}
      <group ref={scanPlaneRef} position={[0, 0.5, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[6.5, 3.5]} />
          <meshBasicMaterial 
            color="#00ffff" 
            transparent={true} 
            opacity={0.15} 
            side={THREE.DoubleSide} 
            depthWrite={false}
          />
        </mesh>
        {/* Laser Edge Beam Line */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.8, 3.0, 32]} />
          <meshBasicMaterial 
            color="#00f0ff" 
            transparent={true} 
            opacity={0.4} 
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* 2. UPWARD DRIFTING TELEMETRY DATA PARTICLES */}
      <Sparkles 
        count={65} 
        scale={[6, 3.5, 3.5]} 
        size={3.2} 
        speed={0.9} 
        color="#00f0ff" 
        opacity={0.7}
      />

      {/* 3. PULSING SENSOR NODES & AR TELEMETRY BADGES AT COMPONENT LOCATIONS */}
      <group ref={ringGroupRef}>
        {components.map((comp, idx) => {
          if (!comp.position3d) return null;
          const [posx, posy, posz] = comp.position3d;

          const isSelected = !!(selectedComponent && comp && comp.id && selectedComponent.id && (selectedComponent.id === comp.id || String(comp.id).startsWith(String(selectedComponent.id))));
          const isFailed = isSimulatingFailure && (isSelected || idx === 0);

          const nodeColor = isFailed ? '#ef4444' : isSelected ? '#00ffff' : '#00bfff';
          const badgeBg = isFailed 
            ? 'bg-red-950/90 border-red-500 text-red-200' 
            : isSelected 
            ? 'bg-cyan-950/90 border-cyan-400 text-cyan-200 ring-2 ring-cyan-500/30' 
            : 'bg-slate-900/85 border-blue-500/50 text-slate-200';

          return (
            <group key={comp.id || idx} position={[posx, posy + 0.3, posz]}>
              
              {/* Pulsing Core Sensor Node */}
              <mesh onClick={(e) => { e.stopPropagation(); setSelectedComponent(comp); }}>
                <sphereGeometry args={[0.09, 16, 16]} />
                <meshStandardMaterial 
                  color={nodeColor} 
                  emissive={nodeColor} 
                  emissiveIntensity={1.8} 
                />
              </mesh>

              {/* Expanding Concentric Pulse Ring */}
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
                <ringGeometry args={[0.12, 0.18, 24]} />
                <meshBasicMaterial 
                  color={nodeColor} 
                  transparent={true} 
                  opacity={0.6} 
                  side={THREE.DoubleSide} 
                />
              </mesh>

              {/* FLOATING 3D AR TELEMETRY BADGE OVERLAY */}
              <Html 
                position={[0, 0.45, 0]} 
                center 
                distanceFactor={7.5}
                className="pointer-events-auto select-none"
              >
                <div 
                  onClick={() => setSelectedComponent(comp)}
                  className={`px-2.5 py-1 rounded-xl border text-[10px] font-mono font-bold shadow-lg backdrop-blur-md transition-all duration-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${badgeBg}`}
                >
                  <span className={`w-2 h-2 rounded-full animate-ping ${isFailed ? 'bg-red-500' : 'bg-cyan-400'}`} />
                  <span>{comp.name}</span>
                  <span className="text-[9px] opacity-75 font-normal">
                    [{comp.temperature ? `${comp.temperature}°C` : comp.rpm || 'ONLINE'}]
                  </span>
                </div>
              </Html>

            </group>
          );
        })}
      </group>

    </group>
  );
}

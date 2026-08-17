import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';

export default function Laptop({ status, telemetry }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.05 - 0.5;
      meshRef.current.rotation.y += 0.002;
    }
  });

  let screenColor = '#0f172a';
  let glowColor = '#1976d2';
  
  if (status === 'warning') {
    screenColor = '#451a03';
    glowColor = '#f59e0b';
  } else if (status === 'critical') {
    screenColor = '#4c0519';
    glowColor = '#e11d48';
  }

  return (
    <group ref={meshRef}>
      {/* Base / Keyboard part */}
      <RoundedBox args={[4, 0.2, 2.8]} radius={0.05} position={[0, 0, 0]}>
        <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.4} />
      </RoundedBox>
      
      {/* Trackpad */}
      <mesh position={[0, 0.11, 0.6]}>
        <planeGeometry args={[1.2, 0.8]} />
        <meshStandardMaterial color="#475569" roughness={0.6} />
      </mesh>

      {/* Keyboard Area */}
      <mesh position={[0, 0.11, -0.3]}>
        <planeGeometry args={[3.4, 1.4]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>

      {/* Screen part (Tilted open) */}
      <group position={[0, 0.1, -1.3]} rotation={[-Math.PI / 8, 0, 0]}>
        {/* Lid */}
        <RoundedBox args={[4, 2.6, 0.1]} radius={0.05} position={[0, 1.3, -0.05]}>
          <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.4} />
        </RoundedBox>
        
        {/* Screen Display */}
        <mesh position={[0, 1.3, 0.01]}>
          <planeGeometry args={[3.8, 2.4]} />
          <meshStandardMaterial 
            color={screenColor} 
            emissive={glowColor}
            emissiveIntensity={status === 'normal' ? 0.3 : 0.8}
          />
        </mesh>
      </group>
    </group>
  );
}

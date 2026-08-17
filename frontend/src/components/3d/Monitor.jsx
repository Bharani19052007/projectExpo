import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';

export default function Monitor({ status, telemetry }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.02;
      meshRef.current.rotation.y += 0.001;
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
      {/* Base / Stand Base */}
      <RoundedBox args={[2, 0.1, 1.5]} radius={0.05} position={[0, -2, 0]}>
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.5} />
      </RoundedBox>
      
      {/* Stand Neck */}
      <mesh position={[0, -1, -0.4]} rotation={[0.1, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.3, 2]} />
        <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.6} />
      </mesh>

      {/* Screen Enclosure */}
      <RoundedBox args={[6, 3.5, 0.2]} radius={0.05} position={[0, 0.2, -0.2]}>
        <meshStandardMaterial color="#1e293b" />
      </RoundedBox>

      {/* Screen Display */}
      <mesh position={[0, 0.2, -0.09]}>
        <planeGeometry args={[5.8, 3.3]} />
        <meshStandardMaterial 
          color={screenColor} 
          emissive={glowColor}
          emissiveIntensity={status === 'normal' ? 0.3 : 0.8}
        />
      </mesh>
    </group>
  );
}

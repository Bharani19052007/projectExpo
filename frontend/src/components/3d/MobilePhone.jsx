import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';

export default function MobilePhone({ status, telemetry }) {
  const meshRef = useRef();

  // Subtle floating animation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
      meshRef.current.rotation.y += 0.005; // Slow spin
    }
  });

  // Determine screen color based on status
  let screenColor = '#0f172a'; // Default dark
  let glowColor = '#1976d2';
  
  if (status === 'warning') {
    screenColor = '#451a03'; // Dark orange
    glowColor = '#f59e0b'; // Amber
  } else if (status === 'critical') {
    screenColor = '#4c0519'; // Dark red
    glowColor = '#e11d48'; // Rose
  }

  return (
    <group ref={meshRef}>
      {/* Phone Body */}
      <RoundedBox args={[1.5, 3, 0.2]} radius={0.1} smoothness={4}>
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
      </RoundedBox>

      {/* Screen */}
      <mesh position={[0, 0, 0.105]}>
        <planeGeometry args={[1.35, 2.8]} />
        <meshStandardMaterial 
          color={screenColor} 
          emissive={glowColor}
          emissiveIntensity={status === 'normal' ? 0.2 : 0.8}
        />
      </mesh>
      
      {/* Dynamic Screen Content Placeholder (Visualizing Telemetry roughly) */}
      <mesh position={[0, 0, 0.11]}>
        <planeGeometry args={[1.35, 2.8 * (telemetry.battery / 100)]} />
        <meshBasicMaterial color={glowColor} transparent opacity={0.2} />
      </mesh>

      {/* Camera Bump */}
      <RoundedBox args={[0.4, 0.6, 0.05]} radius={0.05} position={[-0.4, 1.0, -0.1]} rotation={[0, Math.PI, 0]}>
        <meshStandardMaterial color="#0f172a" />
      </RoundedBox>
    </group>
  );
}

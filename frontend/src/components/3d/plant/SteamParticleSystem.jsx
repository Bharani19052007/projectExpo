import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Procedural GPU-optimized steam & smoke particle plume system
 * Generates rising, expanding, and fading steam particles
 */
export default function SteamParticleSystem({
  position = [0, 0, 0],
  count = 60,
  color = '#e2e8f0',
  opacity = 0.45,
  spread = 1.2,
  speed = 1.8,
  maxHeight = 14,
  particleSize = 1.2,
}) {
  const pointsRef = useRef();

  // Initialize particle offsets and random velocities
  const [positions, scales, opacities, lifeTimes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sc = new Float32Array(count);
    const op = new Float32Array(count);
    const lt = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const progress = i / count;
      lt[i] = progress; // Staggered initial lifecycle 0..1

      const radius = progress * spread * (0.3 + Math.random() * 0.7);
      const angle = Math.random() * Math.PI * 2;

      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = progress * maxHeight;
      pos[i * 3 + 2] = Math.sin(angle) * radius;

      sc[i] = (0.4 + progress * 1.6) * particleSize;
      op[i] = Math.sin(progress * Math.PI) * opacity;
    }

    return [pos, sc, op, lt];
  }, [count, spread, maxHeight, particleSize, opacity]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes.position;
    const time = state.clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      // Advance lifetime
      lifeTimes[i] += delta * (speed / maxHeight);
      if (lifeTimes[i] > 1.0) {
        lifeTimes[i] = 0.0;
      }

      const life = lifeTimes[i];
      const radius = life * spread * (0.8 + Math.sin(time * 2 + i) * 0.2);
      const angle = (i * 137.5 * Math.PI) / 180 + time * 0.2; // Golden spiral angle drift

      // Wind drift along X/Z
      const windX = Math.sin(time * 0.5) * 0.6 * life;
      const windZ = Math.cos(time * 0.4) * 0.4 * life;

      posAttr.setXYZ(
        i,
        Math.cos(angle) * radius + windX,
        life * maxHeight,
        Math.sin(angle) * radius + windZ
      );
    }
    posAttr.needsUpdate = true;
  });

  return (
    <group position={position}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={particleSize}
          color={color}
          transparent
          opacity={opacity}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

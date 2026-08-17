import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export default function HologramVibrationLayer({
  assets = [],
  activeMetric = 'velocity', // 'velocity' | 'acceleration' | 'envelope'
  amplitudeScale = 1.0,
}) {
  const ringsRef = useRef();
  const fftBarsRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // 1. Animate Expanding Harmonic Wave Rings
    if (ringsRef.current) {
      ringsRef.current.children.forEach((group, gIdx) => {
        const speed = 1.8 + gIdx * 0.4;
        group.children.forEach((ring, rIdx) => {
          const phase = ((t * speed + rIdx * 0.7) % 2.5);
          const scale = 1.0 + phase * 1.8 * amplitudeScale;
          ring.scale.set(scale, scale, scale);
          if (ring.material) {
            ring.material.opacity = Math.max(0, (1 - phase / 2.5) * 0.75);
          }
        });
      });
    }

    // 2. Animate 3D FFT Harmonic Frequency Bars
    if (fftBarsRef.current) {
      fftBarsRef.current.children.forEach((fftGroup, idx) => {
        fftGroup.children.forEach((bar, bIdx) => {
          const noise = Math.sin(t * 8 + bIdx * 1.5 + idx * 3) * 0.25;
          const baseHeight = bIdx === 1 ? 1.6 : bIdx === 3 ? 1.2 : 0.6;
          const h = Math.max(0.2, (baseHeight + noise) * amplitudeScale);
          bar.scale.y = h;
          bar.position.y = h * 0.5;
        });
      });
    }
  });

  // ISO 10816-3 Vibration Severity Classification
  const getIsoSeverity = (vib) => {
    if (vib < 1.8) return { zone: 'Zone A (Good)', color: '#22c55e', label: 'GOOD' };
    if (vib < 2.8) return { zone: 'Zone B (Acceptable)', color: '#00c2ff', label: 'ACCEPTABLE' };
    if (vib < 4.5) return { zone: 'Zone C (Alert)', color: '#f59e0b', label: 'ALERT' };
    return { zone: 'Zone D (Danger)', color: '#ef4444', label: 'DANGER' };
  };

  return (
    <group>
      {/* ======================================================== */}
      {/* 1. CYBERNETIC HOLOGRAPHIC GROUND COORDINATE GRID */}
      {/* ======================================================== */}
      <group position={[0, 0.05, 0]}>
        <gridHelper
          args={[240, 60, '#00c2ff', '#1e3a8a']}
          position={[0, 0, 0]}
        />
        {/* Hologram Coordinate Sub-grid */}
        <gridHelper
          args={[240, 120, '#0284c7', '#0f172a']}
          position={[0, 0.02, 0]}
        />
      </group>

      {/* ======================================================== */}
      {/* 2. 3D CONCENTRIC HARMONIC WAVE RINGS PER MACHINE */}
      {/* ======================================================== */}
      <group ref={ringsRef}>
        {assets.map((asset, idx) => {
          const [x, y, z] = asset.position || [0, 0, 0];
          const severity = getIsoSeverity(asset.vibration || 2.0);

          return (
            <group key={`rings-${asset.id}`} position={[x, y + 0.8, z]}>
              {/* 3 Concentric Harmonic Wave Rings expanding outwards */}
              {[0, 1, 2].map((r) => (
                <mesh
                  key={`ring-${r}`}
                  rotation={[-Math.PI / 2, 0, 0]}
                >
                  <ringGeometry args={[1.4, 1.55, 32]} />
                  <meshBasicMaterial
                    color={severity.color}
                    transparent
                    opacity={0.6}
                    side={THREE.DoubleSide}
                  />
                </mesh>
              ))}

              {/* Vertical Radial Resonance Ring */}
              <mesh rotation={[0, 0, 0]}>
                <ringGeometry args={[1.2, 1.28, 32]} />
                <meshBasicMaterial
                  color={severity.color}
                  transparent
                  opacity={0.4}
                  side={THREE.DoubleSide}
                />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* ======================================================== */}
      {/* 3. 3D FLOATING FFT HARMONIC FREQUENCY SPECTRUMS */}
      {/* ======================================================== */}
      <group ref={fftBarsRef}>
        {assets.map((asset, idx) => {
          const [x, y, z] = asset.position || [0, 0, 0];
          const severity = getIsoSeverity(asset.vibration || 2.0);

          return (
            <group key={`fft-${asset.id}`} position={[x + 2.4, y + 0.4, z]}>
              {/* FFT Spectrum Floor Plate */}
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.9, 0, 0]}>
                <planeGeometry args={[2.4, 0.6]} />
                <meshBasicMaterial color="#0f172a" transparent opacity={0.8} />
              </mesh>

              {/* 6 Frequency Harmonic Bars (1X, 2X, 3X, BPFO, BPFI, GMF) */}
              {[
                { freq: '1X (24Hz)', baseH: 0.6, col: '#00c2ff' },
                { freq: '2X (49Hz)', baseH: 1.4, col: severity.color },
                { freq: '3X (74Hz)', baseH: 0.8, col: '#00c2ff' },
                { freq: 'BPFO (148Hz)', baseH: asset.id === 'PUMP-P-204' ? 1.8 : 0.4, col: asset.id === 'PUMP-P-204' ? '#f59e0b' : '#38bdf8' },
                { freq: 'BPFI (212Hz)', baseH: 0.5, col: '#00c2ff' },
                { freq: 'GMF (450Hz)', baseH: 0.3, col: '#00c2ff' },
              ].map((bar, bIdx) => (
                <mesh key={`bar-${bIdx}`} position={[bIdx * 0.35, bar.baseH * 0.5, 0]}>
                  <boxGeometry args={[0.22, 1.0, 0.22]} />
                  <meshStandardMaterial
                    color={bar.col}
                    emissive={bar.col}
                    emissiveIntensity={0.6}
                    roughness={0.2}
                  />
                </mesh>
              ))}

              {/* Floating Hologram Vibration Badge */}
              <Html position={[0.9, 2.2, 0]} center distanceFactor={35}>
                <div className="bg-[#020617]/90 border border-[#00c2ff]/60 px-2.5 py-1 rounded-lg shadow-xl backdrop-blur-md text-white font-mono text-[10px] whitespace-nowrap pointer-events-none select-none flex items-center gap-1.5 animate-pulse">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: severity.color }}
                  />
                  <span className="font-extrabold text-[#38bdf8]">
                    {asset.vibration || '2.1'} mm/s RMS
                  </span>
                  <span
                    className="text-[9px] font-bold px-1 rounded"
                    style={{
                      color: severity.color,
                      backgroundColor: `${severity.color}20`,
                    }}
                  >
                    {severity.label}
                  </span>
                </div>
              </Html>
            </group>
          );
        })}
      </group>

      {/* ======================================================== */}
      {/* 4. VOLUMETRIC VIBRATION AURA ENVELOPES */}
      {/* ======================================================== */}
      <group>
        {assets.map((asset) => {
          const [x, y, z] = asset.position || [0, 0, 0];
          const severity = getIsoSeverity(asset.vibration || 2.0);

          return (
            <mesh key={`aura-${asset.id}`} position={[x, y + 1.2, z]}>
              <sphereGeometry args={[2.4, 16, 16]} />
              <meshBasicMaterial
                color={severity.color}
                transparent
                opacity={0.08}
                wireframe
              />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

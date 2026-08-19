import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

export default function Laptop({ 
  status, 
  telemetry = {}, 
  selectedComponent, 
  onSelectComponent, 
  inspectInternals = false, 
  lidAngle = 110 
}) {
  const meshRef = useRef();
  const lidGroupRef = useRef();
  const fanRefLeft = useRef();
  const fanRefRight = useRef();
  const auraGlowRef = useRef();
  const screenMaterialRef = useRef();

  // Track hovered component
  const [hovered, setHovered] = useState(null);

  // Animated lid angle
  const currentLidAngleRef = useRef(lidAngle || 110);

  // Single persistent canvas & texture to prevent WebGL memory leak
  const canvasRef = useRef(null);
  const textureRef = useRef(null);

  // Initialize canvas and texture once
  if (!canvasRef.current && typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 640;
    canvasRef.current = canvas;
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    textureRef.current = texture;
  }

  // Redraw canvas on telemetry change (zero new GPU textures allocated)
  useEffect(() => {
    const canvas = canvasRef.current;
    const texture = textureRef.current;
    if (!canvas || !texture) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 1024, 640);
    bgGrad.addColorStop(0, '#060913');
    bgGrad.addColorStop(0.5, '#0b0f1d');
    bgGrad.addColorStop(1, '#03050a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1024, 640);

    // Cyber grid lines
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 1024; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 640); ctx.stroke();
    }
    for (let y = 0; y < 640; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1024, y); ctx.stroke();
    }

    // Diagonal red cyber accent
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, 480); ctx.lineTo(750, 0); ctx.stroke();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.beginPath(); ctx.moveTo(1024, 180); ctx.lineTo(400, 640); ctx.stroke();

    // Top ROG Strix Cyber Header Bar
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(40, 30, 944, 50);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 30, 944, 50);

    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 22px "Segoe UI", Arial, sans-serif';
    ctx.fillText('REPUBLIC OF GAMERS', 60, 64);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
    ctx.fillText('ROG STRIX G15  •  NVIDIA GEFORCE GTX 1650', 360, 62);

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 15px "Segoe UI", Arial, sans-serif';
    ctx.fillText('144Hz IPS  •  ONLINE', 800, 62);

    // ── DRAW GLOWING ROG EYE LOGO (Center) ──
    const cx = 512;
    const cy = 270;

    // Glowing Eye Base (Right wing)
    ctx.save();
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 25;
    ctx.fillStyle = '#ef4444';

    ctx.beginPath();
    ctx.moveTo(cx - 10, cy - 80);
    ctx.quadraticCurveTo(cx + 120, cy - 70, cx + 150, cy + 40);
    ctx.quadraticCurveTo(cx + 80, cy + 80, cx - 20, cy + 30);
    ctx.quadraticCurveTo(cx + 60, cy + 10, cx + 50, cy - 40);
    ctx.closePath();
    ctx.fill();

    // Left eyebrow blade
    ctx.beginPath();
    ctx.moveTo(cx - 140, cy - 70);
    ctx.lineTo(cx - 30, cy - 75);
    ctx.lineTo(cx - 70, cy - 35);
    ctx.closePath();
    ctx.fill();

    // Center sharp eye pupil cutout
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#060913';
    ctx.beginPath();
    ctx.moveTo(cx + 30, cy - 30);
    ctx.lineTo(cx + 85, cy + 10);
    ctx.lineTo(cx + 20, cy + 15);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // ROG Subtitle Under Logo
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 32px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DHANUSH_LAP', cx, cy + 130);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
    ctx.fillText('ARMOURY CRATE DIGITAL TWIN HUD', cx, cy + 160);

    // ── BOTTOM TELEMETRY HUD CARDS ──
    const cpuVal = telemetry.cpu !== undefined && telemetry.cpu !== null ? `${telemetry.cpu}%` : '6.2%';
    const gpuVal = telemetry.gpu !== undefined && telemetry.gpu !== null ? `${telemetry.gpu}%` : '0%';
    const ramVal = telemetry.ram !== undefined && telemetry.ram !== null ? `${telemetry.ram}%` : '87.4%';
    const batVal = telemetry.battery !== undefined && telemetry.battery !== null ? `${telemetry.battery}%` : '80%';

    // CPU Card
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(60, 480, 200, 110);
    ctx.strokeStyle = '#38bdf8';
    ctx.strokeRect(60, 480, 200, 110);
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 14px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('CPU LOAD', 80, 510);
    ctx.fillStyle = '#38bdf8';
    ctx.font = '900 32px "Courier New", monospace';
    ctx.fillText(cpuVal, 80, 560);

    // GPU Card
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(290, 480, 200, 110);
    ctx.strokeStyle = '#22c55e';
    ctx.strokeRect(290, 480, 200, 110);
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 14px "Segoe UI", Arial, sans-serif';
    ctx.fillText('GTX 1650 GPU', 310, 510);
    ctx.fillStyle = '#22c55e';
    ctx.font = '900 32px "Courier New", monospace';
    ctx.fillText(gpuVal, 310, 560);

    // RAM Card
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(520, 480, 200, 110);
    ctx.strokeStyle = '#e11d48';
    ctx.strokeRect(520, 480, 200, 110);
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 14px "Segoe UI", Arial, sans-serif';
    ctx.fillText('RAM USAGE', 540, 510);
    ctx.fillStyle = '#e11d48';
    ctx.font = '900 32px "Courier New", monospace';
    ctx.fillText(ramVal, 540, 560);

    // Battery Card
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(750, 480, 200, 110);
    ctx.strokeStyle = '#10b981';
    ctx.strokeRect(750, 480, 200, 110);
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 14px "Segoe UI", Arial, sans-serif';
    ctx.fillText('BATTERY (56Wh)', 770, 510);
    ctx.fillStyle = '#10b981';
    ctx.font = '900 32px "Courier New", monospace';
    ctx.fillText(batVal, 770, 560);

    texture.needsUpdate = true;
  }, [telemetry.cpu, telemetry.gpu, telemetry.ram, telemetry.battery, telemetry.name]);

  // Dispose texture on unmount
  useEffect(() => {
    return () => {
      if (textureRef.current) {
        textureRef.current.dispose();
      }
    };
  }, []);

  useFrame((state) => {
    // Floating animation
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.04 - 0.15;
    }

    // Smooth lid opening/closing via lidGroupRef
    const targetLidAngle = lidAngle !== undefined ? lidAngle : 110;
    currentLidAngleRef.current += (targetLidAngle - currentLidAngleRef.current) * 0.08;
    const rotX = -Math.PI / 2 + (currentLidAngleRef.current / 180) * Math.PI * 0.72;
    if (lidGroupRef.current) {
      lidGroupRef.current.rotation.x = rotX;
    }

    // Rotate internal dual fans
    const fanSpeed = telemetry.fanSpeed || (telemetry.cpu > 50 ? 3200 : 2100);
    const rotSpeed = (fanSpeed / 5000) * 0.45;
    if (fanRefLeft.current) {
      fanRefLeft.current.rotation.y += rotSpeed;
    }
    if (fanRefRight.current) {
      fanRefRight.current.rotation.y += rotSpeed;
    }

    // Pulsing Aura Sync RGB underglow
    if (auraGlowRef.current && auraGlowRef.current.color) {
      const auraTime = state.clock.elapsedTime * 1.5;
      const r = Math.sin(auraTime) * 0.4 + 0.6;
      const g = Math.sin(auraTime + 2.09) * 0.3 + 0.2;
      const b = Math.sin(auraTime + 4.18) * 0.5 + 0.5;
      auraGlowRef.current.color.setRGB(r, g, b);
      if (auraGlowRef.current.emissive) {
        auraGlowRef.current.emissive.setRGB(r, g, b);
      }
    }
  });

  // Highlight color helper
  const getHighlightColor = (compName) => {
    const isSelected = selectedComponent === compName;
    const isHovered = hovered === compName;

    if (!isSelected && !isHovered) return null;

    if (compName === 'CPU' && (telemetry.cpuTemp > 85 || status === 'critical')) return '#ef4444';
    if (compName === 'CPU' && (telemetry.cpuTemp > 70 || status === 'warning')) return '#f59e0b';
    if (compName === 'GPU' && (telemetry.gpuTemp > 85 || status === 'critical')) return '#ef4444';
    if (compName === 'GPU' && (telemetry.gpuTemp > 70 || status === 'warning')) return '#f59e0b';
    if (compName === 'Battery' && (telemetry.battery < 20)) return '#ef4444';

    return isSelected ? '#ef4444' : '#38bdf8'; // ROG Red or Neon Cyan
  };

  const handlePointerOver = (e, name) => {
    e.stopPropagation();
    setHovered(name);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = (e) => {
    e.stopPropagation();
    setHovered(null);
    document.body.style.cursor = 'default';
  };

  const handleClick = (e, name) => {
    e.stopPropagation();
    if (onSelectComponent) {
      onSelectComponent(selectedComponent === name ? null : name);
    }
  };

  const baseCoverOpacity = inspectInternals ? 0.12 : 1.0;
  const baseCoverTransparent = inspectInternals;

  return (
    <group ref={meshRef}>
      {/* ========================================================================= */}
      {/* 1. ASUS ROG STRIX BASE CHASSIS */}
      {/* ========================================================================= */}
      <group>
        {/* Main Lower Chassis Base */}
        <RoundedBox args={[4.2, 0.14, 2.9]} radius={0.04} position={[0, -0.06, 0]}>
          <meshStandardMaterial color="#0f141c" metalness={0.85} roughness={0.35} />
        </RoundedBox>

        {/* ROG Rear Stepped Cooling Shelf ("3D Flow Zone" exhaust bar) */}
        <RoundedBox args={[4.22, 0.12, 0.55]} radius={0.03} position={[0, -0.02, -1.25]}>
          <meshStandardMaterial color="#181e29" metalness={0.9} roughness={0.25} />
        </RoundedBox>

        {/* Left & Right Rear Exhaust Honeycomb Vents */}
        <group position={[-1.5, -0.02, -1.53]}>
          <mesh>
            <boxGeometry args={[0.9, 0.08, 0.04]} />
            <meshStandardMaterial color="#05080e" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0, 0.01]}>
            <boxGeometry args={[0.82, 0.06, 0.02]} />
            <meshStandardMaterial color="#b45309" metalness={0.95} roughness={0.2} />
          </mesh>
        </group>

        <group position={[1.5, -0.02, -1.53]}>
          <mesh>
            <boxGeometry args={[0.9, 0.08, 0.04]} />
            <meshStandardMaterial color="#05080e" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0, 0.01]}>
            <boxGeometry args={[0.82, 0.06, 0.02]} />
            <meshStandardMaterial color="#b45309" metalness={0.95} roughness={0.2} />
          </mesh>
        </group>

        {/* ROG Top Keyboard Deck / Bezel */}
        <RoundedBox 
          args={[4.16, 0.08, 2.86]} 
          radius={0.03} 
          position={[0, 0.04, 0]}
        >
          <meshStandardMaterial 
            color="#141a24" 
            metalness={0.88} 
            roughness={0.4} 
            transparent={baseCoverTransparent} 
            opacity={baseCoverOpacity} 
          />
        </RoundedBox>

        {/* ======================================================================= */}
        {/* AURA SYNC WRAPAROUND RGB LIGHTBAR (Bottom Front & Side Lip) */}
        {/* ======================================================================= */}
        {!inspectInternals && (
          <group position={[0, -0.11, 1.45]}>
            {/* Front Lightbar Strip */}
            <mesh>
              <boxGeometry args={[3.8, 0.025, 0.03]} />
              <meshStandardMaterial 
                ref={auraGlowRef}
                color="#ff0055" 
                emissive="#ff0055" 
                emissiveIntensity={1.8} 
                roughness={0.1}
              />
            </mesh>
            {/* Left Side Lightbar Strip */}
            <mesh position={[-1.9, 0, -0.6]} rotation={[0, Math.PI / 2, 0]}>
              <boxGeometry args={[1.2, 0.025, 0.03]} />
              <meshStandardMaterial 
                color="#ff0055" 
                emissive="#ff0055" 
                emissiveIntensity={1.4} 
              />
            </mesh>
            {/* Right Side Lightbar Strip */}
            <mesh position={[1.9, 0, -0.6]} rotation={[0, Math.PI / 2, 0]}>
              <boxGeometry args={[1.2, 0.025, 0.03]} />
              <meshStandardMaterial 
                color="#ff0055" 
                emissive="#ff0055" 
                emissiveIntensity={1.4} 
              />
            </mesh>
          </group>
        )}

        {/* ======================================================================= */}
        {/* KEYBOARD DECK & HIGHLIGHTED ROG WASD GAMING KEYS */}
        {/* ======================================================================= */}
        {!inspectInternals && (
          <group position={[0, 0.082, -0.22]}>
            {/* Keyboard Well Recess */}
            <mesh 
              rotation={[-Math.PI / 2, 0, 0]}
              onPointerOver={(e) => handlePointerOver(e, 'Keyboard')}
              onPointerOut={handlePointerOut}
              onClick={(e) => handleClick(e, 'Keyboard')}
            >
              <planeGeometry args={[3.6, 1.35]} />
              <meshStandardMaterial 
                color={getHighlightColor('Keyboard') || '#0a0d14'} 
                roughness={0.8} 
                emissive={getHighlightColor('Keyboard') || '#101726'}
                emissiveIntensity={getHighlightColor('Keyboard') ? 0.8 : 0.2}
              />
            </mesh>

            {/* Backlit Key Matrix Rows */}
            {[-0.45, -0.25, -0.05, 0.15, 0.35].map((zPos, rowIdx) => (
              <mesh key={rowIdx} position={[0, 0.006, zPos]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[3.45, 0.14]} />
                <meshStandardMaterial 
                  color="#171e2c" 
                  emissive="#0284c7" 
                  emissiveIntensity={0.3} 
                />
              </mesh>
            ))}

            {/* Transparent Highlighted WASD Keycaps */}
            <group position={[-1.05, 0.015, -0.1]}>
              <mesh position={[0, 0, -0.15]}>
                <boxGeometry args={[0.16, 0.02, 0.14]} />
                <meshStandardMaterial color="#ffffff" emissive="#38bdf8" emissiveIntensity={1.0} transparent opacity={0.9} />
              </mesh>
              <mesh position={[-0.18, 0, 0.05]}>
                <boxGeometry args={[0.16, 0.02, 0.14]} />
                <meshStandardMaterial color="#ffffff" emissive="#38bdf8" emissiveIntensity={1.0} transparent opacity={0.9} />
              </mesh>
              <mesh position={[0, 0, 0.05]}>
                <boxGeometry args={[0.16, 0.02, 0.14]} />
                <meshStandardMaterial color="#ffffff" emissive="#38bdf8" emissiveIntensity={1.0} transparent opacity={0.9} />
              </mesh>
              <mesh position={[0.18, 0, 0.05]}>
                <boxGeometry args={[0.16, 0.02, 0.14]} />
                <meshStandardMaterial color="#ffffff" emissive="#38bdf8" emissiveIntensity={1.0} transparent opacity={0.9} />
              </mesh>
            </group>

            {/* 5 Dedicated ROG Top Hotkeys */}
            <group position={[-0.9, 0.008, -0.58]}>
              {[-0.4, -0.2, 0, 0.2, 0.4].map((xOff, idx) => (
                <mesh key={idx} position={[xOff, 0, 0]}>
                  <boxGeometry args={[0.14, 0.015, 0.06]} />
                  <meshStandardMaterial color="#334155" emissive="#ef4444" emissiveIntensity={0.5} />
                </mesh>
              ))}
            </group>

            {/* Spacebar */}
            <mesh position={[-0.2, 0.012, 0.45]}>
              <boxGeometry args={[0.9, 0.02, 0.14]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>

            {/* Precision Glass Touchpad */}
            <mesh 
              position={[0, 0.005, 0.95]} 
              rotation={[-Math.PI / 2, 0, 0]}
              onPointerOver={(e) => handlePointerOver(e, 'Touchpad')}
              onPointerOut={handlePointerOut}
              onClick={(e) => handleClick(e, 'Touchpad')}
            >
              <planeGeometry args={[1.35, 0.78]} />
              <meshStandardMaterial 
                color={getHighlightColor('Touchpad') || '#182030'} 
                metalness={0.7} 
                roughness={0.3} 
                emissive={getHighlightColor('Touchpad') || '#000000'}
                emissiveIntensity={getHighlightColor('Touchpad') ? 0.7 : 0}
              />
            </mesh>

            {/* ROG Palmrest Cyber Slash Graphic */}
            <mesh position={[1.1, 0.004, 0.92]} rotation={[-Math.PI / 2, 0, 0.4]}>
              <planeGeometry args={[0.9, 0.02]} />
              <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.7} />
            </mesh>
          </group>
        )}

        {/* 150W DC Charging Port & USB on Flank */}
        <group position={[-2.1, 0.02, 0.2]}>
          <mesh 
            rotation={[0, 0, Math.PI / 2]}
            onPointerOver={(e) => handlePointerOver(e, 'Charging system')}
            onPointerOut={handlePointerOut}
            onClick={(e) => handleClick(e, 'Charging system')}
          >
            <cylinderGeometry args={[0.055, 0.055, 0.08, 12]} />
            <meshStandardMaterial 
              color={getHighlightColor('Charging system') || '#f59e0b'} 
              metalness={0.9} 
              emissive={getHighlightColor('Charging system') || '#b45309'}
              emissiveIntensity={0.5}
            />
          </mesh>
          <mesh position={[0, 0, 0.25]}>
            <boxGeometry args={[0.08, 0.04, 0.12]} />
            <meshStandardMaterial color="#0284c7" />
          </mesh>
          <mesh position={[0, 0, 0.45]}>
            <boxGeometry args={[0.08, 0.04, 0.12]} />
            <meshStandardMaterial color="#0284c7" />
          </mesh>
        </group>

        {/* ======================================================================= */}
        {/* INTERNAL HARDWARE TWIN (When Inspect Internals is ON) */}
        {/* ======================================================================= */}
        {inspectInternals && (
          <group position={[0, 0, 0]}>
            {/* Matte Black Motherboard PCB */}
            <mesh position={[0, -0.01, -0.2]}>
              <boxGeometry args={[3.8, 0.02, 2.0]} />
              <meshStandardMaterial color="#080c14" roughness={0.8} />
            </mesh>

            {/* 56Wh Battery Pack */}
            <mesh 
              position={[0, 0.015, 0.95]}
              onPointerOver={(e) => handlePointerOver(e, 'Battery')}
              onPointerOut={handlePointerOut}
              onClick={(e) => handleClick(e, 'Battery')}
            >
              <boxGeometry args={[3.6, 0.05, 0.65]} />
              <meshStandardMaterial 
                color={getHighlightColor('Battery') || '#111827'} 
                metalness={0.3}
                roughness={0.5}
                emissive={getHighlightColor('Battery') || '#000000'}
                emissiveIntensity={getHighlightColor('Battery') ? 0.8 : 0}
              />
            </mesh>

            {/* CPU Module */}
            <group 
              position={[-0.75, 0.025, -0.3]}
              onPointerOver={(e) => handlePointerOver(e, 'CPU')}
              onPointerOut={handlePointerOut}
              onClick={(e) => handleClick(e, 'CPU')}
            >
              <mesh>
                <boxGeometry args={[0.55, 0.04, 0.55]} />
                <meshStandardMaterial 
                  color={getHighlightColor('CPU') || '#334155'} 
                  metalness={0.85}
                  roughness={0.2}
                  emissive={getHighlightColor('CPU') || '#000000'}
                  emissiveIntensity={getHighlightColor('CPU') ? 0.9 : 0}
                />
              </mesh>
              <mesh position={[0, 0.022, 0]}>
                <boxGeometry args={[0.3, 0.01, 0.3]} />
                <meshStandardMaterial color="#0284c7" metalness={0.9} emissive="#0284c7" emissiveIntensity={0.3} />
              </mesh>
            </group>

            {/* DEDICATED NVIDIA GEFORCE GTX 1650 GPU */}
            <group 
              position={[0.7, 0.025, -0.3]}
              onPointerOver={(e) => handlePointerOver(e, 'GPU')}
              onPointerOut={handlePointerOut}
              onClick={(e) => handleClick(e, 'GPU')}
            >
              <mesh>
                <boxGeometry args={[0.68, 0.04, 0.68]} />
                <meshStandardMaterial 
                  color={getHighlightColor('GPU') || '#15803d'} 
                  metalness={0.6}
                  roughness={0.4}
                  emissive={getHighlightColor('GPU') || '#15803d'}
                  emissiveIntensity={getHighlightColor('GPU') ? 0.9 : 0.2}
                />
              </mesh>
              <mesh position={[0, 0.022, 0]}>
                <boxGeometry args={[0.38, 0.01, 0.38]} />
                <meshStandardMaterial color="#22c55e" metalness={0.95} emissive="#22c55e" emissiveIntensity={0.4} />
              </mesh>
              {/* VRAM GDDR6 Chips */}
              <mesh position={[-0.24, 0.022, 0]}>
                <boxGeometry args={[0.1, 0.008, 0.18]} />
                <meshStandardMaterial color="#1e293b" />
              </mesh>
              <mesh position={[0.24, 0.022, 0]}>
                <boxGeometry args={[0.1, 0.008, 0.18]} />
                <meshStandardMaterial color="#1e293b" />
              </mesh>
              <mesh position={[0, 0.022, -0.24]}>
                <boxGeometry args={[0.18, 0.008, 0.1]} />
                <meshStandardMaterial color="#1e293b" />
              </mesh>
              <mesh position={[0, 0.022, 0.24]}>
                <boxGeometry args={[0.18, 0.008, 0.1]} />
                <meshStandardMaterial color="#1e293b" />
              </mesh>
            </group>

            {/* Copper Heatpipes */}
            <group position={[0, 0.045, -0.38]}>
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[2.2, 0.02, 0.08]} />
                <meshStandardMaterial color="#d97706" metalness={0.95} roughness={0.15} />
              </mesh>
              <mesh position={[0, 0.01, -0.1]}>
                <boxGeometry args={[1.8, 0.018, 0.06]} />
                <meshStandardMaterial color="#b45309" metalness={0.95} roughness={0.15} />
              </mesh>
            </group>

            {/* Dual DDR4 RAM Slots */}
            <mesh 
              position={[-0.8, 0.025, 0.38]}
              onPointerOver={(e) => handlePointerOver(e, 'RAM')}
              onPointerOut={handlePointerOut}
              onClick={(e) => handleClick(e, 'RAM')}
            >
              <boxGeometry args={[0.9, 0.03, 0.3]} />
              <meshStandardMaterial 
                color={getHighlightColor('RAM') || '#0284c7'} 
                metalness={0.7}
                emissive={getHighlightColor('RAM') || '#000000'}
                emissiveIntensity={getHighlightColor('RAM') ? 0.8 : 0}
              />
            </mesh>

            {/* 512GB M.2 SSD */}
            <mesh 
              position={[0.75, 0.025, 0.38]}
              onPointerOver={(e) => handlePointerOver(e, 'SSD')}
              onPointerOut={handlePointerOut}
              onClick={(e) => handleClick(e, 'SSD')}
            >
              <boxGeometry args={[0.85, 0.03, 0.24]} />
              <meshStandardMaterial 
                color={getHighlightColor('SSD') || '#090d16'} 
                metalness={0.6}
                emissive={getHighlightColor('SSD') || '#000000'}
                emissiveIntensity={getHighlightColor('SSD') ? 0.8 : 0}
              />
            </mesh>

            {/* Wi-Fi Module */}
            <mesh 
              position={[1.45, 0.025, -0.3]}
              onPointerOver={(e) => handlePointerOver(e, 'Wi-Fi module')}
              onPointerOut={handlePointerOut}
              onClick={(e) => handleClick(e, 'Wi-Fi module')}
            >
              <boxGeometry args={[0.3, 0.03, 0.3]} />
              <meshStandardMaterial 
                color={getHighlightColor('Wi-Fi module') || '#cbd5e1'} 
                metalness={0.95}
                emissive={getHighlightColor('Wi-Fi module') || '#000000'}
                emissiveIntensity={getHighlightColor('Wi-Fi module') ? 0.7 : 0}
              />
            </mesh>

            {/* Dual ROG Arc Flow Fans */}
            <group 
              position={[-1.5, 0.02, -0.75]}
              onPointerOver={(e) => handlePointerOver(e, 'Cooling fan')}
              onPointerOut={handlePointerOut}
              onClick={(e) => handleClick(e, 'Cooling fan')}
            >
              <mesh>
                <cylinderGeometry args={[0.45, 0.45, 0.04, 20]} />
                <meshStandardMaterial color="#0b0f19" opacity={0.7} transparent />
              </mesh>
              <mesh ref={fanRefLeft}>
                <cylinderGeometry args={[0.4, 0.4, 0.02, 10]} />
                <meshStandardMaterial 
                  color={getHighlightColor('Cooling fan') || '#475569'} 
                  metalness={0.8}
                  emissive={getHighlightColor('Cooling fan') || '#000000'}
                  emissiveIntensity={getHighlightColor('Cooling fan') ? 0.8 : 0}
                />
              </mesh>
            </group>

            <group 
              position={[1.5, 0.02, -0.75]}
              onPointerOver={(e) => handlePointerOver(e, 'Cooling fan')}
              onPointerOut={handlePointerOut}
              onClick={(e) => handleClick(e, 'Cooling fan')}
            >
              <mesh>
                <cylinderGeometry args={[0.45, 0.45, 0.04, 20]} />
                <meshStandardMaterial color="#0b0f19" opacity={0.7} transparent />
              </mesh>
              <mesh ref={fanRefRight}>
                <cylinderGeometry args={[0.4, 0.4, 0.02, 10]} />
                <meshStandardMaterial 
                  color={getHighlightColor('Cooling fan') || '#475569'} 
                  metalness={0.8}
                  emissive={getHighlightColor('Cooling fan') || '#000000'}
                  emissiveIntensity={getHighlightColor('Cooling fan') ? 0.8 : 0}
                />
              </mesh>
            </group>
          </group>
        )}
      </group>

      {/* ========================================================================= */}
      {/* 2. SCREEN LID GROUP (Rotates dynamically via lidGroupRef) */}
      {/* ========================================================================= */}
      <group 
        ref={lidGroupRef}
        position={[0, 0.08, -1.35]} 
      >
        {/* Outer Lid Shell (Gunmetal Finish) */}
        <RoundedBox 
          args={[4.2, 2.65, 0.08]} 
          radius={0.04} 
          position={[0, 1.32, -0.04]}
        >
          <meshStandardMaterial color="#0f141d" metalness={0.92} roughness={0.3} />
        </RoundedBox>

        {/* Diagonal Slash Line on Lid Top */}
        <mesh position={[0.2, 1.32, -0.082]} rotation={[0, 0, -0.45]}>
          <planeGeometry args={[3.2, 0.015]} />
          <meshStandardMaterial color="#1e293b" roughness={0.2} />
        </mesh>

        {/* ── ILLUMINATED ASUS ROG "EYE" LOGO ON LID REAR ── */}
        <group position={[0.9, 1.5, -0.083]}>
          <mesh rotation={[0, 0, -0.15]}>
            <coneGeometry args={[0.3, 0.45, 3]} />
            <meshStandardMaterial 
              color="#ef4444" 
              emissive="#ef4444" 
              emissiveIntensity={2.0} 
            />
          </mesh>
          <mesh position={[-0.08, -0.02, 0.001]} rotation={[0, 0, 0.35]}>
            <planeGeometry args={[0.18, 0.04]} />
            <meshStandardMaterial color="#0f141d" />
          </mesh>
        </group>

        {/* ── 15.6" 144Hz IPS DISPLAY PANEL WITH ROG STRIX CANVAS TEXTURE ── */}
        <mesh 
          position={[0, 1.32, 0.006]}
          onPointerOver={(e) => handlePointerOver(e, 'Display')}
          onPointerOut={handlePointerOut}
          onClick={(e) => handleClick(e, 'Display')}
        >
          <planeGeometry args={[4.05, 2.5]} />
          <meshStandardMaterial 
            ref={screenMaterialRef}
            map={textureRef.current}
            emissiveMap={textureRef.current}
            emissive="#ffffff"
            emissiveIntensity={0.65}
            roughness={0.2}
          />
        </mesh>

        {/* Thin Display Outer Bezel */}
        <mesh position={[0, 1.32, 0.002]}>
          <planeGeometry args={[4.16, 2.6]} />
          <meshStandardMaterial color="#0a0d14" roughness={0.9} />
        </mesh>

        {/* Bottom Bezel ROG Strix Emblem */}
        <mesh position={[0, 0.14, 0.007]}>
          <planeGeometry args={[0.4, 0.04]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1.0} />
        </mesh>
      </group>
    </group>
  );
}

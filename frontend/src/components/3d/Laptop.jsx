import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';

export default function Laptop({ status, telemetry, selectedComponent, onSelectComponent, inspectInternals, lidAngle = 110 }) {
  const meshRef = useRef();
  const fanRef1 = useRef();
  const fanRef2 = useRef();
  
  // Track hovered component local state
  const [hovered, setHovered] = useState(null);

  // Animated lid angle & float rotation values
  const currentLidAngleRef = useRef(110);
  const lidRotationXRef = useRef(-Math.PI / 8);

  useFrame((state) => {
    // Floating animation
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.05 - 0.2;
    }

    // Smooth lid opening/closing
    const targetLidAngle = lidAngle;
    currentLidAngleRef.current += (targetLidAngle - currentLidAngleRef.current) * 0.08;
    // Map angle (0 to 120) to rotation X: 0 deg = -Math.PI / 2, 110 deg = -Math.PI / 8
    lidRotationXRef.current = -Math.PI / 2 + (currentLidAngleRef.current / 180) * Math.PI * 0.72;

    // Rotate internal fans if active
    const fanSpeed = telemetry.fanSpeed || 0;
    const rotAmount = (fanSpeed / 6000) * 0.6; // Speed coefficient
    if (fanRef1.current) {
      fanRef1.current.rotation.y += rotAmount;
    }
    if (fanRef2.current) {
      fanRef2.current.rotation.y += rotAmount;
    }
  });

  // Highlight color helper depending on selected component or hover state
  const getHighlightColor = (compName) => {
    const isSelected = selectedComponent === compName;
    const isHovered = hovered === compName;
    
    if (!isSelected && !isHovered) return null;

    // Critical/warning states for specific hardware components
    if (compName === 'CPU' && (telemetry.cpuTemp > 85 || status === 'critical')) return '#ef4444';
    if (compName === 'CPU' && (telemetry.cpuTemp > 70 || status === 'warning')) return '#f59e0b';
    if (compName === 'GPU' && (telemetry.gpuTemp > 85 || status === 'critical')) return '#ef4444';
    if (compName === 'GPU' && (telemetry.gpuTemp > 70 || status === 'warning')) return '#f59e0b';
    if (compName === 'Battery' && (telemetry.battery < 20)) return '#ef4444';
    
    return isSelected ? '#38bdf8' : '#60a5fa'; // Blue/Sky highlights
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

  // Status colors for screen emissive state
  let screenColor = '#0b0f19';
  let glowColor = '#38bdf8';
  if (status === 'warning') {
    screenColor = '#2d1500';
    glowColor = '#f59e0b';
  } else if (status === 'critical') {
    screenColor = '#2d000b';
    glowColor = '#ef4444';
  }

  // Base materials configuration
  const baseCoverOpacity = inspectInternals ? 0.15 : 1.0;
  const baseCoverTransparent = inspectInternals;

  return (
    <group ref={meshRef}>
      {/* LAPTOP CHASSIS BASE */}
      <group>
        {/* Bottom Panel Casing */}
        <RoundedBox args={[4, 0.1, 2.8]} radius={0.06} position={[0, -0.06, 0]}>
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
        </RoundedBox>

        {/* Top Cover / Keyboard Bezel (Dynamic Transparency in inspection mode) */}
        <RoundedBox 
          args={[3.98, 0.1, 2.78]} 
          radius={0.05} 
          position={[0, 0.04, 0]}
        >
          <meshStandardMaterial 
            color="#475569" 
            metalness={0.9} 
            roughness={0.4} 
            transparent={baseCoverTransparent} 
            opacity={baseCoverOpacity} 
          />
        </RoundedBox>

        {/* Keyboard Input Surface Area */}
        {!inspectInternals && (
          <mesh 
            position={[0, 0.095, -0.3]} 
            rotation={[-Math.PI / 2, 0, 0]}
            onPointerOver={(e) => handlePointerOver(e, 'Keyboard')}
            onPointerOut={handlePointerOut}
            onClick={(e) => handleClick(e, 'Keyboard')}
          >
            <planeGeometry args={[3.4, 1.3]} />
            <meshStandardMaterial 
              color={getHighlightColor('Keyboard') ? getHighlightColor('Keyboard') : '#0f172a'} 
              roughness={0.7} 
              emissive={getHighlightColor('Keyboard') || '#000000'}
              emissiveIntensity={getHighlightColor('Keyboard') ? 0.6 : 0}
            />
          </mesh>
        )}

        {/* Touchpad Input Surface Area */}
        {!inspectInternals && (
          <mesh 
            position={[0, 0.095, 0.85]} 
            rotation={[-Math.PI / 2, 0, 0]}
            onPointerOver={(e) => handlePointerOver(e, 'Touchpad')}
            onPointerOut={handlePointerOut}
            onClick={(e) => handleClick(e, 'Touchpad')}
          >
            <planeGeometry args={[1.2, 0.7]} />
            <meshStandardMaterial 
              color={getHighlightColor('Touchpad') ? getHighlightColor('Touchpad') : '#334155'} 
              roughness={0.5} 
              emissive={getHighlightColor('Touchpad') || '#000000'}
              emissiveIntensity={getHighlightColor('Touchpad') ? 0.6 : 0}
            />
          </mesh>
        )}

        {/* Charging PD port Cylinder details */}
        <mesh 
          position={[-2.0, 0.02, 0.3]} 
          rotation={[0, 0, Math.PI / 2]}
          onPointerOver={(e) => handlePointerOver(e, 'Charging system')}
          onPointerOut={handlePointerOut}
          onClick={(e) => handleClick(e, 'Charging system')}
        >
          <cylinderGeometry args={[0.06, 0.06, 0.1, 8]} />
          <meshStandardMaterial 
            color={getHighlightColor('Charging system') ? getHighlightColor('Charging system') : '#f59e0b'}
            metalness={0.8}
            emissive={getHighlightColor('Charging system') || '#000000'}
            emissiveIntensity={getHighlightColor('Charging system') ? 0.8 : 0}
          />
        </mesh>

        {/* ========================================================= */}
        {/* INTERNAL DIGITAL TWIN HARDWARE COMPONENTS (Visible if inspectInternals) */}
        {/* ========================================================= */}
        {inspectInternals && (
          <group position={[0, 0, 0]}>
            {/* Green Motherboard PCB */}
            <mesh position={[0, -0.01, -0.2]}>
              <boxGeometry args={[3.6, 0.02, 1.8]} />
              <meshStandardMaterial color="#0f3d1b" roughness={0.8} />
            </mesh>

            {/* Battery Pack */}
            <mesh 
              position={[0, 0.01, 0.9]}
              onPointerOver={(e) => handlePointerOver(e, 'Battery')}
              onPointerOut={handlePointerOut}
              onClick={(e) => handleClick(e, 'Battery')}
            >
              <boxGeometry args={[3.5, 0.05, 0.6]} />
              <meshStandardMaterial 
                color={getHighlightColor('Battery') ? getHighlightColor('Battery') : '#111827'} 
                roughness={0.6}
                emissive={getHighlightColor('Battery') || '#000000'}
                emissiveIntensity={getHighlightColor('Battery') ? 0.7 : 0}
              />
            </mesh>

            {/* CPU System-on-Chip */}
            <mesh 
              position={[-0.8, 0.02, -0.3]}
              onPointerOver={(e) => handlePointerOver(e, 'CPU')}
              onPointerOut={handlePointerOut}
              onClick={(e) => handleClick(e, 'CPU')}
            >
              <boxGeometry args={[0.5, 0.04, 0.5]} />
              <meshStandardMaterial 
                color={getHighlightColor('CPU') ? getHighlightColor('CPU') : '#475569'} 
                metalness={0.7}
                emissive={getHighlightColor('CPU') || '#000000'}
                emissiveIntensity={getHighlightColor('CPU') ? 0.9 : 0}
              />
            </mesh>

            {/* GPU Dedicated Chip */}
            <mesh 
              position={[0.4, 0.02, -0.3]}
              onPointerOver={(e) => handlePointerOver(e, 'GPU')}
              onPointerOut={handlePointerOut}
              onClick={(e) => handleClick(e, 'GPU')}
            >
              <boxGeometry args={[0.6, 0.04, 0.6]} />
              <meshStandardMaterial 
                color={getHighlightColor('GPU') ? getHighlightColor('GPU') : '#475569'} 
                metalness={0.8}
                emissive={getHighlightColor('GPU') || '#000000'}
                emissiveIntensity={getHighlightColor('GPU') ? 0.9 : 0}
              />
            </mesh>

            {/* RAM Stick Module */}
            <mesh 
              position={[-0.8, 0.02, 0.35]}
              onPointerOver={(e) => handlePointerOver(e, 'RAM')}
              onPointerOut={handlePointerOut}
              onClick={(e) => handleClick(e, 'RAM')}
            >
              <boxGeometry args={[0.8, 0.03, 0.2]} />
              <meshStandardMaterial 
                color={getHighlightColor('RAM') ? getHighlightColor('RAM') : '#0284c7'} 
                roughness={0.6}
                emissive={getHighlightColor('RAM') || '#000000'}
                emissiveIntensity={getHighlightColor('RAM') ? 0.7 : 0}
              />
            </mesh>

            {/* NVMe SSD Stick */}
            <mesh 
              position={[0.6, 0.02, 0.35]}
              onPointerOver={(e) => handlePointerOver(e, 'SSD')}
              onPointerOut={handlePointerOut}
              onClick={(e) => handleClick(e, 'SSD')}
            >
              <boxGeometry args={[0.7, 0.03, 0.22]} />
              <meshStandardMaterial 
                color={getHighlightColor('SSD') ? getHighlightColor('SSD') : '#000000'} 
                metalness={0.5}
                emissive={getHighlightColor('SSD') || '#000000'}
                emissiveIntensity={getHighlightColor('SSD') ? 0.7 : 0}
              />
            </mesh>

            {/* Wi-Fi Transceiver Module */}
            <mesh 
              position={[1.3, 0.02, -0.4]}
              onPointerOver={(e) => handlePointerOver(e, 'Wi-Fi module')}
              onPointerOut={handlePointerOut}
              onClick={(e) => handleClick(e, 'Wi-Fi module')}
            >
              <boxGeometry args={[0.3, 0.03, 0.3]} />
              <meshStandardMaterial 
                color={getHighlightColor('Wi-Fi module') ? getHighlightColor('Wi-Fi module') : '#cbd5e1'} 
                metalness={0.9}
                emissive={getHighlightColor('Wi-Fi module') || '#000000'}
                emissiveIntensity={getHighlightColor('Wi-Fi module') ? 0.7 : 0}
              />
            </mesh>

            {/* Cooling Fan Assembly 1 */}
            <group 
              position={[-1.4, 0.015, -0.6]}
              onPointerOver={(e) => handlePointerOver(e, 'Cooling fan')}
              onPointerOut={handlePointerOut}
              onClick={(e) => handleClick(e, 'Cooling fan')}
            >
              {/* Fan housing */}
              <mesh>
                <cylinderGeometry args={[0.42, 0.42, 0.03, 16]} />
                <meshStandardMaterial color="#0f172a" opacity={0.6} transparent />
              </mesh>
              {/* Fan Blades (Rotated dynamically in useFrame) */}
              <mesh ref={fanRef1}>
                <cylinderGeometry args={[0.38, 0.38, 0.01, 8]} />
                <meshStandardMaterial 
                  color={getHighlightColor('Cooling fan') ? getHighlightColor('Cooling fan') : '#64748b'} 
                  roughness={0.9}
                  emissive={getHighlightColor('Cooling fan') || '#000000'}
                  emissiveIntensity={getHighlightColor('Cooling fan') ? 0.7 : 0}
                />
              </mesh>
            </group>

            {/* Cooling Fan Assembly 2 */}
            <group 
              position={[1.4, 0.015, -0.6]}
              onPointerOver={(e) => handlePointerOver(e, 'Cooling fan')}
              onPointerOut={handlePointerOut}
              onClick={(e) => handleClick(e, 'Cooling fan')}
            >
              {/* Fan housing */}
              <mesh>
                <cylinderGeometry args={[0.42, 0.42, 0.03, 16]} />
                <meshStandardMaterial color="#0f172a" opacity={0.6} transparent />
              </mesh>
              {/* Fan Blades */}
              <mesh ref={fanRef2}>
                <cylinderGeometry args={[0.38, 0.38, 0.01, 8]} />
                <meshStandardMaterial 
                  color={getHighlightColor('Cooling fan') ? getHighlightColor('Cooling fan') : '#64748b'} 
                  roughness={0.9}
                  emissive={getHighlightColor('Cooling fan') || '#000000'}
                  emissiveIntensity={getHighlightColor('Cooling fan') ? 0.7 : 0}
                />
              </mesh>
            </group>
          </group>
        )}
      </group>

      {/* ========================================================= */}
      {/* SCREEN LID GROUP (Positioned at Hinges Z=-1.3. Rotates dynamically) */}
      {/* ========================================================= */}
      <group 
        position={[0, 0.08, -1.35]} 
        rotation={[lidRotationXRef.current, 0, 0]}
      >
        {/* Back Lid Metal Cover */}
        <RoundedBox 
          args={[4, 2.5, 0.08]} 
          radius={0.05} 
          position={[0, 1.25, -0.04]}
        >
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
        </RoundedBox>
        
        {/* LCD Panel Active Display Glass */}
        <mesh 
          position={[0, 1.25, 0.005]}
          onPointerOver={(e) => handlePointerOver(e, 'Display')}
          onPointerOut={handlePointerOut}
          onClick={(e) => handleClick(e, 'Display')}
        >
          <planeGeometry args={[3.85, 2.35]} />
          <meshStandardMaterial 
            color={getHighlightColor('Display') ? getHighlightColor('Display') : screenColor} 
            emissive={getHighlightColor('Display') || glowColor}
            emissiveIntensity={getHighlightColor('Display') ? 0.8 : (status === 'normal' ? 0.25 : 0.65)}
          />
        </mesh>

        {/* Outer Plastic Bezel Border */}
        <mesh position={[0, 1.25, 0.001]}>
          <planeGeometry args={[3.96, 2.46]} />
          <meshStandardMaterial color="#0f172a" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
}

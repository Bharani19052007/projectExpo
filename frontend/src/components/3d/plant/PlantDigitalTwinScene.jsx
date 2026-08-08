import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

// Sector Components
import RefinerySector from './RefinerySector';
import StorageDepot from './StorageDepot';
import CoolingAndBoilerUtilities from './CoolingAndBoilerUtilities';
import RoboticAssemblyCell from './RoboticAssemblyCell';
import PipelineNetwork from './PipelineNetwork';
import LogisticsAndFleet from './LogisticsAndFleet';
import SubstationAndPowerGrid from './SubstationAndPowerGrid';
import Asset3DMarker from './Asset3DMarker';

// Sweeping Light Blue Holographic Laser Scan Plane
function HolographicScanPlane() {
  const meshRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const t = clock.getElapsedTime() * 0.35;
      meshRef.current.position.z = Math.sin(t) * 45;
      meshRef.current.material.opacity = 0.2 + Math.sin(t * 2) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 3.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[115, 2.5]} />
      <meshBasicMaterial
        color="#00b8ff"
        transparent
        opacity={0.25}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// Floating Holographic Data Particles
function HolographicParticleField({ count = 200 }) {
  const pointsRef = useRef();

  const [positions] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 110;
      pos[i * 3 + 1] = Math.random() * 24 + 1.0;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 110;
    }
    return [pos];
  }, [count]);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      const posAttr = pointsRef.current.geometry.attributes.position;
      for (let i = 0; i < count; i++) {
        let y = posAttr.getY(i) + 0.025;
        if (y > 26) y = 1.0;
        posAttr.setY(i, y);
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.6}
        color="#00b8ff"
        transparent
        opacity={0.55}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Clean Daylight Engineering Ground & Foundations
function CleanDaylightIndustrialGround() {
  return (
    <group position={[0, -0.05, 0]}>
      {/* Primary Light Concrete Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[160, 160]} />
        <meshStandardMaterial color="#edf4fc" roughness={0.75} metalness={0.1} />
      </mesh>

      {/* Soft Blue Engineering Grid */}
      <gridHelper
        args={[150, 60, '#60a5fa', '#bad5f8']}
        position={[0, 0.01, 0]}
      />

      {/* Concrete Foundation Pads */}
      <mesh position={[-18, 0.02, -16]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[36, 36]} />
        <meshStandardMaterial color="#dfeaf8" roughness={0.8} />
      </mesh>
      <mesh position={[-28, 0.02, 18]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[32, 28]} />
        <meshStandardMaterial color="#e2edf9" roughness={0.8} />
      </mesh>
      <mesh position={[20, 0.02, -18]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[32, 32]} />
        <meshStandardMaterial color="#dfeaf8" roughness={0.8} />
      </mesh>
      <mesh position={[18, 0.02, 16]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 26]} />
        <meshStandardMaterial color="#e2edf9" roughness={0.8} />
      </mesh>
      <mesh position={[34, 0.02, 24]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[22, 20]} />
        <meshStandardMaterial color="#dfeaf8" roughness={0.8} />
      </mesh>

      {/* Internal Concrete Roadways */}
      <mesh position={[0, 0.03, 30]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[130, 8]} />
        <meshStandardMaterial color="#d8e5f5" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.03, -32]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[130, 8]} />
        <meshStandardMaterial color="#d8e5f5" roughness={0.7} />
      </mesh>
      {/* Light Blue Road Center Striping */}
      <mesh position={[0, 0.035, 30]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[120, 0.25]} />
        <meshBasicMaterial color="#3b82f6" opacity={0.6} transparent />
      </mesh>
    </group>
  );
}

// Camera Presets Map
const CAMERA_POSITIONS = {
  overview: { pos: [48, 36, 50], target: [0, 2, 0] },
  refinery: { pos: [-16, 18, -12], target: [-18, 6, -18] },
  storage: { pos: [-26, 16, 26], target: [-28, 4, 18] },
  assembly: { pos: [18, 14, 16], target: [14, 3, 12] },
  utilities: { pos: [24, 18, -22], target: [22, 6, -18] },
  substation: { pos: [36, 18, 28], target: [32, 5, 24] },
  logistics: { pos: [-8, 14, 34], target: [-6, 2, 26] },
  top_down: { pos: [0, 65, 0], target: [0, 0, 0] },
};

// Smooth Camera Controller
function CameraController({ cameraPreset, selectedAsset, isDroneTour, isAutoRotate }) {
  const controlsRef = useRef();

  useFrame(({ camera, clock }) => {
    if (isDroneTour) {
      const t = clock.getElapsedTime() * 0.12;
      const radius = 54;
      const targetX = Math.sin(t) * radius;
      const targetZ = Math.cos(t) * radius;
      const targetY = 30 + Math.sin(t * 0.8) * 6;

      camera.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.04);
      if (controlsRef.current) {
        controlsRef.current.target.lerp(new THREE.Vector3(0, 3, 0), 0.04);
        controlsRef.current.update();
      }
      return;
    }

    if (selectedAsset && selectedAsset.position) {
      const [ax, ay, az] = selectedAsset.position;
      const targetPos = new THREE.Vector3(ax + 12, ay + 9, az + 13);
      const targetLook = new THREE.Vector3(ax, ay + 2, az);

      camera.position.lerp(targetPos, 0.05);
      if (controlsRef.current) {
        controlsRef.current.target.lerp(targetLook, 0.05);
        controlsRef.current.update();
      }
      return;
    }

    const preset = CAMERA_POSITIONS[cameraPreset] || CAMERA_POSITIONS.overview;
    const targetPos = new THREE.Vector3(...preset.pos);
    const targetLook = new THREE.Vector3(...preset.target);

    camera.position.lerp(targetPos, 0.05);
    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetLook, 0.05);
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.06}
      maxPolarAngle={Math.PI / 2 - 0.05}
      minDistance={8}
      maxDistance={125}
      autoRotate={isAutoRotate}
      autoRotateSpeed={0.6}
    />
  );
}

export default function PlantDigitalTwinScene({
  assets = [],
  selectedAsset,
  onSelectAsset,
  hoveredAsset,
  onHoverAsset,
  viewMode = 'CAD',
  cameraPreset = 'overview',
  showMarkers = true,
  isDroneTour = false,
  isAutoRotate = false,
}) {
  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Canvas
        shadows
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
        }}
      >
        <PerspectiveCamera makeDefault position={[48, 36, 50]} fov={45} />

        {/* Crisp Daylight Sky & Ambient Atmospheric Fog */}
        <color attach="background" args={['#e4f1fd']} />
        <fog attach="fog" args={['#e4f1fd', 45, 140]} />

        {/* Ambient & Sun Directional Lighting */}
        <ambientLight intensity={1.4} color="#f0f7ff" />
        <directionalLight
          position={[45, 60, 35]}
          intensity={2.2}
          color="#ffffff"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={140}
          shadow-camera-left={-60}
          shadow-camera-right={60}
          shadow-camera-top={60}
          shadow-camera-bottom={-60}
          shadow-bias={-0.0001}
        />
        {/* Soft Blue Daylight Fill & Rim Lights */}
        <directionalLight position={[-30, 40, -30]} intensity={0.9} color="#dbeafe" />
        <pointLight position={[-20, 20, -20]} intensity={1.2} color="#00b8ff" distance={60} />
        <pointLight position={[20, 20, 20]} intensity={1.0} color="#60a5fa" distance={60} />

        {/* Sweeping Blue Holographic Scan & Particle Field */}
        <HolographicScanPlane />
        <HolographicParticleField count={180} />

        {/* 3D Smart Factory Sectors */}
        <CleanDaylightIndustrialGround />
        <RefinerySector
          viewMode={viewMode}
          selectedAsset={selectedAsset}
          onSelectAsset={onSelectAsset}
        />
        <StorageDepot
          viewMode={viewMode}
          selectedAsset={selectedAsset}
          onSelectAsset={onSelectAsset}
        />
        <CoolingAndBoilerUtilities
          viewMode={viewMode}
          selectedAsset={selectedAsset}
          onSelectAsset={onSelectAsset}
        />
        <RoboticAssemblyCell
          viewMode={viewMode}
          selectedAsset={selectedAsset}
          onSelectAsset={onSelectAsset}
        />
        <PipelineNetwork
          viewMode={viewMode}
          selectedAsset={selectedAsset}
          onSelectAsset={onSelectAsset}
        />
        <LogisticsAndFleet
          viewMode={viewMode}
          selectedAsset={selectedAsset}
          onSelectAsset={onSelectAsset}
        />
        <SubstationAndPowerGrid
          viewMode={viewMode}
          selectedAsset={selectedAsset}
          onSelectAsset={onSelectAsset}
        />

        {/* 3D Floating Spatial Markers */}
        {showMarkers &&
          assets.map((asset) => (
            <Asset3DMarker
              key={asset.id}
              asset={asset}
              isSelected={selectedAsset?.id === asset.id}
              isHovered={hoveredAsset?.id === asset.id}
              onClick={onSelectAsset}
              onHover={onHoverAsset}
            />
          ))}

        {/* Smooth Camera Controller */}
        <CameraController
          cameraPreset={cameraPreset}
          selectedAsset={selectedAsset}
          isDroneTour={isDroneTour}
          isAutoRotate={isAutoRotate}
        />
      </Canvas>
    </div>
  );
}

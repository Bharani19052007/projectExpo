import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sky } from '@react-three/drei';
import * as THREE from 'three';

import IndustrialCampusEnvironment from './IndustrialCampusEnvironment';
import CampusMachineDigitalTwins from './CampusMachineDigitalTwins';
import HologramVibrationLayer from './HologramVibrationLayer';
import Asset3DMarker from './Asset3DMarker';

// Procedural Plant Sectors
import RefinerySector from './RefinerySector';
import RoboticAssemblyCell from './RoboticAssemblyCell';
import CoolingAndBoilerUtilities from './CoolingAndBoilerUtilities';
import PipelineNetwork from './PipelineNetwork';
import SubstationAndPowerGrid from './SubstationAndPowerGrid';
import StorageDepot from './StorageDepot';
import LogisticsAndFleet from './LogisticsAndFleet';

import { campusBuildings } from '../../../data/plantAssetsData';

// Camera Target presets for 12 Campus Buildings & 5-Level Hierarchy
const cameraHierarchyPresets = {
  overview: { position: [0, 24, 32], target: [0, 1.5, 0] },
  production_hall: { position: [-16, 12, 18], target: [-16, 1.5, -2] },
  assembly_line: { position: [18, 10, 22], target: [18, 1.5, 6] },
  cnc_workshop: { position: [-24, 8, 8], target: [-24, 1.5, -2] },
  process_plant: { position: [42, 12, 8], target: [42, 1.5, -8] },
  utilities: { position: [18, 10, -6], target: [18, 1.5, -22] },
  compressor_house: { position: [22, 8, -10], target: [22, 1.5, -22] },
  power_room: { position: [44, 14, 28], target: [44, 3, 18] },
  warehouse: { position: [-46, 18, 32], target: [-46, 5, 18] },
  quality_lab: { position: [-16, 12, -14], target: [-16, 3, -26] },
  maintenance_shop: { position: [-42, 12, 2], target: [-42, 3, -10] },
  control_hq: { position: [-42, 15, -18], target: [-42, 4, -30] },
  logistics: { position: [18, 14, 44], target: [18, 3, 32] },
};

// Event-Driven Hierarchical Camera Controller
function CameraController({
  selectedAsset,
  selectedComponent,
  selectedBuildingId,
  enteredBuildingId,
  cameraPreset = 'overview',
  isDroneTour = false,
  fitTrigger = 0,
}) {
  const { camera } = useThree();
  const controlsRef = useRef();

  const isTransitioningRef = useRef(false);
  const transitionStartRef = useRef(0);
  const transitionDuration = 1.1; // seconds

  const startPosRef = useRef(new THREE.Vector3());
  const startTargetRef = useRef(new THREE.Vector3());
  const endPosRef = useRef(new THREE.Vector3());
  const endTargetRef = useRef(new THREE.Vector3());

  // Initiate camera transition when target changes
  useEffect(() => {
    if (!controlsRef.current) return;

    startPosRef.current.copy(camera.position);
    startTargetRef.current.copy(controlsRef.current.target);

    // 1. Component Focus (Level 5)
    if (selectedComponent && selectedAsset?.position) {
      const [ax, ay, az] = selectedAsset.position;
      endTargetRef.current.set(ax, ay + 0.5, az);
      endPosRef.current.set(ax + 2.4, ay + 1.6, az + 2.5);
    }
    // 2. Machine Focus (Level 4)
    else if (selectedAsset && selectedAsset.position) {
      const [ax, ay, az] = selectedAsset.position;
      endTargetRef.current.set(ax, ay + 1.0, az);
      endPosRef.current.set(ax + 4.5, ay + 3.2, az + 5.0);
    }
    // 3. Entered Building Focus (Level 3 Interior)
    else if (enteredBuildingId) {
      const bld = campusBuildings.find((b) => b.id === enteredBuildingId);
      if (bld) {
        const [bx, , bz] = bld.position;
        endTargetRef.current.set(bx, 1.5, bz);
        endPosRef.current.set(bx + 6, 12, bz + 16);
      }
    }
    // 4. Building Selected Focus (Level 2)
    else if (selectedBuildingId) {
      const bld = campusBuildings.find((b) => b.id === selectedBuildingId);
      if (bld) {
        endPosRef.current.set(...bld.cameraView);
        endTargetRef.current.set(...bld.cameraFocus);
      }
    }
    // 5. Sector / Overview Presets (Level 1)
    else {
      const targetPreset = cameraHierarchyPresets[cameraPreset] || cameraHierarchyPresets.overview;
      endPosRef.current.set(...targetPreset.position);
      endTargetRef.current.set(...targetPreset.target);
    }

    transitionStartRef.current = performance.now();
    isTransitioningRef.current = true;
  }, [selectedAsset, selectedComponent, selectedBuildingId, enteredBuildingId, cameraPreset, fitTrigger]);

  // Smooth interpolation frame loop
  useFrame((state) => {
    // 360 Drone Tour Orbit
    if (isDroneTour && controlsRef.current && !isTransitioningRef.current) {
      const t = state.clock.getElapsedTime() * 0.12;
      camera.position.x = Math.sin(t) * 65;
      camera.position.z = Math.cos(t) * 65;
      camera.position.y = 36 + Math.sin(t * 2) * 4;
      controlsRef.current.target.set(0, 2, 0);
      controlsRef.current.update();
      return;
    }

    if (!isTransitioningRef.current || !controlsRef.current) return;

    const elapsed = (performance.now() - transitionStartRef.current) / 1000;
    const progress = Math.min(elapsed / transitionDuration, 1.0);

    // Cubic ease-out smooth step
    const ease = 1 - Math.pow(1 - progress, 3);

    camera.position.lerpVectors(startPosRef.current, endPosRef.current, ease);
    controlsRef.current.target.lerpVectors(startTargetRef.current, endTargetRef.current, ease);
    controlsRef.current.update();

    if (progress >= 1.0) {
      isTransitioningRef.current = false;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.06}
      maxPolarAngle={Math.PI / 2 - 0.04}
      minDistance={2}
      maxDistance={220}
      target={[0, 1.5, 0]}
    />
  );
}

export default function PlantDigitalTwinScene({
  assets = [],
  selectedAsset,
  selectedComponent,
  onSelectAsset,
  onSelectComponent,
  hoveredAsset,
  onHoverAsset,
  selectedBuildingId,
  onSelectBuilding,
  viewMode = 'OVERVIEW',
  cameraPreset = 'overview',
  showMarkers = true,
  isDroneTour = false,
  isHologramVibration = false,
  vibrationMetric = 'velocity',
  amplitudeScale = 1.0,
  fitTrigger = 0,
}) {
  const [enteredBuildingId, setEnteredBuildingId] = useState(null);

  const activeBuildingObj = campusBuildings.find(
    (b) => b.id === (selectedBuildingId || enteredBuildingId || selectedAsset?.buildingId)
  );

  return (
    <div className="w-full h-full relative select-none">
      {/* ── Breadcrumb Hierarchy Trail Navigation Bar ── */}
      <div className="absolute top-16 left-6 z-30 pointer-events-auto flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 text-xs font-semibold text-white shadow-xl">
        <button
          onClick={() => {
            onSelectBuilding?.(null);
            onSelectAsset?.(null);
            onSelectComponent?.(null);
            setEnteredBuildingId(null);
          }}
          className="hover:text-cyan-400 transition-colors uppercase tracking-wider text-slate-300 font-bold"
        >
          CAMPUS
        </button>

        {(selectedBuildingId || enteredBuildingId || selectedAsset) && (
          <>
            <span className="text-cyan-500/60">/</span>
            <button
              onClick={() => {
                onSelectAsset?.(null);
                onSelectComponent?.(null);
              }}
              className="hover:text-cyan-400 transition-colors uppercase tracking-wider text-cyan-200"
            >
              {activeBuildingObj?.name || 'MANUFACTURING HALL'}
            </button>
          </>
        )}

        {selectedAsset && (
          <>
            <span className="text-cyan-500/60">/</span>
            <button
              onClick={() => onSelectComponent?.(null)}
              className="hover:text-cyan-400 transition-colors uppercase tracking-wider text-cyan-400 font-extrabold"
            >
              {selectedAsset.id}
            </button>
          </>
        )}

        {selectedComponent && (
          <>
            <span className="text-cyan-500/60">/</span>
            <span className="text-amber-400 uppercase tracking-wider font-extrabold">
              {selectedComponent.name || selectedComponent.id}
            </span>
          </>
        )}
      </div>

      {/* ── Interactive Enter Building / Roof Reveal Action Button ── */}
      {selectedBuildingId && !enteredBuildingId && (
        <div className="absolute top-28 left-6 z-30 pointer-events-auto">
          <button
            onClick={() => setEnteredBuildingId(selectedBuildingId)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-500/30 hover:bg-cyan-400 transition-all transform hover:scale-105 active:scale-95"
          >
            <span>ENTER BUILDING (ROOF REVEAL)</span>
          </button>
        </div>
      )}
      {enteredBuildingId && (
        <div className="absolute top-28 left-6 z-30 pointer-events-auto">
          <button
            onClick={() => setEnteredBuildingId(null)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-cyan-400 border border-cyan-500/40 font-bold text-xs shadow-lg hover:bg-slate-700 transition-all"
          >
            <span>EXIT INTERIOR (ROOF REVEAL ACTIVE)</span>
          </button>
        </div>
      )}

      <Canvas
        camera={{ position: [0, 24, 32], fov: 42, near: 0.5, far: 650 }}
        shadows={!isHologramVibration}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: isHologramVibration ? 1.2 : 1.18,
          preserveDrawingBuffer: false,
          failIfMajorPerformanceCaveat: false
        }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener('webglcontextlost', (e) => e.preventDefault(), false);
        }}
      >
        {isHologramVibration ? (
          /* Dark Hologram Cybernetic Lighting & Space */
          <>
            <color attach="background" args={['#020617']} />
            <fog attach="fog" args={['#020617', 140, 480]} />
            <ambientLight color="#0f172a" intensity={0.8} />
            <directionalLight position={[50, 80, 40]} color="#38bdf8" intensity={1.8} />
            <pointLight position={[0, 20, 0]} color="#00c2ff" intensity={2.5} distance={120} />
          </>
        ) : (
          /* ── Realistic Sunny Daytime Industrial Sky & Atmosphere ─── */
          <>
            <color attach="background" args={['#87B8D4']} />
            <fog attach="fog" args={['#C9D8E8', 220, 500]} />

            <Sky
              distance={450000}
              sunPosition={[70, 55, 45]}
              inclination={0.52}
              azimuth={0.22}
              mieCoefficient={0.003}
              mieDirectionalG={0.82}
              rayleigh={0.45}
              turbidity={2.2}
            />

            <ambientLight color="#7aaabb" intensity={0.55} />
            <hemisphereLight skyColor="#87CEEB" groundColor="#7B8E6E" intensity={0.72} />

            <directionalLight
              position={[70, 90, 55]}
              color="#FFF8E7"
              intensity={2.5}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              shadow-camera-near={10}
              shadow-camera-far={320}
              shadow-camera-left={-100}
              shadow-camera-right={100}
              shadow-camera-top={100}
              shadow-camera-bottom={-100}
              shadow-bias={-0.0002}
            />

            <directionalLight position={[-40, 30, -30]} color="#C8DCF0" intensity={0.4} />
          </>
        )}

        {/* 5-Level Camera Navigation Controller */}
        <CameraController
          selectedAsset={selectedAsset}
          selectedComponent={selectedComponent}
          selectedBuildingId={selectedBuildingId}
          enteredBuildingId={enteredBuildingId}
          cameraPreset={cameraPreset}
          isDroneTour={isDroneTour}
          fitTrigger={fitTrigger}
        />

        <Suspense fallback={null}>
          {/* 1. Master Industrial Campus Environment (Buildings, Roof Cutaways, Roads, Vehicles) */}
          <IndustrialCampusEnvironment
            selectedBuildingId={selectedBuildingId}
            onSelectBuilding={onSelectBuilding}
            viewMode={viewMode}
            isCutawayActive={!!selectedBuildingId || !!enteredBuildingId || viewMode === 'FLOOR 1' || isHologramVibration}
            enteredBuildingId={enteredBuildingId}
          />

          {/* 2. Vivid Physical Machines with Cyan Digital Twin Overlays */}
          <CampusMachineDigitalTwins
            assets={assets}
            selectedAssetId={selectedAsset?.id}
            selectedComponent={selectedComponent}
            onSelectComponent={onSelectComponent}
            hoveredAssetId={hoveredAsset?.id}
            onSelectAsset={onSelectAsset}
            onHoverAsset={onHoverAsset}
            viewMode={viewMode}
            isHologramVibration={isHologramVibration}
          />

          {/* 3. Integrated Procedural Sectors across Campus Zones */}
          <group position={[42, 0, -8]}>
            <RefinerySector
              selectedAsset={selectedAsset}
              onSelectAsset={onSelectAsset}
              hoveredAsset={hoveredAsset}
              onHoverAsset={onHoverAsset}
              viewMode={isHologramVibration ? 'HOLOGRAM' : 'CAD'}
            />
          </group>

          <group position={[18, 0, 6]}>
            <RoboticAssemblyCell
              selectedAsset={selectedAsset}
              onSelectAsset={onSelectAsset}
              hoveredAsset={hoveredAsset}
              onHoverAsset={onHoverAsset}
              viewMode={isHologramVibration ? 'HOLOGRAM' : 'CAD'}
            />
          </group>

          <group position={[18, 0, -22]}>
            <CoolingAndBoilerUtilities
              selectedAsset={selectedAsset}
              onSelectAsset={onSelectAsset}
              hoveredAsset={hoveredAsset}
              onHoverAsset={onHoverAsset}
              viewMode={isHologramVibration ? 'HOLOGRAM' : 'CAD'}
            />
          </group>

          <group position={[44, 0, 18]}>
            <SubstationAndPowerGrid
              selectedAsset={selectedAsset}
              onSelectAsset={onSelectAsset}
              hoveredAsset={hoveredAsset}
              onHoverAsset={onHoverAsset}
              viewMode={isHologramVibration ? 'HOLOGRAM' : 'CAD'}
            />
          </group>

          <group position={[-46, 0, 18]}>
            <StorageDepot
              selectedAsset={selectedAsset}
              onSelectAsset={onSelectAsset}
              hoveredAsset={hoveredAsset}
              onHoverAsset={onHoverAsset}
              viewMode={isHologramVibration ? 'HOLOGRAM' : 'CAD'}
            />
          </group>

          <group position={[18, 0, 32]}>
            <LogisticsAndFleet
              selectedAsset={selectedAsset}
              onSelectAsset={onSelectAsset}
              hoveredAsset={hoveredAsset}
              onHoverAsset={onHoverAsset}
              viewMode={isHologramVibration ? 'HOLOGRAM' : 'CAD'}
            />
          </group>

          <PipelineNetwork
            selectedAsset={selectedAsset}
            onSelectAsset={onSelectAsset}
            hoveredAsset={hoveredAsset}
            onHoverAsset={onHoverAsset}
            viewMode={isHologramVibration ? 'HOLOGRAM' : 'CAD'}
          />

          {/* 4. DEDICATED 3D HOLOGRAM VIBRATION LAYER */}
          {isHologramVibration && (
            <HologramVibrationLayer
              assets={assets}
              activeMetric={vibrationMetric}
              amplitudeScale={amplitudeScale}
            />
          )}

          {/* 5. In-Scene Digital Twin Spatial Badges */}
          {showMarkers &&
            assets.map((asset) => (
              <Asset3DMarker
                key={asset.id}
                asset={asset}
                isSelected={selectedAsset?.id === asset.id}
                isHovered={hoveredAsset?.id === asset.id}
                onClick={onSelectAsset}
              />
            ))}
        </Suspense>
      </Canvas>
    </div>
  );
}

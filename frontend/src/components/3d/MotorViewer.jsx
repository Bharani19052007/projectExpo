import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import { 
  RotateCw, 
  RefreshCw, 
  AlertCircle, 
  Eye, 
  Activity, 
  Box, 
  Layers, 
  Flame, 
  AlertTriangle, 
  Sparkles,
  ZoomIn,
  ZoomOut,
  Maximize2
} from 'lucide-react';
import * as THREE from 'three';
import MachineModelSelector from './machines/MachineModelSelector';
import Loader from './Loader';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("3D Canvas Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 p-6 rounded-2xl text-center border border-red-800 min-h-[400px]">
          <div className="w-12 h-12 rounded-2xl bg-red-950 text-red-400 flex items-center justify-center mb-3 border border-red-800">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white">
            Unable to render 3D Industrial Machine Canvas
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mt-1">
            An error occurred while loading the WebGL 3D graphics context.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-4 px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-semibold hover:bg-cyan-500 transition-colors"
          >
            Retry Loading
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Smooth camera motion controller: animates smoothly to target component on selection change,
// then releases camera control so the user can freely zoom in/out, orbit, and pan without snap-back!
function SmoothCameraController({ selectedComponent, isDigitalTwinView, controlsRef, initialCameraPos, initialTarget }) {
  const { camera } = useThree();
  const targetCamPos = useRef(new THREE.Vector3(...initialCameraPos));
  const targetLookAt = useRef(new THREE.Vector3(...initialTarget));
  const isTransitioning = useRef(false);
  const transitionTime = useRef(0);
  const prevCompId = useRef(null);
  const prevTwinView = useRef(isDigitalTwinView);

  // Trigger smooth transition only when component selection or twin mode changes
  useEffect(() => {
    const compId = selectedComponent?.id || null;
    if (compId !== prevCompId.current || isDigitalTwinView !== prevTwinView.current) {
      prevCompId.current = compId;
      prevTwinView.current = isDigitalTwinView;

      if (selectedComponent && Array.isArray(selectedComponent.position3d) && selectedComponent.position3d.length >= 3) {
        const [tx, ty, tz] = selectedComponent.position3d;
        if (isDigitalTwinView) {
          // Keep both physical and holographic twin framed in dual view
          targetLookAt.current.set(0, ty * 0.5 + 0.2, 0);
          targetCamPos.current.set(0, 2.0, 8.2);
        } else {
          // In single view, frame the selected component smoothly
          const cameraOffset = (Array.isArray(selectedComponent.cameraOffset) && selectedComponent.cameraOffset.length >= 3)
            ? selectedComponent.cameraOffset
            : [tx + 1.2, ty + 0.8, tz + 4.2];
          const [cx, cy, cz] = cameraOffset;
          targetLookAt.current.set(tx, ty + 0.2, tz);
          targetCamPos.current.set(cx, cy, cz);
        }
      } else {
        const defaultCamX = 0;
        const defaultCamY = isDigitalTwinView ? 2.2 : 1.8;
        const defaultCamZ = isDigitalTwinView ? 9.2 : 6.4;
        targetLookAt.current.set(0, 0.2, 0);
        targetCamPos.current.set(defaultCamX, defaultCamY, defaultCamZ);
      }

      isTransitioning.current = true;
      transitionTime.current = 0;
    }
  }, [selectedComponent, isDigitalTwinView]);

  // Stop camera transition if the user manually interacts with controls (mouse wheel zoom, drag orbit)
  useEffect(() => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;

    const handleStart = () => {
      isTransitioning.current = false;
    };

    controls.addEventListener('start', handleStart);
    return () => {
      controls.removeEventListener('start', handleStart);
    };
  }, [controlsRef]);

  useFrame((_, delta) => {
    if (!controlsRef.current || !isTransitioning.current) return;

    transitionTime.current += delta;
    const t = Math.min(1, transitionTime.current * 3.5); // Fast smooth cubic ease
    const easeT = 1 - Math.pow(1 - t, 3);

    camera.position.lerp(targetCamPos.current, 0.15);
    controlsRef.current.target.lerp(targetLookAt.current, 0.15);
    controlsRef.current.update();

    if (camera.position.distanceTo(targetCamPos.current) < 0.05 || transitionTime.current > 1.2) {
      isTransitioning.current = false;
    }
  });

  return null;
}

export default function MotorViewer({ 
  viewMode = 'CAD', 
  setViewMode,
  selectedComponent, 
  setSelectedComponent,
  isInspectOpen,
  setIsInspectOpen,
  isDigitalTwinView = true,
  setIsDigitalTwinView,
  isSimulatingFailure,
  setIsSimulatingFailure,
  activeMachineName = "Siemens Unit 1 Industrial Machine",
  selectedMachineId = "SIEM-UNIT1-2026",
  components = [],
  telemetry = null
}) {
  const controlsRef = useRef(null);
  const [autoRotate, setAutoRotate] = useState(false);

  const initialCameraPos = isDigitalTwinView ? [0, 2.2, 9.2] : [0, 1.8, 6.4];
  const initialTarget = [0, 0.2, 0];

  const handleResetCamera = () => {
    setSelectedComponent(null);
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0.2, 0);
      controlsRef.current.object.position.set(...initialCameraPos);
      controlsRef.current.update();
    }
  };

  const handleZoomIn = () => {
    if (controlsRef.current) {
      const camera = controlsRef.current.object;
      const target = controlsRef.current.target;
      const dir = new THREE.Vector3().subVectors(target, camera.position).normalize();
      camera.position.addScaledVector(dir, 1.2);
      controlsRef.current.update();
    }
  };

  const handleZoomOut = () => {
    if (controlsRef.current) {
      const camera = controlsRef.current.object;
      const target = controlsRef.current.target;
      const dir = new THREE.Vector3().subVectors(target, camera.position).normalize();
      camera.position.addScaledVector(dir, -1.2);
      controlsRef.current.update();
    }
  };

  return (
    <div 
      className="relative w-full h-full min-h-[540px] rounded-2xl bg-[#080d19] border border-slate-800 shadow-2xl overflow-hidden flex flex-col justify-between select-none"
      onDoubleClick={handleResetCamera}
    >
      {/* Dynamic Cyberpunk Blueprint Grid Effect */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none" 
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.15) 0%, transparent 70%), linear-gradient(rgba(56, 189, 248, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.05) 1px, transparent 1px)',
          backgroundSize: '100% 100%, 32px 32px, 32px 32px'
        }}
      />

      {/* Top Floating Action Controls */}
      <div className="relative z-10 p-3 flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
        
        {/* Left Title Badge */}
        <div className="flex items-center gap-2 bg-[#0f172a]/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700 shadow-md text-xs font-bold text-white">
          <div className={`w-2.5 h-2.5 rounded-full ${isSimulatingFailure ? 'bg-red-500 animate-ping' : 'bg-cyan-400 animate-pulse'}`} />
          <span className="truncate max-w-xs">{activeMachineName}</span>
        </div>

        {/* Center/Right Control Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* DIGITAL TWIN VIEW TOGGLE BUTTON */}
          <button
            onClick={() => setIsDigitalTwinView(!isDigitalTwinView)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md ${
              isDigitalTwinView
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 border border-cyan-300 font-extrabold shadow-cyan-500/20'
                : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700'
            }`}
            title="Toggle Holographic Digital Twin Split View"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isDigitalTwinView ? 'text-slate-950 animate-spin' : 'text-cyan-400'}`} style={{ animationDuration: '8s' }} />
            <span>Digital Twin Split</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isDigitalTwinView ? 'bg-slate-950 text-cyan-300' : 'bg-slate-800 text-slate-400'}`}>
              {isDigitalTwinView ? 'DUAL' : 'SINGLE'}
            </span>
          </button>

          {/* INSPECT COMPONENTS BUTTON */}
          <button
            onClick={() => setIsInspectOpen(!isInspectOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md ${
              isInspectOpen
                ? 'bg-slate-800 text-white border border-slate-600'
                : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>Component Tree</span>
          </button>

          {/* SIMULATE FAILURE BUTTON */}
          <button
            onClick={() => setIsSimulatingFailure(!isSimulatingFailure)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md ${
              isSimulatingFailure
                ? 'bg-red-600 text-white border border-red-500 animate-pulse'
                : 'bg-slate-900/90 hover:bg-red-950/60 text-red-400 border border-red-800/80'
            }`}
            title="Simulate Subsystem Failure Anomaly"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{isSimulatingFailure ? 'Stop Simulation' : 'Simulate Fault'}</span>
          </button>

          {/* Reset View Button */}
          <button
            onClick={handleResetCamera}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold shadow-sm transition-all"
            title="Reset Camera Target"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Reset</span>
          </button>

          {/* Auto-Rotate Toggle */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all border shadow-sm ${
              autoRotate
                ? 'bg-cyan-600 text-slate-950 border-cyan-400 font-bold'
                : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border-slate-700'
            }`}
            title="Toggle Auto Rotation"
          >
            <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
          </button>

        </div>
      </div>

      {/* Floating On-Screen Zoom Controls Overlay */}
      <div className="absolute right-4 bottom-14 z-20 flex flex-col gap-1.5 pointer-events-auto">
        <button
          onClick={handleZoomIn}
          className="w-8 h-8 rounded-xl bg-slate-900/90 hover:bg-cyan-600 hover:text-slate-950 text-white border border-slate-700 flex items-center justify-center shadow-lg transition-all"
          title="Zoom In (Scroll Up)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-8 h-8 rounded-xl bg-slate-900/90 hover:bg-cyan-600 hover:text-slate-950 text-white border border-slate-700 flex items-center justify-center shadow-lg transition-all"
          title="Zoom Out (Scroll Down)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetCamera}
          className="w-8 h-8 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center shadow-lg transition-all"
          title="Fit to Screen"
        >
          <Maximize2 className="w-4 h-4 text-cyan-400" />
        </button>
      </div>

      {/* Synchronized 3D Canvas Viewport */}
      <div className="absolute inset-0 z-0">
        <ErrorBoundary>
          <Canvas
            shadows
            gl={{ 
              antialias: true, 
              alpha: true, 
              powerPreference: 'high-performance',
              preserveDrawingBuffer: false,
              failIfMajorPerformanceCaveat: false
            }}
            onCreated={({ gl }) => {
              gl.domElement.addEventListener('webglcontextlost', (event) => {
                event.preventDefault();
                console.warn('[MotorViewer] WebGL Context lost. Automatic recovery initiated...');
              }, false);
              gl.domElement.addEventListener('webglcontextrestored', () => {
                console.info('[MotorViewer] WebGL Context restored successfully.');
              }, false);
            }}
            className="w-full h-full cursor-grab active:cursor-grabbing"
          >
            <color attach="background" args={['#080e1a']} />

            <ambientLight intensity={1.5} />
            <directionalLight
              position={[12, 20, 12]}
              intensity={2.0}
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
              shadow-bias={-0.0001}
            />
            <directionalLight position={[-12, 10, -12]} intensity={0.9} color="#38bdf8" />
            <directionalLight position={[0, -10, 10]} intensity={0.4} color="#0284c7" />

            <PerspectiveCamera 
              makeDefault 
              position={initialCameraPos} 
              fov={45} 
              near={0.05}
              far={100}
            />

            <OrbitControls
              ref={controlsRef}
              makeDefault
              enableDamping={true}
              dampingFactor={0.08}
              minDistance={0.3}
              maxDistance={35}
              target={initialTarget}
              autoRotate={autoRotate}
              autoRotateSpeed={1.5}
              enablePan={true}
              enableZoom={true}
              zoomSpeed={1.2}
              rotateSpeed={0.8}
            />

            <SmoothCameraController
              selectedComponent={selectedComponent}
              isDigitalTwinView={isDigitalTwinView}
              controlsRef={controlsRef}
              initialCameraPos={initialCameraPos}
              initialTarget={initialTarget}
            />

            {/* Glowing Ground Shadow Plane */}
            <ContactShadows
              position={[0, -0.95, 0]}
              opacity={0.6}
              scale={20}
              blur={2.5}
              far={6}
              color="#0284c7"
            />

            <Suspense fallback={<Loader />}>
              <Environment preset="city" />
              
              {/* IF DIGITAL TWIN VIEW IS OFF: Render 1 Single Physical Machine Centered */}
              {!isDigitalTwinView && (
                <group position={[0, 0, 0]}>
                  <MachineModelSelector 
                    machineId={selectedMachineId}
                    isHologram={false}
                    viewMode={viewMode}
                    selectedComponent={selectedComponent}
                    setSelectedComponent={setSelectedComponent}
                    isSimulatingFailure={isSimulatingFailure}
                    components={components}
                    telemetry={telemetry}
                  />
                </group>
              )}

              {/* IF DIGITAL TWIN VIEW IS ON: Render Left (Real Machine) + Right (Blue Holographic Twin) */}
              {isDigitalTwinView && (
                <group position={[0, 0, 0]}>
                  
                  {/* LEFT MODEL: Physical Real Machine */}
                  <group position={[-2.8, 0, 0]}>
                    <MachineModelSelector 
                      machineId={selectedMachineId}
                      isHologram={false}
                      viewMode={viewMode}
                      selectedComponent={selectedComponent}
                      setSelectedComponent={setSelectedComponent}
                      isSimulatingFailure={isSimulatingFailure}
                      components={components}
                      telemetry={telemetry}
                    />
                  </group>

                  {/* RIGHT MODEL: Identical Synchronized Blue Holographic Digital Twin */}
                  <group position={[2.8, 0, 0]}>
                    <MachineModelSelector 
                      machineId={selectedMachineId}
                      isHologram={true}
                      viewMode={viewMode}
                      selectedComponent={selectedComponent}
                      setSelectedComponent={setSelectedComponent}
                      isSimulatingFailure={isSimulatingFailure}
                      components={components}
                      telemetry={telemetry}
                    />
                  </group>

                </group>
              )}

            </Suspense>
          </Canvas>
        </ErrorBoundary>
      </div>

      {/* Bottom Layout Viewport Banner */}
      <div className="relative z-10 p-3 pointer-events-none flex items-center justify-between text-[11px] text-slate-400 bg-gradient-to-t from-[#080d19] via-[#080d19]/80 to-transparent">
        <div className="flex items-center gap-3 font-medium">
          <span>• Orbit: Drag Left Click</span>
          <span>• Zoom: Mouse Wheel or (+ / -)</span>
          <span>• Pan: Right Click Drag</span>
          <span>• Double-click: Reset</span>
        </div>
        
        {/* Dynamic Status Indicator */}
        <div className="flex items-center gap-2">
          {isDigitalTwinView && (
            <div className="flex items-center gap-3 font-mono text-[10px] bg-slate-900/90 px-3 py-1 rounded-xl border border-slate-700 shadow-md">
              <span className="font-bold text-slate-300 uppercase">LEFT: Physical CAD Machine</span>
              <span className="text-slate-600">|</span>
              <span className="font-bold text-cyan-400 uppercase">RIGHT: Holographic Twin</span>
            </div>
          )}
          {isSimulatingFailure && (
            <div className="font-mono text-[10px] text-white font-bold bg-red-600 px-3 py-1 rounded-xl shadow-md animate-pulse">
              ANOMALY FAULT SIMULATION ACTIVE
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

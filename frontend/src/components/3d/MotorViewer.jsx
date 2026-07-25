import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import { RotateCw, RefreshCw, AlertCircle, Eye, Activity, Box, Layers, Flame, AlertTriangle, Sparkles } from 'lucide-react';
import * as THREE from 'three';
import RefMachineModel from './RefMachineModel';
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
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 p-6 rounded-2xl text-center border border-red-200 min-h-[400px]">
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            Unable to render 3D Industrial Machine Canvas
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1">
            An error occurred while loading the 3D graphics canvas context.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Retry Loading
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Smooth camera motion controller to focus target component or frame dual models
function SmoothCameraController({ selectedComponent, isDigitalTwinView, controlsRef, initialCameraPos, initialTarget }) {
  const { camera } = useThree();

  useFrame((_, delta) => {
    if (!controlsRef.current) return;

    if (selectedComponent && selectedComponent.position3d) {
      const [tx, ty, tz] = selectedComponent.position3d;
      const targetX = isDigitalTwinView ? tx - 1.6 : tx;
      const [cx, cy, cz] = selectedComponent.cameraOffset || [tx + 2.2, ty + 1.2, tz + 2.8];
      const cameraX = isDigitalTwinView ? cx - 1.6 : cx;

      controlsRef.current.target.x = THREE.MathUtils.lerp(controlsRef.current.target.x, targetX, delta * 5);
      controlsRef.current.target.y = THREE.MathUtils.lerp(controlsRef.current.target.y, ty, delta * 5);
      controlsRef.current.target.z = THREE.MathUtils.lerp(controlsRef.current.target.z, tz, delta * 5);

      camera.position.x = THREE.MathUtils.lerp(camera.position.x, cameraX, delta * 5);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, cy, delta * 5);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, cz, delta * 5);
    } else {
      const defaultCamX = isDigitalTwinView ? 0 : initialCameraPos[0];
      const defaultCamZ = isDigitalTwinView ? 8.5 : initialCameraPos[2];
      const defaultTargetX = isDigitalTwinView ? 0 : initialTarget[0];

      controlsRef.current.target.x = THREE.MathUtils.lerp(controlsRef.current.target.x, defaultTargetX, delta * 4);
      controlsRef.current.target.y = THREE.MathUtils.lerp(controlsRef.current.target.y, initialTarget[1], delta * 4);
      controlsRef.current.target.z = THREE.MathUtils.lerp(controlsRef.current.target.z, initialTarget[2], delta * 4);

      camera.position.x = THREE.MathUtils.lerp(camera.position.x, defaultCamX, delta * 4);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, initialCameraPos[1], delta * 4);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, defaultCamZ, delta * 4);
    }

    controlsRef.current.update();
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
  isDigitalTwinView = true, // Default true for dual view
  setIsDigitalTwinView,
  isSimulatingFailure,
  setIsSimulatingFailure,
  activeMachineName = "Siemens Unit 1 Industrial Machine"
}) {
  const controlsRef = useRef(null);
  const [autoRotate, setAutoRotate] = useState(false);

  const initialCameraPos = [0, 2.2, 7.2];
  const initialTarget = [0, 0, 0];

  const handleResetCamera = () => {
    setSelectedComponent(null);
  };

  return (
    <div 
      className="relative w-full h-full min-h-[520px] rounded-2xl bg-gradient-to-b from-slate-100 via-slate-50 to-white border border-slate-200 shadow-inner overflow-hidden flex flex-col justify-between select-none"
      onDoubleClick={handleResetCamera}
    >
      {/* Background Industrial Blueprint Grid */}
      <div className="absolute inset-0 blueprint-grid opacity-25 pointer-events-none" />

      {/* Top Floating Action Controls */}
      <div className="relative z-10 p-3 flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
        
        {/* Left Title Badge */}
        <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-sm text-xs font-bold text-slate-800">
          <div className={`w-2.5 h-2.5 rounded-full ${isSimulatingFailure ? 'bg-red-500 animate-ping' : 'bg-blue-600 animate-pulse'}`} />
          <span className="truncate max-w-xs">{activeMachineName}</span>
        </div>

        {/* Center/Right Control Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* DIGITAL TWIN VIEW TOGGLE BUTTON */}
          <button
            onClick={() => setIsDigitalTwinView(!isDigitalTwinView)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md ${
              isDigitalTwinView
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border border-cyan-400 ring-2 ring-cyan-500/20'
                : 'bg-white/90 hover:bg-white text-slate-700 border border-slate-200'
            }`}
            title="Toggle Holographic Digital Twin Split View"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isDigitalTwinView ? 'text-cyan-200 animate-spin' : 'text-cyan-600'}`} style={{ animationDuration: '8s' }} />
            <span>Digital Twin View</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isDigitalTwinView ? 'bg-cyan-700 text-white' : 'bg-slate-200 text-slate-600'}`}>
              {isDigitalTwinView ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* INSPECT COMPONENTS BUTTON */}
          <button
            onClick={() => setIsInspectOpen(!isInspectOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md ${
              isInspectOpen
                ? 'bg-slate-900 text-white border border-slate-900'
                : 'bg-white/90 hover:bg-white text-slate-700 border border-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-blue-600" />
            <span>Inspect Components</span>
          </button>

          {/* SIMULATE FAILURE BUTTON */}
          <button
            onClick={() => setIsSimulatingFailure(!isSimulatingFailure)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md ${
              isSimulatingFailure
                ? 'bg-red-600 text-white border border-red-700 animate-pulse'
                : 'bg-white/90 hover:bg-white text-red-600 border border-red-200 hover:bg-red-50'
            }`}
            title="Simulate Subsystem Failure Anomaly"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{isSimulatingFailure ? 'Stop Simulation' : 'Simulate Failure'}</span>
          </button>

          {/* Reset View Button */}
          <button
            onClick={handleResetCamera}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-slate-700 border border-slate-200 text-xs font-semibold shadow-sm transition-all"
            title="Reset Camera Target"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
            <span>Reset View</span>
          </button>

          {/* Auto-Rotate Toggle */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border shadow-sm ${
              autoRotate
                ? 'bg-blue-600 text-white border-blue-700'
                : 'bg-white/90 hover:bg-white text-slate-700 border-slate-200'
            }`}
            title="Toggle Auto Rotation"
          >
            <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
          </button>

        </div>
      </div>

      {/* Synchronized 3D Canvas Viewport */}
      <div className="absolute inset-0 z-0">
        <ErrorBoundary>
          <Canvas
            shadows
            gl={{ antialias: true, alpha: true }}
            className="w-full h-full cursor-grab active:cursor-grabbing"
          >
            <color attach="background" args={['#f8fafc']} />

            <ambientLight intensity={1.4} />
            <directionalLight
              position={[12, 20, 12]}
              intensity={2.0}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              shadow-bias={-0.0001}
            />
            <directionalLight position={[-12, 10, -12]} intensity={0.8} />

            <Environment preset="city" />

            <PerspectiveCamera 
              makeDefault 
              position={initialCameraPos} 
              fov={45} 
              near={0.1}
              far={100}
            />

            <OrbitControls
              ref={controlsRef}
              makeDefault
              enableDamping={true}
              dampingFactor={0.05}
              minDistance={1.2}
              maxDistance={22}
              target={initialTarget}
              autoRotate={autoRotate}
              autoRotateSpeed={1.5}
              enablePan={true}
              enableZoom={true}
              rotateSpeed={0.8}
            />

            <SmoothCameraController
              selectedComponent={selectedComponent}
              isDigitalTwinView={isDigitalTwinView}
              controlsRef={controlsRef}
              initialCameraPos={initialCameraPos}
              initialTarget={initialTarget}
            />

            <ContactShadows
              position={[0, -0.95, 0]}
              opacity={0.4}
              scale={16}
              blur={2.5}
              far={6}
              color="#0f172a"
            />

            <Suspense fallback={<Loader />}>
              
              {/* IF DIGITAL TWIN VIEW IS OFF: Render 1 Single Physical Machine Centered */}
              {!isDigitalTwinView && (
                <group position={[0, 0, 0]}>
                  <RefMachineModel 
                    isHologram={false}
                    viewMode={viewMode}
                    selectedComponent={selectedComponent}
                    setSelectedComponent={setSelectedComponent}
                    isSimulatingFailure={isSimulatingFailure}
                  />
                </group>
              )}

              {/* IF DIGITAL TWIN VIEW IS ON: Render Left (Real Machine) + Right (Blue Holographic Twin) */}
              {isDigitalTwinView && (
                <group position={[0, 0, 0]}>
                  
                  {/* LEFT MODEL: Physical Real Machine */}
                  <group position={[-3.2, 0, 0]}>
                    <RefMachineModel 
                      isHologram={false}
                      viewMode={viewMode}
                      selectedComponent={selectedComponent}
                      setSelectedComponent={setSelectedComponent}
                      isSimulatingFailure={isSimulatingFailure}
                    />
                  </group>

                  {/* RIGHT MODEL: Identical Synchronized Blue Holographic Digital Twin */}
                  <group position={[3.2, 0, 0]}>
                    <RefMachineModel 
                      isHologram={true}
                      viewMode={viewMode}
                      selectedComponent={selectedComponent}
                      setSelectedComponent={setSelectedComponent}
                      isSimulatingFailure={isSimulatingFailure}
                    />
                  </group>

                </group>
              )}

            </Suspense>
          </Canvas>
        </ErrorBoundary>
      </div>

      {/* Bottom Layout Viewport Banner */}
      <div className="relative z-10 p-3 pointer-events-none flex items-center justify-between text-[11px] text-slate-500 bg-gradient-to-t from-slate-100/90 to-transparent">
        <div className="flex items-center gap-3 font-medium">
          <span>• Drag: Orbit View</span>
          <span>• Scroll: Zoom</span>
          <span>• Double-click: Reset View</span>
        </div>
        
        {/* Dynamic Status Indicator */}
        <div className="flex items-center gap-2">
          {isDigitalTwinView && (
            <div className="flex items-center gap-3 font-mono text-[10px] bg-white/90 px-3 py-1 rounded-xl border border-slate-200 shadow-sm">
              <span className="font-bold text-slate-700 uppercase">LEFT: Real Physical Machine</span>
              <span className="text-slate-300">|</span>
              <span className="font-bold text-cyan-600 uppercase">RIGHT: Blue Holographic Twin</span>
            </div>
          )}
          {isSimulatingFailure && (
            <div className="font-mono text-[10px] text-white font-bold bg-red-600 px-3 py-1 rounded-xl shadow-md animate-pulse">
              FAILURE ANOMALY SIMULATION ACTIVE
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

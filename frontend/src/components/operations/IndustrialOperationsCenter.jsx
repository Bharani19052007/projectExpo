import React, { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Maximize2,
  Minimize2,
  Sliders,
  Layers,
  Sparkles,
  Factory,
  Waves
} from 'lucide-react';
import PlantDigitalTwinScene from '../3d/plant/PlantDigitalTwinScene';
import TopNavigationHub from './TopNavigationHub';
import LeftTelemetryPanel from './LeftTelemetryPanel';
import RightIntelligencePanel from './RightIntelligencePanel';
import BottomTelemetryBar from './BottomTelemetryBar';
import AssetInspectionModal from './AssetInspectionModal';
import EmergencyPlantModal from './EmergencyPlantModal';
import HologramVibrationHUD from './HologramVibrationHUD';

import {
  plantOverview,
  plantAssets,
  initialProductionStats,
  campusBuildings,
} from '../../data/plantAssetsData';

export default function IndustrialOperationsCenter({ onOpenMachinePartsStudio }) {
  // State for Navigation & Views
  const [viewMode, setViewMode] = useState('OVERVIEW'); // 'OVERVIEW' | 'FLOOR 1' | 'FLOOR 2' | 'FLOOR 3' | 'UTILITIES'
  const [cameraPreset, setCameraPreset] = useState('overview');
  const [selectedBuildingId, setSelectedBuildingId] = useState(null);
  const [selectedAssetId, setSelectedAssetId] = useState(null);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [hoveredAssetId, setHoveredAssetId] = useState(null);

  // Dedicated Hologram Vibration View Mode
  const [isHologramVibration, setIsHologramVibration] = useState(false);
  const [vibrationMetric, setVibrationMetric] = useState('velocity'); // 'velocity' | 'acceleration' | 'envelope'
  const [amplitudeScale, setAmplitudeScale] = useState(1.0);

  // Panel Visibility toggles
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [showBottomBar, setShowBottomBar] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);

  // 360 Drone Tour & Controls
  const [isDroneTour, setIsDroneTour] = useState(false);
  const [fitTrigger, setFitTrigger] = useState(0);

  // Modals
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState('Operations Center');

  // Active Assets lookup
  const selectedAsset = plantAssets.find((a) => a.id === selectedAssetId) || null;
  const hoveredAsset = plantAssets.find((a) => a.id === hoveredAssetId) || null;

  // Handlers
  const handleSelectAsset = useCallback((assetId) => {
    setSelectedAssetId(assetId);
    setSelectedComponent(null);
    if (isDroneTour) setIsDroneTour(false);

    // Auto-select associated building if any
    const asset = plantAssets.find((a) => a.id === assetId);
    if (asset?.buildingId) {
      setSelectedBuildingId(asset.buildingId);
    }
  }, [isDroneTour]);

  const handleSelectBuilding = useCallback((buildingId) => {
    setSelectedBuildingId(buildingId);
    setSelectedAssetId(null);
    setSelectedComponent(null);
    if (isDroneTour) setIsDroneTour(false);
  }, [isDroneTour]);

  const handleSelectSector = useCallback((preset) => {
    setCameraPreset(preset);
    setSelectedAssetId(null);
    setSelectedComponent(null);
    if (isDroneTour) setIsDroneTour(false);
  }, [isDroneTour]);

  const handleChangeViewMode = useCallback((mode) => {
    setViewMode(mode);
    if (mode === 'OVERVIEW') {
      setSelectedBuildingId(null);
      setSelectedAssetId(null);
      setSelectedComponent(null);
      setCameraPreset('overview');
    } else if (mode === 'UTILITIES') {
      setCameraPreset('utilities');
      setSelectedBuildingId('BLD-UTIL-05');
    } else if (mode === 'FLOOR 1') {
      setCameraPreset('production_hall');
      setSelectedBuildingId('BLD-PROD-01');
    }
  }, []);

  const handleResetCamera = useCallback(() => {
    setCameraPreset('overview');
    setSelectedBuildingId(null);
    setSelectedAssetId(null);
    setSelectedComponent(null);
    setIsDroneTour(false);
    setViewMode('OVERVIEW');
    setFitTrigger((prev) => prev + 1);
  }, []);

  return (
    <div className={`relative w-full h-screen overflow-hidden select-none font-sans ${isHologramVibration ? 'bg-[#020617]' : 'bg-[#e4f1fd]'}`}>
      {/* 1. Master 3D Plant, Machine & Hologram Vibration Digital Twin Scene */}
      <div className="absolute inset-0 z-0">
        <PlantDigitalTwinScene
          assets={plantAssets}
          selectedAsset={selectedAsset}
          selectedComponent={selectedComponent}
          onSelectAsset={handleSelectAsset}
          onSelectComponent={setSelectedComponent}
          hoveredAsset={hoveredAsset}
          onHoverAsset={setHoveredAssetId}
          selectedBuildingId={selectedBuildingId}
          onSelectBuilding={handleSelectBuilding}
          viewMode={viewMode}
          cameraPreset={cameraPreset}
          showMarkers={showMarkers}
          isDroneTour={isDroneTour}
          fitTrigger={fitTrigger}
          isHologramVibration={isHologramVibration}
          vibrationMetric={vibrationMetric}
          amplitudeScale={amplitudeScale}
        />
      </div>

      {/* 2. Top Navigation Header with Dedicated Separate Twin View Options */}
      <TopNavigationHub
        plantOverview={plantOverview}
        viewMode={viewMode}
        onChangeViewMode={handleChangeViewMode}
        cameraPreset={cameraPreset}
        onChangeCameraPreset={handleSelectSector}
        isDroneTour={isDroneTour}
        onToggleDroneTour={() => setIsDroneTour(!isDroneTour)}
        onResetCamera={handleResetCamera}
        overallHealth={plantOverview.overallHealth}
        activeAlertCount={12}
        onOpenEmergencyModal={() => setIsEmergencyOpen(true)}
        isHologramVibration={isHologramVibration}
        onToggleHologramVibration={setIsHologramVibration}
        onOpenPartsStudio={onOpenMachinePartsStudio}
      />

      {/* 3. Hologram Vibration Control HUD (Visible in Vibration Mode) */}
      {isHologramVibration && (
        <HologramVibrationHUD
          activeMetric={vibrationMetric}
          onChangeMetric={setVibrationMetric}
          amplitudeScale={amplitudeScale}
          onChangeAmplitudeScale={setAmplitudeScale}
          onExitHologram={() => setIsHologramVibration(false)}
        />
      )}

      {/* 4. Floating Quick Switcher Pill (Top Right Area) */}
      <div className="absolute top-[68px] right-6 z-30 pointer-events-auto flex items-center gap-1.5 p-1 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20 shadow-xl">
        <button
          onClick={() => setIsHologramVibration(false)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
            !isHologramVibration
              ? 'bg-[#1976d2] text-white shadow-sm'
              : 'text-white/80 hover:text-white hover:bg-white/10'
          }`}
        >
          <Factory className="w-3.5 h-3.5" />
          <span>Realistic 3D Factory</span>
        </button>
        <button
          onClick={() => setIsHologramVibration(true)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
            isHologramVibration
              ? 'bg-[#00c2ff] text-[#020617] shadow-sm font-extrabold'
              : 'text-white/80 hover:text-[#00c2ff] hover:bg-white/10'
          }`}
        >
          <Waves className="w-3.5 h-3.5" />
          <span>Hologram Vibration</span>
        </button>
      </div>

      {/* 5. Left Telemetry & Sectors Panel */}
      {showLeftPanel && (
        <LeftTelemetryPanel
          selectedSector={cameraPreset}
          onSelectSector={handleSelectSector}
          selectedBuildingId={selectedBuildingId}
          onSelectBuilding={handleSelectBuilding}
        />
      )}

      {/* Left Panel Toggle Button */}
      <button
        onClick={() => setShowLeftPanel(!showLeftPanel)}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-40 bg-white/90 hover:bg-white border border-[#d8e6ff] p-1.5 rounded-r-xl shadow-md text-[#1976d2] transition-all"
        title={showLeftPanel ? 'Collapse Left Panel' : 'Expand Left Panel'}
      >
        {showLeftPanel ? (
          <ChevronLeft className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </button>

      {/* 6. Right AI Predictive Intelligence Panel */}
      {showRightPanel && (
        <RightIntelligencePanel
          onSelectAsset={handleSelectAsset}
          onResolveAlarm={(id) => console.log('Resolved alarm:', id)}
          onCreateWorkOrder={(assetId) => handleSelectAsset(assetId)}
        />
      )}

      {/* Right Panel Toggle Button */}
      <button
        onClick={() => setShowRightPanel(!showRightPanel)}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-40 bg-white/90 hover:bg-white border border-[#d8e6ff] p-1.5 rounded-l-xl shadow-md text-[#1976d2] transition-all"
        title={showRightPanel ? 'Collapse Right Panel' : 'Expand Right Panel'}
      >
        {showRightPanel ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* 7. Bottom Live Process Waveforms & Navigation Bar */}
      {showBottomBar && (
        <BottomTelemetryBar
          productionStats={initialProductionStats}
          activeTab={activeBottomTab}
          onTabChange={setActiveBottomTab}
        />
      )}

      {/* 8. Machine & Component-Level Digital Twin Modal / Drawer */}
      {selectedAsset && (
        <AssetInspectionModal
          asset={selectedAsset}
          selectedComponent={selectedComponent}
          onSelectComponent={setSelectedComponent}
          onOpenPartsStudio={onOpenMachinePartsStudio}
          onClose={() => {
            setSelectedAssetId(null);
            setSelectedComponent(null);
          }}
        />
      )}

      {/* 9. Emergency Response Modal */}
      {isEmergencyOpen && (
        <EmergencyPlantModal
          onClose={() => setIsEmergencyOpen(false)}
        />
      )}
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import PlantDigitalTwinScene from '../3d/plant/PlantDigitalTwinScene';
import TopNavigationHub from './TopNavigationHub';
import LeftTelemetryPanel from './LeftTelemetryPanel';
import RightIntelligencePanel from './RightIntelligencePanel';
import BottomTelemetryBar from './BottomTelemetryBar';
import AssetInspectionModal from './AssetInspectionModal';
import EmergencyPlantModal from './EmergencyPlantModal';

import {
  initialPlantAssets,
  initialAlarms,
  initialWorkOrders,
  plantOverview,
  initialProductionStats,
  initialUtilitiesData,
} from '../../data/plantAssetsData';

export default function IndustrialOperationsCenter() {
  // Master State
  const [assets, setAssets] = useState(initialPlantAssets);
  const [alarms, setAlarms] = useState(initialAlarms);
  const [workOrders, setWorkOrders] = useState(initialWorkOrders);
  const [productionStats, setProductionStats] = useState(initialProductionStats);
  const [utilitiesData, setUtilitiesData] = useState(initialUtilitiesData);

  // View & Camera Controls
  const [viewMode, setViewMode] = useState('CAD'); // 'CAD' | 'HOLOGRAM' | 'THERMAL' | 'VIBRATION'
  const [cameraPreset, setCameraPreset] = useState('overview');
  const [isDroneTour, setIsDroneTour] = useState(false);
  const [isAutoRotate, setIsAutoRotate] = useState(false);
  const [showMarkers, setShowMarkers] = useState(true);

  // Asset Selection & Hover
  const [selectedAssetId, setSelectedAssetId] = useState(null);
  const [hoveredAssetId, setHoveredAssetId] = useState(null);
  const [inspectedAsset, setInspectedAsset] = useState(null);

  // Emergency Modal
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  // Simulation Stream Engine
  const [isSimulating, setIsSimulating] = useState(true);

  // Selected asset object helper
  const selectedAsset = assets.find((a) => a.id === selectedAssetId) || null;
  const hoveredAsset = assets.find((a) => a.id === hoveredAssetId) || null;

  // Handle Asset Click / Inspection
  const handleSelectAsset = useCallback(
    (assetId) => {
      setSelectedAssetId(assetId);
      const found = assets.find((a) => a.id === assetId);
      if (found) {
        setInspectedAsset(found);
        setIsDroneTour(false);
      }
    },
    [assets]
  );

  // Handle Sector Navigation from Left Panel
  const handleSelectSector = (sectorId) => {
    setSelectedAssetId(null);
    setInspectedAsset(null);
    setCameraPreset(sectorId);
  };

  // Real-time IIoT Simulation Interval (100Hz micro-fluctuations)
  useEffect(() => {
    if (!isSimulating) return;

    const timer = setInterval(() => {
      setAssets((prevAssets) =>
        prevAssets.map((asset) => {
          const updatedSensors = asset.sensors?.map((sensor) => {
            const delta =
              (Math.random() - 0.5) *
              (sensor.unit === '°C' ? 0.5 : sensor.unit === 'mm/s' ? 0.05 : 1.0);
            let val = Number((sensor.value + delta).toFixed(1));
            if (sensor.min !== undefined && val < sensor.min) val = sensor.min;
            if (sensor.max !== undefined && val > sensor.max) val = sensor.max;
            return { ...sensor, value: val };
          });

          let updatedPrimary = asset.primaryMetric;
          if (updatedSensors && updatedSensors.length > 0) {
            updatedPrimary = {
              ...asset.primaryMetric,
              value: updatedSensors[0].value,
            };
          }

          return {
            ...asset,
            sensors: updatedSensors,
            primaryMetric: updatedPrimary,
          };
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [isSimulating]);

  // Keep inspected asset updated in real-time
  useEffect(() => {
    if (inspectedAsset) {
      const updated = assets.find((a) => a.id === inspectedAsset.id);
      if (updated) setInspectedAsset(updated);
    }
  }, [assets]);

  // Alarm & Maintenance Handlers
  const handleResolveAlarm = (alarmId) => {
    setAlarms((prev) => prev.filter((a) => a.id !== alarmId));
    const alarm = alarms.find((a) => a.id === alarmId);
    if (alarm) {
      setAssets((prev) =>
        prev.map((asset) =>
          asset.id === alarm.assetId
            ? { ...asset, status: 'RUNNING', healthScore: Math.min(98, asset.healthScore + 15) }
            : asset
        )
      );
    }
  };

  const handleCreateWorkOrder = (newWO) => {
    setWorkOrders((prev) => [newWO, ...prev]);
  };

  const handleUpdateSetpoint = (assetId, newSetpoint) => {
    setAssets((prev) =>
      prev.map((asset) =>
        asset.id === assetId
          ? {
              ...asset,
              primaryMetric: { ...asset.primaryMetric, value: newSetpoint },
            }
          : asset
      )
    );
  };

  const handleCalibrateSensors = (assetId) => {
    setAssets((prev) =>
      prev.map((asset) =>
        asset.id === assetId
          ? {
              ...asset,
              status: 'RUNNING',
              healthScore: 99,
              anomalyProbability: 2.1,
            }
          : asset
      )
    );
  };

  const handleTriggerLocalEStop = (assetId) => {
    setAssets((prev) =>
      prev.map((asset) =>
        asset.id === assetId
          ? {
              ...asset,
              status: 'CRITICAL',
              healthScore: 0,
            }
          : asset
      )
    );
    setAlarms((prev) => [
      {
        id: `ALM-ESTOP-${Date.now()}`,
        assetId,
        assetTag: assetId,
        severity: 'CRITICAL',
        message: `Local emergency stop executed on ${assetId}. Machine isolated.`,
        time: new Date().toTimeString().substring(0, 8),
      },
      ...prev,
    ]);
  };

  const handleConfirmEmergencyShutdown = () => {
    setAssets((prev) =>
      prev.map((asset) => ({
        ...asset,
        status: 'EMERGENCY',
        healthScore: 20,
      }))
    );
    setAlarms((prev) => [
      {
        id: `ALM-ESD-${Date.now()}`,
        assetId: 'PLANT-WIDE',
        assetTag: 'ESD-SIL-3',
        severity: 'EMERGENCY',
        message: 'PLANT-WIDE EMERGENCY TRIP SEQUENCE ACTIVATED. All processes isolated.',
        time: new Date().toTimeString().substring(0, 8),
      },
      ...prev,
    ]);
  };

  // Overall facility health score
  const overallHealth = Number(
    (
      assets.reduce((sum, asset) => sum + (asset.healthScore || 90), 0) /
      (assets.length || 1)
    ).toFixed(1)
  );

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-[#f5f9ff]">
      {/* 1. Full-Screen 3D Smart Factory Digital Twin with Daylight Atmosphere */}
      <div className="absolute inset-0 z-0">
        <PlantDigitalTwinScene
          assets={assets}
          selectedAsset={selectedAsset}
          onSelectAsset={handleSelectAsset}
          hoveredAsset={hoveredAsset}
          onHoverAsset={setHoveredAssetId}
          viewMode={viewMode}
          cameraPreset={cameraPreset}
          showMarkers={showMarkers}
          isDroneTour={isDroneTour}
          isAutoRotate={isAutoRotate}
        />
      </div>

      {/* 2. Top Navigation Hub (White Glass Bar) */}
      <TopNavigationHub
        plantOverview={plantOverview}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        cameraPreset={cameraPreset}
        onChangeCameraPreset={(preset) => {
          setSelectedAssetId(null);
          setInspectedAsset(null);
          setCameraPreset(preset);
        }}
        isDroneTour={isDroneTour}
        onToggleDroneTour={() => {
          setIsDroneTour(!isDroneTour);
          setSelectedAssetId(null);
          setInspectedAsset(null);
        }}
        isAutoRotate={isAutoRotate}
        onToggleAutoRotate={() => setIsAutoRotate(!isAutoRotate)}
        isSimulating={isSimulating}
        onToggleSimulation={() => setIsSimulating(!isSimulating)}
        overallHealth={overallHealth}
        activeAlertCount={alarms.length}
      />

      {/* 3. Left Panel (Plant Health, KPIs, Sectors Cards) */}
      <LeftTelemetryPanel
        assets={assets}
        selectedAsset={selectedAsset}
        onSelectAsset={handleSelectAsset}
        onSelectSector={handleSelectSector}
        productionStats={productionStats}
        utilitiesData={utilitiesData}
      />

      {/* 4. Right Panel (AI Predictive Intelligence, Alerts, Plant Summary Donut Gauges) */}
      <RightIntelligencePanel
        alarms={alarms}
        workOrders={workOrders}
        selectedAsset={selectedAsset}
        onSelectAsset={handleSelectAsset}
        onResolveAlarm={handleResolveAlarm}
        onCreateWorkOrder={handleCreateWorkOrder}
      />

      {/* 5. Bottom HUD: Live Process Trends Card & Quick Stats Footer Bar */}
      <BottomTelemetryBar
        productionStats={productionStats}
        utilitiesData={utilitiesData}
      />

      {/* 6. Interactive Asset Inspection Modal */}
      {inspectedAsset && (
        <AssetInspectionModal
          asset={inspectedAsset}
          onClose={() => {
            setInspectedAsset(null);
            setSelectedAssetId(null);
          }}
          onUpdateSetpoint={handleUpdateSetpoint}
          onTriggerLocalEStop={handleTriggerLocalEStop}
          onCalibrateSensors={handleCalibrateSensors}
          onCreateWorkOrder={handleCreateWorkOrder}
        />
      )}

      {/* 7. Plant-Wide Emergency ESD Modal */}
      <EmergencyPlantModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        onConfirmEmergencyShutdown={handleConfirmEmergencyShutdown}
      />
    </div>
  );
}

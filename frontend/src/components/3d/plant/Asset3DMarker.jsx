import React from 'react';
import { Html } from '@react-three/drei';

export default function Asset3DMarker({
  asset,
  isSelected,
  isHovered,
  onClick,
  onHover,
}) {
  if (!asset || !asset.position) return null;

  const isCritical = asset.status === 'CRITICAL' || asset.status === 'EMERGENCY';
  const isWarning = asset.status === 'WARNING' || asset.status === 'DEGRADED';
  const statusColor = isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#22c55e';
  const statusText = isCritical ? 'CRITICAL' : isWarning ? 'WARNING' : 'NORMAL';

  const yOffset = (asset.position[1] || 0) + (asset.markerHeight || 4.2);

  // Extract key metrics
  const tempSensor = asset.sensors?.find((s) => s.name.toLowerCase().includes('temp'));
  const pressSensor = asset.sensors?.find((s) =>
    s.name.toLowerCase().includes('press') || s.name.toLowerCase().includes('pressure')
  );
  const vibSensor = asset.sensors?.find((s) => s.name.toLowerCase().includes('vib'));
  const flowSensor = asset.sensors?.find((s) => s.name.toLowerCase().includes('flow'));

  return (
    <group position={[asset.position[0], yOffset, asset.position[2]]}>
      <Html
        center
        distanceFactor={38}
        zIndexRange={[100, 0]}
        style={{ pointerEvents: 'auto' }}
      >
        <div
          onClick={(e) => {
            e.stopPropagation();
            onClick?.(asset.id);
          }}
          onMouseEnter={(e) => {
            e.stopPropagation();
            onHover?.(asset.id);
          }}
          onMouseLeave={(e) => {
            e.stopPropagation();
            onHover?.(null);
          }}
          className={`group cursor-pointer select-none transition-all duration-300 transform ${
            isSelected
              ? 'scale-110 -translate-y-2'
              : isHovered
              ? 'scale-105'
              : 'scale-95 hover:scale-105'
          }`}
        >
          {/* Main Pure White Glassmorphic Card */}
          <div
            className={`min-w-[160px] p-2.5 rounded-xl backdrop-blur-xl border transition-all ${
              isSelected
                ? 'bg-white/98 border-[#1e88e5] shadow-[0_10px_28px_rgba(30,136,229,0.28)] ring-2 ring-blue-400/40'
                : isHovered
                ? 'bg-white/95 border-[#42a5f5] shadow-[0_8px_24px_rgba(30,80,180,0.18)]'
                : 'bg-white/90 border-[#d8e6ff] hover:border-[#bad3ff] shadow-[0_6px_20px_rgba(30,80,180,0.10)]'
            }`}
          >
            {/* Header: Asset Name & Tag */}
            <div className="flex items-center justify-between pb-1.5 border-b border-[#edf4ff]">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#1e88e5] animate-pulse" />
                <span className="text-[11px] font-sans font-bold tracking-tight text-[#1e293b] truncate max-w-[110px]">
                  {asset.name || asset.tag}
                </span>
              </div>
              <span className="text-[9px] font-mono font-bold text-[#1e88e5] bg-[#edf4ff] px-1.5 py-0.5 rounded">
                {asset.healthScore}%
              </span>
            </div>

            {/* Live Metrics Grid */}
            <div className="py-1.5 space-y-1 font-mono text-[9px] text-[#475569]">
              {tempSensor && (
                <div className="flex items-center justify-between">
                  <span className="text-[#64748b]">TEMP:</span>
                  <span className="font-bold text-[#1e293b]">
                    {tempSensor.value} {tempSensor.unit}
                  </span>
                </div>
              )}
              {pressSensor && (
                <div className="flex items-center justify-between">
                  <span className="text-[#64748b]">PRESS:</span>
                  <span className="font-bold text-[#1e293b]">
                    {pressSensor.value} {pressSensor.unit}
                  </span>
                </div>
              )}
              {vibSensor && (
                <div className="flex items-center justify-between">
                  <span className="text-[#64748b]">VIB:</span>
                  <span className="font-bold text-[#1e293b]">
                    {vibSensor.value} {vibSensor.unit}
                  </span>
                </div>
              )}
              {flowSensor && (
                <div className="flex items-center justify-between">
                  <span className="text-[#64748b]">FLOW:</span>
                  <span className="font-bold text-[#1e293b]">
                    {flowSensor.value} {flowSensor.unit}
                  </span>
                </div>
              )}
              {!tempSensor && !pressSensor && asset.primaryMetric && (
                <div className="flex items-center justify-between">
                  <span className="text-[#64748b]">OUTPUT:</span>
                  <span className="font-bold text-[#1e293b]">
                    {asset.primaryMetric.value} {asset.primaryMetric.unit}
                  </span>
                </div>
              )}
            </div>

            {/* Status Line */}
            <div className="flex items-center justify-between pt-1 border-t border-[#edf4ff] font-mono text-[9px]">
              <span className="text-[#64748b]">STATUS:</span>
              <span
                className="font-bold flex items-center gap-1"
                style={{ color: statusColor }}
              >
                {statusText}
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: statusColor }}
                />
              </span>
            </div>
          </div>

          {/* Blue Lead Line & Node Connector */}
          <div className="flex flex-col items-center">
            <div
              className="w-[1.5px] h-4"
              style={{
                background: 'linear-gradient(to bottom, #1e88e5, rgba(30, 136, 229, 0.3))',
              }}
            />
            <div className="relative flex items-center justify-center w-3.5 h-3.5">
              <div className="absolute w-full h-full rounded-full bg-[#1e88e5] animate-ping opacity-40" />
              <div className="relative w-2.5 h-2.5 rounded-full bg-[#1e88e5] border-2 border-white shadow-md" />
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
}

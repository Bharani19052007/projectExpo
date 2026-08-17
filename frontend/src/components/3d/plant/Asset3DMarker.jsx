import React from 'react';
import { Html } from '@react-three/drei';
import { Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function Asset3DMarker({
  asset,
  isSelected,
  isHovered,
  onClick,
}) {
  if (!asset || !asset.position) return null;

  const [x, y, z] = asset.position;
  const markerY = y + (asset.markerHeight || 3.5);

  const isWarning = asset.status === 'Warning' || asset.aiRiskScore === 'MEDIUM' || asset.aiRiskScore === 'HIGH';
  const statusColor = isWarning ? '#f59e0b' : '#22c55e';

  return (
    <group position={[x, markerY, z]}>
      {/* 3D Cyan Vertical Pointer Needle */}
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 1.2, 8]} />
        <meshBasicMaterial color="#00c2ff" />
      </mesh>
      <mesh position={[0, -1.2, 0]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color="#00c2ff" />
      </mesh>

      {/* HTML Spatial Marker Card */}
      <Html
        position={[0, 0, 0]}
        center
        distanceFactor={38}
        zIndexRange={[100, 0]}
        style={{
          pointerEvents: 'auto',
          userSelect: 'none',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          transform: isHovered || isSelected ? 'scale(1.08)' : 'scale(1.0)',
        }}
      >
        <div
          onClick={(e) => {
            e.stopPropagation();
            onClick?.(asset.id);
          }}
          className={`cursor-pointer rounded-xl px-3 py-2 shadow-xl border backdrop-blur-md transition-all font-sans ${
            isSelected
              ? 'bg-[#0f172a]/95 border-[#00c2ff] ring-2 ring-[#00c2ff]/40 shadow-[#00c2ff]/20'
              : isHovered
              ? 'bg-[#0f172a]/90 border-[#38bdf8] shadow-lg'
              : 'bg-[#0f172a]/85 border-[#00c2ff]/40 hover:border-[#00c2ff]'
          }`}
          style={{ minWidth: '150px' }}
        >
          {/* Header: Machine ID + Status Dot */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[11px] font-extrabold tracking-wide text-white font-mono">
              {asset.name}
            </span>
            <div className="flex items-center gap-1">
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: statusColor }}
              />
              <span
                className="text-[9px] font-bold uppercase tracking-wider"
                style={{ color: statusColor }}
              >
                {asset.status}
              </span>
            </div>
          </div>

          {/* Primary Metric & Health */}
          <div className="flex items-baseline justify-between text-xs pt-1 border-t border-[#334155]">
            <span className="font-extrabold text-[#38bdf8] font-mono">
              {asset.primaryMetric?.value} {asset.primaryMetric?.unit}
            </span>
            <span className="text-[10px] font-extrabold text-emerald-400">
              {asset.healthScore}% HEALTH
            </span>
          </div>
        </div>
      </Html>
    </group>
  );
}

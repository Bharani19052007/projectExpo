import React, { useState } from 'react';
import {
  Thermometer,
  Gauge,
  Activity,
  Zap,
  Droplets,
  TrendingUp,
  LayoutDashboard,
  BarChart2,
  Box,
  Brain,
  Bell,
  FileText,
  Settings
} from 'lucide-react';
import { initialProductionStats } from '../../data/plantAssetsData';

export default function BottomTelemetryBar({
  productionStats = initialProductionStats,
  activeTab = 'Operations Center',
  onTabChange,
}) {
  const telemetryCards = [
    {
      title: 'TEMPERATURE',
      value: productionStats?.temperature?.value || '72.4',
      unit: '°C',
      delta: productionStats?.temperature?.delta || '+2.1',
      deltaPositive: true,
      icon: Thermometer,
      seed: 1,
    },
    {
      title: 'PRESSURE',
      value: productionStats?.pressure?.value || '6.27',
      unit: 'bar',
      delta: productionStats?.pressure?.delta || '-0.15',
      deltaPositive: false,
      icon: Gauge,
      seed: 2,
    },
    {
      title: 'VIBRATION',
      value: productionStats?.vibration?.value || '3.42',
      unit: 'mm/s',
      delta: productionStats?.vibration?.delta || '+0.21',
      deltaPositive: true,
      icon: Activity,
      seed: 3,
    },
    {
      title: 'POWER DEMAND',
      value: productionStats?.powerDemand?.value || '24.8',
      unit: 'MW',
      delta: productionStats?.powerDemand?.delta || '+1.3',
      deltaPositive: true,
      icon: Zap,
      seed: 4,
    },
    {
      title: 'FLOW RATE',
      value: productionStats?.flowRate?.value || '125.6',
      unit: 'm³/h',
      delta: productionStats?.flowRate?.delta || '+5.2',
      deltaPositive: true,
      icon: Droplets,
      seed: 5,
    },
    {
      title: 'PRODUCTION RATE',
      value: productionStats?.productionRate?.value || '1,245',
      unit: 'u/h',
      delta: productionStats?.productionRate?.delta || '+38',
      deltaPositive: true,
      icon: TrendingUp,
      seed: 6,
    },
  ];

  // Helper for generating smooth procedural live sparkline waveforms
  const generateWavePoints = (seed) => {
    const points = [];
    const count = 18;
    for (let i = 0; i <= count; i++) {
      const x = (i / count) * 100;
      const wave1 = Math.sin((i + seed * 3) * 0.8) * 6;
      const wave2 = Math.cos((i * 1.5 + seed * 2) * 0.6) * 4;
      const y = 18 + wave1 + wave2;
      points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return points.join(' ');
  };

  const navTabs = [
    { label: 'Operations Center', icon: LayoutDashboard },
    { label: 'Analytics', icon: BarChart2 },
    { label: 'Digital Twin Library', icon: Box },
    { label: 'AI Assistant', icon: Brain },
    { label: 'Alerts', icon: Bell },
    { label: 'Documents', icon: FileText },
    { label: 'Settings', icon: Settings },
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 pointer-events-auto select-none font-sans flex flex-col">
      {/* 1. Six Live Telemetry Waveform Sparkline Cards */}
      <div className="px-5 pb-2">
        <div className="grid grid-cols-6 gap-3">
          {telemetryCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 shadow-md border border-[#d8e6ff] flex flex-col justify-between"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#64748b] uppercase">
                    <Icon className="w-3 h-3 text-[#1976d2]" />
                    <span>{card.title}</span>
                  </div>
                  <span className="text-[10px] text-[#94a3b8] font-semibold">
                    {card.unit}
                  </span>
                </div>

                {/* Main Value & Trend Delta */}
                <div className="flex items-baseline justify-between mt-1 mb-0.5">
                  <span className="text-base font-extrabold text-[#0f172a]">
                    {card.value}
                  </span>
                  <span
                    className={`text-[10px] font-bold ${
                      card.deltaPositive ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {card.delta}
                  </span>
                </div>

                {/* Live Sparkline Graph */}
                <div className="h-7 w-full relative">
                  <svg
                    className="w-full h-full"
                    viewBox="0 0 100 36"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient
                        id={`sparkGrad-${idx}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#1976d2" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#1976d2" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Gradient fill */}
                    <polygon
                      points={`0,36 ${generateWavePoints(card.seed)} 100,36`}
                      fill={`url(#sparkGrad-${idx})`}
                    />

                    {/* Blue line */}
                    <polyline
                      points={generateWavePoints(card.seed)}
                      fill="none"
                      stroke="#1976d2"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Bottom Navigation Hub Bar */}
      <div className="bg-white/95 backdrop-blur-md border-t border-[#d8e6ff] px-6 py-2 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-6 mx-auto">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.label;

            return (
              <button
                key={tab.label}
                onClick={() => onTabChange?.(tab.label)}
                className={`flex items-center gap-2 text-xs font-bold transition-all py-1 px-3 rounded-xl ${
                  isActive
                    ? 'text-[#1976d2] bg-[#edf4ff]'
                    : 'text-[#64748b] hover:text-[#0f172a]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import {
  Zap,
  Droplets,
  Activity,
  AlertTriangle,
  Clock,
  RotateCw,
  Cpu
} from 'lucide-react';

export default function BottomTelemetryBar({ productionStats, utilitiesData }) {
  const [waveOffset, setWaveOffset] = useState(0);
  const [timeRange, setTimeRange] = useState('1H');

  useEffect(() => {
    const timer = setInterval(() => {
      setWaveOffset((prev) => (prev + 1) % 100);
    }, 150);
    return () => clearInterval(timer);
  }, []);

  const generateWavePoints = (seed, amplitude = 7, base = 18) => {
    const points = [];
    for (let x = 0; x <= 100; x += 10) {
      const y =
        base +
        Math.sin((x + waveOffset * 3 + seed * 20) * 0.1) * amplitude +
        Math.cos((x + waveOffset * 2) * 0.08) * (amplitude * 0.4);
      points.push(`${x},${Math.max(4, Math.min(32, y))}`);
    }
    return points.join(' ');
  };

  const sparklines = [
    {
      title: 'Temperature (°C)',
      maxVal: '150',
      midVal: '75',
      minVal: '0',
      color: '#1e88e5',
      gradientId: 'tempLightGrad',
      seed: 1,
      times: ['06:30', '06:45', '07:00', '07:15'],
    },
    {
      title: 'Pressure (bar)',
      maxVal: '15',
      midVal: '7.5',
      minVal: '0',
      color: '#00b8ff',
      gradientId: 'pressLightGrad',
      seed: 2,
      times: ['06:30', '06:45', '07:00', '07:15'],
    },
    {
      title: 'Vibration (mm/s)',
      maxVal: '10',
      midVal: '5',
      minVal: '0',
      color: '#42a5f5',
      gradientId: 'vibLightGrad',
      seed: 3,
      times: ['06:30', '06:45', '07:00', '07:15'],
    },
    {
      title: 'Flow Rate (m³/hr)',
      maxVal: '200',
      midVal: '100',
      minVal: '0',
      color: '#22c55e',
      gradientId: 'flowLightGrad',
      seed: 4,
      times: ['06:30', '06:45', '07:00', '07:15'],
    },
    {
      title: 'Power (MW)',
      maxVal: '30',
      midVal: '15',
      minVal: '0',
      color: '#1e88e5',
      gradientId: 'powerLightGrad',
      seed: 5,
      times: ['06:30', '06:45', '07:00', '07:15'],
    },
  ];

  return (
    <div className="absolute bottom-2 left-3.5 right-3.5 z-30 pointer-events-auto select-none flex flex-col gap-2">
      {/* 1. Center LIVE PROCESS TRENDS Card */}
      <div className="mx-auto w-full max-w-[880px] glass-card-white rounded-2xl p-3 shadow-md border border-[#d8e6ff]">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-2 mb-1 border-b border-[#edf4ff]">
          <h2 className="text-xs font-bold font-sans tracking-wide text-[#1e293b] uppercase flex items-center gap-1.5">
            <span className="w-1.5 h-3.5 bg-[#1e88e5] rounded-full" />
            LIVE PROCESS TRENDS
          </h2>
          {/* Time Range Pills */}
          <div className="flex items-center gap-1 bg-[#edf4ff] p-0.5 rounded-lg border border-[#d8e6ff]">
            {['1H', '6H', '24H', '7D'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                  timeRange === range
                    ? 'bg-[#1e88e5] text-white shadow-xs'
                    : 'text-[#64748b] hover:text-[#1e293b]'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* 5 Real-Time Graphs Grid */}
        <div className="grid grid-cols-5 gap-2.5">
          {sparklines.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#f8faff] rounded-xl p-2 border border-[#e8f1ff] flex flex-col justify-between"
            >
              <div className="text-[10px] font-bold text-[#1e293b] truncate">
                {item.title}
              </div>

              {/* Sparkline Canvas */}
              <div className="h-9 w-full my-1 relative">
                <svg className="w-full h-full" viewBox="0 0 100 36" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id={item.gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={item.color} stopOpacity="0.25" />
                      <stop offset="100%" stopColor={item.color} stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Soft Blue Grid Lines */}
                  <line x1="0" y1="9" x2="100" y2="9" stroke="#e2edff" strokeWidth="0.8" strokeDasharray="2 2" />
                  <line x1="0" y1="18" x2="100" y2="18" stroke="#e2edff" strokeWidth="0.8" strokeDasharray="2 2" />
                  <line x1="0" y1="27" x2="100" y2="27" stroke="#e2edff" strokeWidth="0.8" strokeDasharray="2 2" />

                  {/* Gradient Area */}
                  <polygon
                    points={`0,36 ${generateWavePoints(item.seed)} 100,36`}
                    fill={`url(#${item.gradientId})`}
                  />

                  {/* Line */}
                  <polyline
                    points={generateWavePoints(item.seed)}
                    fill="none"
                    stroke={item.color}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Timestamps */}
              <div className="flex justify-between text-[7px] font-mono text-[#94a3b8]">
                {item.times.map((t, i) => (
                  <span key={i}>{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Bottom Quick-Stats Footer Bar */}
      <div className="glass-card-white rounded-2xl px-4 py-2 shadow-sm border border-[#d8e6ff] flex items-center justify-between gap-4 max-w-[1920px] mx-auto text-xs font-sans">
        {/* Total Assets */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#dbeafe] text-[#1e88e5]">
            <Cpu className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] text-[#94a3b8] uppercase font-semibold block leading-none">
              TOTAL ASSETS
            </span>
            <span className="font-bold text-[#1e293b]">128 <span className="text-[10px] font-normal text-[#64748b]">Online</span></span>
          </div>
        </div>

        {/* Running */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#dcfce7] text-[#16a34a]">
            <Activity className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] text-[#94a3b8] uppercase font-semibold block leading-none">
              RUNNING
            </span>
            <span className="font-bold text-[#15803d]">98</span>
          </div>
        </div>

        {/* Warning */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#fef3c7] text-[#d97706]">
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] text-[#94a3b8] uppercase font-semibold block leading-none">
              WARNING
            </span>
            <span className="font-bold text-[#b45309]">21</span>
          </div>
        </div>

        {/* Critical */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#fee2e2] text-[#dc2626]">
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] text-[#94a3b8] uppercase font-semibold block leading-none">
              CRITICAL
            </span>
            <span className="font-bold text-[#b91c1c]">9</span>
          </div>
        </div>

        {/* Total Energy */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#edf4ff] text-[#1e88e5]">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] text-[#94a3b8] uppercase font-semibold block leading-none">
              TOTAL ENERGY
            </span>
            <span className="font-bold text-[#1e293b]">14.8 MW <span className="text-[10px] font-normal text-[#64748b]">Consumption</span></span>
          </div>
        </div>

        {/* Water Flow */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#e0f2fe] text-[#0284c7]">
            <Droplets className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] text-[#94a3b8] uppercase font-semibold block leading-none">
              WATER FLOW
            </span>
            <span className="font-bold text-[#1e293b]">44 m³/hr <span className="text-[10px] font-normal text-[#64748b]">Current</span></span>
          </div>
        </div>

        {/* Overall OEE */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#ccfbf1] text-[#0d9488]">
            <RotateCw className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] text-[#94a3b8] uppercase font-semibold block leading-none">
              OEE
            </span>
            <span className="font-bold text-[#0f766e]">89.4% <span className="text-[10px] font-normal text-[#64748b]">Overall</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}

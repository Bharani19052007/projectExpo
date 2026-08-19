import React, { useState } from 'react';
import TopDeviceNavigation from './TopDeviceNavigation';
import MobileTwinView from './MobileTwinView';
import LaptopTwinView from './LaptopTwinView';
import MonitorTwinView from './MonitorTwinView';

export default function DeviceCommandCenter() {
  const [activeDeviceType, setActiveDeviceType] = useState('LAPTOP'); // 'MOBILE' | 'LAPTOP' | 'MONITOR'
  const [isDemoMode, setIsDemoMode] = useState(false);

  return (
    <div className="relative w-full h-full bg-[#020617] text-white flex flex-col font-sans overflow-hidden">
      <TopDeviceNavigation 
        activeType={activeDeviceType} 
        onChangeType={setActiveDeviceType}
        isDemoMode={isDemoMode}
        onToggleDemoMode={() => setIsDemoMode(!isDemoMode)}
      />
      <div className="flex-1 relative overflow-hidden">
        {activeDeviceType === 'MOBILE' && <MobileTwinView isDemoMode={isDemoMode} />}
        {activeDeviceType === 'LAPTOP' && <LaptopTwinView isDemoMode={isDemoMode} />}
        {activeDeviceType === 'MONITOR' && <MonitorTwinView isDemoMode={isDemoMode} />}
      </div>
    </div>
  );
}

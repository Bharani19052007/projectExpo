import React, { useState } from 'react';
import TopDeviceNavigation from './TopDeviceNavigation';
import MobileTwinView from './MobileTwinView';
import LaptopTwinView from './LaptopTwinView';
import MonitorTwinView from './MonitorTwinView';

export default function DeviceCommandCenter({ 
  onOpenDigitalTwin,
  isDemoMode,
  setIsDemoMode,
  isExpoMode,
  setIsExpoMode
}) {
  const [activeDeviceType, setActiveDeviceType] = useState('MOBILE'); // 'MOBILE' | 'LAPTOP' | 'MONITOR'

  return (
    <div className="relative w-full h-full bg-[#020617] text-white flex flex-col font-sans overflow-hidden">
      <TopDeviceNavigation 
        activeType={activeDeviceType} 
        onChangeType={setActiveDeviceType}
        isDemoMode={isDemoMode}
        onToggleDemoMode={() => setIsDemoMode(!isDemoMode)}
      />
      <div className="flex-1 relative overflow-hidden">
        {activeDeviceType === 'MOBILE' && (
          <MobileTwinView 
            isDemoMode={isDemoMode} 
            setIsDemoMode={setIsDemoMode}
            isExpoMode={isExpoMode}
            setIsExpoMode={setIsExpoMode}
            onOpenDigitalTwin={onOpenDigitalTwin} 
          />
        )}
        {activeDeviceType === 'LAPTOP' && <LaptopTwinView isDemoMode={isDemoMode} onOpenDigitalTwin={onOpenDigitalTwin} />}
        {activeDeviceType === 'MONITOR' && <MonitorTwinView isDemoMode={isDemoMode} onOpenDigitalTwin={onOpenDigitalTwin} />}
      </div>
    </div>
  );
}


import React from 'react';

export default function LaptopComponentInspection({ telemetry, selectedComponent, onSelectComponent }) {
  return (
    <div className="bg-[#0a0f1d]/60 border border-[#1e293b] rounded-2xl p-4 backdrop-blur-md h-full">
      <h3 className="text-sm font-bold text-slate-300 uppercase mb-3">Component Inspector</h3>
      <div className="text-slate-400 text-xs mb-2">
        {selectedComponent ? `Selected: ${selectedComponent}` : 'Select a component in 3D view'}
      </div>
      {selectedComponent && (
        <button 
          onClick={() => onSelectComponent(null)}
          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs text-white"
        >
          Clear Selection
        </button>
      )}
    </div>
  );
}

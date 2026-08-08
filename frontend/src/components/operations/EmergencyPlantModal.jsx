import React, { useState } from 'react';
import { AlertOctagon, ShieldAlert, X } from 'lucide-react';

export default function EmergencyPlantModal({
  isOpen,
  onClose,
  onConfirmEmergencyShutdown,
}) {
  const [isExecuting, setIsExecuting] = useState(false);

  if (!isOpen) return null;

  const handleExecute = () => {
    setIsExecuting(true);
    setTimeout(() => {
      onConfirmEmergencyShutdown?.();
      setIsExecuting(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-lg glass-card-white border-2 border-[#ef4444] rounded-3xl shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#fee2e2] border border-[#fca5a5] rounded-2xl">
              <AlertOctagon className="w-8 h-8 text-[#dc2626]" />
            </div>
            <div>
              <h2 className="text-base font-bold font-sans text-[#b91c1c] tracking-tight">
                PLANT-WIDE EMERGENCY SHUTDOWN (ESD LEVEL 1)
              </h2>
              <p className="text-xs text-[#64748b] font-sans mt-0.5">
                SAFETY INTEGRITY LEVEL: SIL-3 AUTOMATIC INTERLOCK
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#94a3b8] hover:text-[#1e293b] rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Checklist */}
        <div className="p-4 bg-[#fff5f5] border border-[#fecaca] rounded-2xl space-y-2 text-xs text-[#475569]">
          <p className="font-bold text-[#b91c1c]">
            Initiating this command will immediately execute safety trip sequences:
          </p>
          <ul className="list-disc list-inside space-y-1 text-[#334155]">
            <li>Open flare depressurization relief valves (ESDV-01)</li>
            <li>Trip hydrocarbon feed pumps and isolate bulk storage tanks</li>
            <li>Cut fuel gas to refinery furnace heaters & steam boilers</li>
            <li>Apply robotic assembly cell dynamic brakes</li>
            <li>E-Stop all Autonomous Guided Vehicles (AGVs) in place</li>
          </ul>
        </div>

        {/* Action Controls */}
        <div className="space-y-2.5 pt-1">
          <button
            onClick={handleExecute}
            disabled={isExecuting}
            className="w-full py-3 bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold text-sm rounded-xl shadow-md shadow-red-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <ShieldAlert className="w-5 h-5" />
            {isExecuting ? 'EXECUTING SIL-3 PLANT TRIP...' : 'CONFIRM EMERGENCY PLANT TRIP'}
          </button>

          <button
            onClick={onClose}
            disabled={isExecuting}
            className="w-full py-2 bg-[#f8faff] hover:bg-[#edf4ff] text-[#475569] hover:text-[#1e293b] text-xs font-bold rounded-xl border border-[#d8e6ff] transition-all"
          >
            ABORT & RETURN TO OPERATIONS
          </button>
        </div>
      </div>
    </div>
  );
}

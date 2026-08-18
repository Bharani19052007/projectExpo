import React from 'react';
import { AlertTriangle, AlertOctagon, Info, Bell } from 'lucide-react';

export default function LaptopAlerts({ telemetry }) {
  const getAlerts = () => {
    const alertsList = [];
    const cpuTemp = telemetry.cpuTemp || telemetry.temperature || 40;
    const gpuTemp = telemetry.gpuTemp || 40;
    const ssdTemp = telemetry.ssdTemp || 35;
    const battery = telemetry.battery || 50;
    const ram = telemetry.ram || 50;
    const fanSpeed = telemetry.fanSpeed || 2000;
    const wifiSignal = telemetry.wifiSignal || 90;
    const batteryHealth = telemetry.batteryHealth || 94;

    // CPU Temp Alerts
    if (cpuTemp > 85) {
      alertsList.push({
        id: 'cpu-temp-crit',
        severity: 'CRITICAL',
        message: `Critical CPU temperature: ${cpuTemp}°C. Thermal shutdown risk.`,
        timestamp: 'Just now'
      });
    } else if (cpuTemp > 70) {
      alertsList.push({
        id: 'cpu-temp-warn',
        severity: 'WARNING',
        message: `High CPU temperature: ${cpuTemp}°C. Cooling capacity strained.`,
        timestamp: 'Just now'
      });
    }

    // GPU Temp Alerts
    if (gpuTemp > 85) {
      alertsList.push({
        id: 'gpu-temp-crit',
        severity: 'CRITICAL',
        message: `Critical GPU temperature: ${gpuTemp}°C. Frame rates will be throttled.`,
        timestamp: 'Just now'
      });
    } else if (gpuTemp > 70) {
      alertsList.push({
        id: 'gpu-temp-warn',
        severity: 'WARNING',
        message: `High GPU temperature: ${gpuTemp}°C. Avoid prolonged heavy rendering.`,
        timestamp: 'Just now'
      });
    }

    // Fan failure
    if (cpuTemp > 75 && fanSpeed < 2000) {
      alertsList.push({
        id: 'fan-crit',
        severity: 'CRITICAL',
        message: `Exhaust fan malfunction. Speed ${fanSpeed} RPM is too low for current heat load.`,
        timestamp: 'Just now'
      });
    } else if (fanSpeed > 5200) {
      alertsList.push({
        id: 'fan-warn',
        severity: 'WARNING',
        message: `Fan is operating at max speed (${fanSpeed} RPM). High noise level expected.`,
        timestamp: 'Just now'
      });
    }

    // Battery alerts
    if (battery < 10) {
      alertsList.push({
        id: 'bat-crit',
        severity: 'CRITICAL',
        message: `Battery critically low: ${battery}%. Save your work immediately.`,
        timestamp: 'Just now'
      });
    } else if (battery < 20) {
      alertsList.push({
        id: 'bat-warn',
        severity: 'WARNING',
        message: `Low Battery: ${battery}%. Please connect the charger.`,
        timestamp: 'Just now'
      });
    }

    if (batteryHealth < 80) {
      alertsList.push({
        id: 'bat-health-warn',
        severity: 'WARNING',
        message: `Battery health degraded to ${batteryHealth}%. Battery runtime is limited.`,
        timestamp: '1h ago'
      });
    }

    // SSD Alerts
    if (ssdTemp > 62) {
      alertsList.push({
        id: 'ssd-temp-crit',
        severity: 'CRITICAL',
        message: `SSD temperature critical: ${ssdTemp}°C. Data corruption risk high.`,
        timestamp: 'Just now'
      });
    } else if (ssdTemp > 52) {
      alertsList.push({
        id: 'ssd-temp-warn',
        severity: 'WARNING',
        message: `Elevated SSD temperature: ${ssdTemp}°C. Restrict high-speed disk writes.`,
        timestamp: 'Just now'
      });
    }

    // RAM Alerts
    if (ram > 90) {
      alertsList.push({
        id: 'ram-warn',
        severity: 'WARNING',
        message: `High memory load: ${ram}%. Out of memory issues may occur.`,
        timestamp: 'Just now'
      });
    }

    // WiFi signal
    if (wifiSignal < 35) {
      alertsList.push({
        id: 'wifi-info',
        severity: 'INFO',
        message: `Weak Wi-Fi signal detected: ${wifiSignal}%. Latency spikes may happen.`,
        timestamp: '5m ago'
      });
    }

    // Power charge status info
    if (telemetry.charging && battery < 100) {
      alertsList.push({
        id: 'power-info',
        severity: 'INFO',
        message: `External Power connected. Charging battery...`,
        timestamp: 'Just now'
      });
    }

    return alertsList;
  };

  const activeAlerts = getAlerts();

  const getAlertStyles = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          icon: AlertOctagon,
          bg: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
          badge: 'bg-rose-500/20 text-rose-400 border-rose-500/30'
        };
      case 'WARNING':
        return {
          icon: AlertTriangle,
          bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
          badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
        };
      default:
        return {
          icon: Info,
          bg: 'bg-sky-500/10 border-sky-500/20 text-sky-400',
          badge: 'bg-sky-500/20 text-sky-400 border-sky-500/30'
        };
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0f1d]/60 border border-[#1e293b] rounded-2xl p-4 backdrop-blur-md">
      <h3 className="text-sm font-bold tracking-wider text-slate-300 uppercase mb-3 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-rose-500" />
          Active System Alerts
        </span>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
          {activeAlerts.length} Active
        </span>
      </h3>

      <div className="flex-1 overflow-y-auto space-y-2 max-h-[170px] pr-1 scrollbar-thin">
        {activeAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-28 text-slate-500 border border-dashed border-slate-800 rounded-xl">
            <Info className="w-6 h-6 mb-1 opacity-40 text-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold">No active issues detected</span>
            <span className="text-[10px] opacity-60">System is running within normal ranges</span>
          </div>
        ) : (
          activeAlerts.map((alert) => {
            const styles = getAlertStyles(alert.severity);
            const Icon = styles.icon;

            return (
              <div
                key={alert.id}
                className={`flex gap-3 p-2.5 rounded-xl border ${styles.bg} animate-fadeIn`}
              >
                <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${styles.badge}`}>
                      {alert.severity}
                    </span>
                    <span className="text-[9px] text-slate-500 font-medium">{alert.timestamp}</span>
                  </div>
                  <p className="text-[10px] font-medium leading-relaxed break-words text-slate-200">
                    {alert.message}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

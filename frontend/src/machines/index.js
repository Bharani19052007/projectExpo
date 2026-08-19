// Enterprise Digital Twin Machine Registry & Configuration Manager

import { siemensUnit1Data } from './siemensUnit1';
import { siemensUnit2Data } from './siemensUnit2';
import { abbRoboticCellData } from './abbRoboticCell';
import { boschSmartCellData } from './boschSmartCell';
import { schneiderConveyorData } from './schneiderConveyor';
import { industrialAirCompressorData } from './industrialAirCompressor';
import { industrialPumpStationData } from './industrialPumpStation';
import { steamBoilerData } from './steamBoiler';
import { siemensCncData } from './siemensCnc';
import { automotiveWeldingCellData } from './automotiveWeldingCell';
import { motorM15Data } from './motorM15';
import { press45TData } from './press45T';
import { smartphoneTwinData } from './smartphoneTwin';

export const machinesRegistry = {
  "MOTOR-M-15": motorM15Data,
  "SIEM-CNC-5AXIS": siemensCncData,
  "ABB-ROB-CELL-04": abbRoboticCellData,
  "CLEAVER-BOILER-500": steamBoilerData,
  "INGERSOLL-COMP-200": industrialAirCompressorData,
  "KSB-PUMP-STATION": industrialPumpStationData,
  "SIEM-UNIT1-2026": siemensUnit1Data,
  "SIEM-UNIT2-PKG": siemensUnit2Data,
  "BOSCH-SMART-CELL": boschSmartCellData,
  "SCHN-CONV-SORT": schneiderConveyorData,
  "KUKA-WELD-CELL": automotiveWeldingCellData,
  "PRESS-45T-02": press45TData,
  "MOBILE_001": smartphoneTwinData,
  "MOBILE-TWIN-001": smartphoneTwinData,
};

export function getMachineConfig(machineId) {
  if (!machineId) return motorM15Data;
  return machinesRegistry[machineId] || machinesRegistry["MOTOR-M-15"] || siemensUnit1Data;
}

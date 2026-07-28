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

export const machinesRegistry = {
  "SIEM-UNIT1-2026": siemensUnit1Data,
  "SIEM-UNIT2-PKG": siemensUnit2Data,
  "ABB-ROB-CELL-04": abbRoboticCellData,
  "BOSCH-SMART-CELL": boschSmartCellData,
  "SCHN-CONV-SORT": schneiderConveyorData,
  "INGERSOLL-COMP-200": industrialAirCompressorData,
  "KSB-PUMP-STATION": industrialPumpStationData,
  "CLEAVER-BOILER-500": steamBoilerData,
  "SIEM-CNC-5AXIS": siemensCncData,
  "KUKA-WELD-CELL": automotiveWeldingCellData,
};

export function getMachineConfig(machineId) {
  if (!machineId) return siemensUnit1Data;
  return machinesRegistry[machineId] || siemensUnit1Data;
}

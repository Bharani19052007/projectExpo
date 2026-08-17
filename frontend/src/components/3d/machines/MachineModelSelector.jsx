import React from 'react';
import SiemensUnit1Model from './SiemensUnit1Model';
import SiemensUnit2Model from './SiemensUnit2Model';
import AbbRoboticCellModel from './AbbRoboticCellModel';
import BoschSmartCellModel from './BoschSmartCellModel';
import SchneiderConveyorModel from './SchneiderConveyorModel';
import IndustrialAirCompressorModel from './IndustrialAirCompressorModel';
import IndustrialPumpStationModel from './IndustrialPumpStationModel';
import SteamBoilerModel from './SteamBoilerModel';
import SiemensCncModel from './SiemensCncModel';
import AutomotiveWeldingCellModel from './AutomotiveWeldingCellModel';
import Press45TModel from './Press45TModel';
import MotorM15Model from './MotorM15Model';
import SmartphoneTwinModel from './SmartphoneTwinModel';
import TurbineModel from '../TurbineModel';

export default function MachineModelSelector({
  machineId,
  isHologram = false,
  viewMode = 'CAD',
  selectedComponent,
  setSelectedComponent,
  isSimulatingFailure = false,
  components = [],
  telemetry = null,
}) {
  const commonProps = {
    isHologram,
    viewMode,
    selectedComponent,
    setSelectedComponent,
    isSimulatingFailure,
    components,
    telemetry,
  };

  switch (machineId) {
    case 'MOTOR-M-15':
      return <MotorM15Model {...commonProps} />;
    case 'SIEM-CNC-5AXIS':
    case 'CNC-MILL-01':
      return <SiemensCncModel {...commonProps} />;
    case 'ABB-ROB-CELL-04':
    case 'ROBOT-ARM-07':
      return <AbbRoboticCellModel {...commonProps} />;
    case 'CLEAVER-BOILER-500':
    case 'BOILER-B-02':
      return <SteamBoilerModel {...commonProps} />;
    case 'INGERSOLL-COMP-200':
    case 'COMP-01':
      return <IndustrialAirCompressorModel {...commonProps} />;
    case 'KSB-PUMP-STATION':
    case 'PUMP-P-204':
      return <IndustrialPumpStationModel {...commonProps} />;
    case 'PRESS-45T-02':
      return <Press45TModel {...commonProps} />;
    case 'TURBINE-GT-01':
    case 'TURBINE-01':
      return <TurbineModel {...commonProps} />;
    case 'BOSCH-SMART-CELL':
      return <BoschSmartCellModel {...commonProps} />;
    case 'SCHN-CONV-SORT':
    case 'CONV-12':
      return <SchneiderConveyorModel {...commonProps} />;
    case 'KUKA-WELD-CELL':
      return <AutomotiveWeldingCellModel {...commonProps} />;
    case 'SIEM-UNIT1-2026':
      return <SiemensUnit1Model {...commonProps} />;
    case 'SIEM-UNIT2-PKG':
      return <SiemensUnit2Model {...commonProps} />;
    case 'MOBILE_001':
    case 'MOBILE_002':
    case 'MOBILE_003':
    case 'MOBILE-TWIN-001':
    case 'SMARTPHONE-TWIN':
      return <SmartphoneTwinModel {...commonProps} />;
    default:
      return <MotorM15Model {...commonProps} />;
  }
}

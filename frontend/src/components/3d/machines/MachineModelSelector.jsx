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

export default function MachineModelSelector({
  machineId,
  isHologram = false,
  viewMode = 'CAD',
  selectedComponent,
  setSelectedComponent,
  isSimulatingFailure = false,
  components = [],
}) {
  const commonProps = {
    isHologram,
    viewMode,
    selectedComponent,
    setSelectedComponent,
    isSimulatingFailure,
    components,
  };

  switch (machineId) {
    case 'SIEM-UNIT1-2026':
      return <SiemensUnit1Model {...commonProps} />;
    case 'SIEM-UNIT2-PKG':
      return <SiemensUnit2Model {...commonProps} />;
    case 'ABB-ROB-CELL-04':
      return <AbbRoboticCellModel {...commonProps} />;
    case 'BOSCH-SMART-CELL':
      return <BoschSmartCellModel {...commonProps} />;
    case 'SCHN-CONV-SORT':
      return <SchneiderConveyorModel {...commonProps} />;
    case 'INGERSOLL-COMP-200':
      return <IndustrialAirCompressorModel {...commonProps} />;
    case 'KSB-PUMP-STATION':
      return <IndustrialPumpStationModel {...commonProps} />;
    case 'CLEAVER-BOILER-500':
      return <SteamBoilerModel {...commonProps} />;
    case 'SIEM-CNC-5AXIS':
      return <SiemensCncModel {...commonProps} />;
    case 'KUKA-WELD-CELL':
      return <AutomotiveWeldingCellModel {...commonProps} />;
    default:
      return <SiemensUnit1Model {...commonProps} />;
  }
}

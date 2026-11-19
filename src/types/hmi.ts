export type MachineStatus =
  | 'UNKNOWN'
  | 'IDLE'
  | 'RUNNING'
  | 'STOPPED'
  | 'EMERGENCY'
  | 'SAFETY_FAULT';

export type OperationMode = 'AUTOMATIC' | 'MANUAL';

export type AlarmCode =
  | 'LOW_PNEUMATIC_PRESSURE'
  | 'CYLINDER_TIMEOUT'
  | 'SERVO_OVERLOAD'
  | 'SAFETY_BARRIER_OPEN';

export type AlarmSeverity = 'CRITICAL' | 'WARNING';

export interface AlarmItem {
  id: string;
  code: AlarmCode;
  message: string;
  severity: AlarmSeverity;
  timestamp: string;
  active: boolean;
  acknowledged: boolean;
}

export interface StationTelemetry {
  status: MachineStatus;
  mode: OperationMode;
  axesReferenced: boolean;
  homingInProgress?: boolean;
  pneumaticPressureBar: number;
  emergencyMushroomPressed: boolean;
  safetyBarrierOpen: boolean;
  cylinderTimeout?: boolean;
  servoOverload?: boolean;
  activeFaults?: AlarmCode[];
}

export type HmiCommand =
  | 'START'
  | 'STOP'
  | 'EMERGENCY_STOP'
  | 'RESET'
  | 'HOME'
  | 'JOG_LEFT'
  | 'JOG_RIGHT'
  | 'ACK_ALARMS';
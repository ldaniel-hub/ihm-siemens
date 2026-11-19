export type MachineMode = 'MANUAL' | 'AUTO' | 'SEMI_AUTO';
export type MachineState = 'RUNNING' | 'STOPPED' | 'EMERGENCY' | 'ALARM';
export type Readiness = 'CONFIRMED' | 'NOT_CONFIRMED' | 'UNKNOWN';
export type HmiConnectionState = 'CONNECTED' | 'RECONNECTING' | 'DISCONNECTED' | 'UNKNOWN';

export interface ActiveAlarmSignal {
  id: string;
  message: string;
}

export interface HmiTelemetry {
  timestamp: string;
  machineMode: MachineMode;
  machineState: MachineState;
  safetyOk: Readiness;
  robotAtHome: Readiness;
  modulesMounted: Readiness;
  connectionState: HmiConnectionState;
  activeAlarms: ActiveAlarmSignal[];
}

export interface HmiAlarm extends ActiveAlarmSignal {
  active: boolean;
  acknowledgedLocally: boolean;
}

export interface HmiState {
  telemetry: HmiTelemetry;
  alarms: HmiAlarm[];
}

export type HmiCommand =
  | 'START'
  | 'STOP'
  | 'RESET'
  | 'SETUP'
  | 'DESLIGA'
  | 'EMERGENCY_STOP';

export type HmiAction =
  | { type: 'TELEMETRY_RECEIVED'; telemetry: HmiTelemetry }
  | { type: 'ACKNOWLEDGE_ALARM_LOCALLY'; alarmId: string }
  | { type: 'CLEAR_RESOLVED_ACKNOWLEDGED_ALARMS' }
  | { type: 'OPERATOR_COMMAND_SELECTED'; command: HmiCommand };

export function getStartBlockReason(state: HmiState): string | null {
  const { telemetry } = state;

  if (telemetry.connectionState !== 'CONNECTED') return 'Telemetria sem conexão confirmada';
  if (telemetry.machineState === 'EMERGENCY') return 'Parada de emergência ativa';
  if (telemetry.machineState === 'ALARM' || state.alarms.some((alarm) => alarm.active)) {
    return 'Alarme ativo';
  }
  if (telemetry.machineState === 'RUNNING') return 'Máquina já está em operação';
  if (telemetry.safetyOk !== 'CONFIRMED') return 'SEGURANÇA OK não confirmada';
  if (telemetry.robotAtHome !== 'CONFIRMED') return 'Posição home do robô não confirmada';
  if (telemetry.modulesMounted !== 'CONFIRMED') return 'Montagem dos cinco módulos não confirmada';

  return null;
}

export function reduceHmiState(state: HmiState, action: HmiAction): HmiState {
  switch (action.type) {
    case 'TELEMETRY_RECEIVED': {
      const activeSignals = new Map(
        action.telemetry.activeAlarms.map((alarm) => [alarm.id, alarm]),
      );
      const alarms = state.alarms.map((alarm) => {
        const currentSignal = activeSignals.get(alarm.id);
        if (!currentSignal) return { ...alarm, active: false };
        activeSignals.delete(alarm.id);
        return { ...alarm, ...currentSignal, active: true };
      });

      for (const signal of activeSignals.values()) {
        alarms.unshift({ ...signal, active: true, acknowledgedLocally: false });
      }

      return { telemetry: action.telemetry, alarms };
    }

    case 'ACKNOWLEDGE_ALARM_LOCALLY':
      return {
        ...state,
        alarms: state.alarms.map((alarm) =>
          alarm.id === action.alarmId
            ? { ...alarm, acknowledgedLocally: true }
            : alarm,
        ),
      };

    case 'CLEAR_RESOLVED_ACKNOWLEDGED_ALARMS':
      return {
        ...state,
        alarms: state.alarms.filter(
          (alarm) => alarm.active || !alarm.acknowledgedLocally,
        ),
      };

    case 'OPERATOR_COMMAND_SELECTED':
      return state;
  }
}

import type { HmiState, HmiTelemetry } from '../domain/hmi';

export type HmiMockScenario =
  | 'normal'
  | 'alarm'
  | 'emergency'
  | 'unknown-readiness'
  | 'disconnected';

export function isHmiMockScenario(value: string): value is HmiMockScenario {
  return [
    'normal',
    'alarm',
    'emergency',
    'unknown-readiness',
    'disconnected',
  ].includes(value);
}

const BASE_TELEMETRY: HmiTelemetry = {
  timestamp: new Date(0).toISOString(),
  machineMode: 'MANUAL',
  machineState: 'STOPPED',
  safetyOk: 'CONFIRMED',
  robotAtHome: 'CONFIRMED',
  modulesMounted: 'CONFIRMED',
  connectionState: 'CONNECTED',
  activeAlarms: [],
};

export function createHmiMockTelemetry(scenario: HmiMockScenario): HmiTelemetry {
  const timestamp = new Date().toISOString();
  const base = { ...BASE_TELEMETRY, timestamp };

  switch (scenario) {
    case 'normal':
      return base;
    case 'alarm':
      return {
        ...base,
        machineState: 'ALARM',
        activeAlarms: [{ id: 'mock-alarm-1', message: 'Falha simulada para teste visual.' }],
      };
    case 'emergency':
      return {
        ...base,
        machineState: 'EMERGENCY',
        safetyOk: 'NOT_CONFIRMED',
        activeAlarms: [{ id: 'mock-emergency-1', message: 'Emergência simulada para teste visual.' }],
      };
    case 'unknown-readiness':
      return {
        ...base,
        safetyOk: 'UNKNOWN',
        robotAtHome: 'UNKNOWN',
        modulesMounted: 'UNKNOWN',
      };
    case 'disconnected':
      return { ...base, connectionState: 'DISCONNECTED' };
  }
}

export function createInitialHmiMockState(): HmiState {
  return {
    telemetry: createHmiMockTelemetry('normal'),
    alarms: [],
  };
}

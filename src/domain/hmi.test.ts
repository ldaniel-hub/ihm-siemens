import { describe, expect, it } from 'vitest';
import { getStartBlockReason, reduceHmiState } from './hmi';
import { createHmiMockTelemetry, createInitialHmiMockState } from '../mocks/hmiDevMocks';

function stateFor(scenario: Parameters<typeof createHmiMockTelemetry>[0]) {
  return reduceHmiState(createInitialHmiMockState(), {
    type: 'TELEMETRY_RECEIVED',
    telemetry: createHmiMockTelemetry(scenario),
  });
}

describe('HMI domain behavior', () => {
  it('allows START only when connection, safety, home and module readiness are confirmed', () => {
    expect(getStartBlockReason(stateFor('normal'))).toBeNull();
    expect(getStartBlockReason(stateFor('unknown-readiness'))).toBe(
      'SEGURANÇA OK não confirmada',
    );
    expect(getStartBlockReason(stateFor('disconnected'))).toBe(
      'Telemetria sem conexão confirmada',
    );
  });

  it('blocks START when home or module mounting is not confirmed', () => {
    const normal = createHmiMockTelemetry('normal');
    const noHome = reduceHmiState(createInitialHmiMockState(), {
      type: 'TELEMETRY_RECEIVED',
      telemetry: { ...normal, robotAtHome: 'UNKNOWN' },
    });
    const modulesNotMounted = reduceHmiState(createInitialHmiMockState(), {
      type: 'TELEMETRY_RECEIVED',
      telemetry: { ...normal, modulesMounted: 'NOT_CONFIRMED' },
    });

    expect(getStartBlockReason(noHome)).toBe('Posição home do robô não confirmada');
    expect(getStartBlockReason(modulesNotMounted)).toBe(
      'Montagem dos cinco módulos não confirmada',
    );
  });

  it('blocks START for an active alarm even when machine state is STOPPED', () => {
    const telemetry = {
      ...createHmiMockTelemetry('normal'),
      activeAlarms: [{ id: 'mock-active-alarm', message: 'Falha simulada.' }],
    };
    const state = reduceHmiState(createInitialHmiMockState(), {
      type: 'TELEMETRY_RECEIVED',
      telemetry,
    });

    expect(getStartBlockReason(state)).toBe('Alarme ativo');
  });

  it('does not change machine or alarm state when RESET is selected', () => {
    const state = stateFor('alarm');

    const afterReset = reduceHmiState(state, {
      type: 'OPERATOR_COMMAND_SELECTED',
      command: 'RESET',
    });

    expect(afterReset).toBe(state);
  });

  it('records ACK locally without normalizing an active alarm or unlocking START', () => {
    const state = stateFor('alarm');
    const afterAck = reduceHmiState(state, {
      type: 'ACKNOWLEDGE_ALARM_LOCALLY',
      alarmId: 'mock-alarm-1',
    });

    expect(afterAck.alarms[0]).toMatchObject({
      active: true,
      acknowledgedLocally: true,
    });
    expect(getStartBlockReason(afterAck)).toBe('Alarme ativo');
  });

  it('normalizes an alarm only after telemetry clears it and allows clearing only after local ACK', () => {
    const active = stateFor('alarm');
    const acknowledged = reduceHmiState(active, {
      type: 'ACKNOWLEDGE_ALARM_LOCALLY',
      alarmId: 'mock-alarm-1',
    });
    const normalized = reduceHmiState(acknowledged, {
      type: 'TELEMETRY_RECEIVED',
      telemetry: createHmiMockTelemetry('normal'),
    });

    expect(normalized.alarms[0]).toMatchObject({
      active: false,
      acknowledgedLocally: true,
    });
    expect(
      reduceHmiState(normalized, { type: 'CLEAR_RESOLVED_ACKNOWLEDGED_ALARMS' }).alarms,
    ).toHaveLength(0);
  });

  it('does not clear active acknowledged alarms or normalized unacknowledged alarms', () => {
    const active = stateFor('alarm');
    const activeAcknowledged = reduceHmiState(active, {
      type: 'ACKNOWLEDGE_ALARM_LOCALLY',
      alarmId: 'mock-alarm-1',
    });
    const normalizedUnacknowledged = reduceHmiState(active, {
      type: 'TELEMETRY_RECEIVED',
      telemetry: createHmiMockTelemetry('normal'),
    });

    expect(
      reduceHmiState(activeAcknowledged, { type: 'CLEAR_RESOLVED_ACKNOWLEDGED_ALARMS' }).alarms,
    ).toHaveLength(1);
    expect(
      reduceHmiState(normalizedUnacknowledged, {
        type: 'CLEAR_RESOLVED_ACKNOWLEDGED_ALARMS',
      }).alarms,
    ).toHaveLength(1);
  });
});

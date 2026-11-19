import { useReducer, useState } from 'react';
import './styles/theme.css';
import './styles/App.css';
import { AlarmList } from './components/AlarmList';
import { ManualControls } from './components/ManualControls';
import { RecoveryChecklist } from './components/RecoveryChecklist';
import { StatusHeader } from './components/StatusHeader';
import { getStartBlockReason, reduceHmiState, type HmiCommand } from './domain/hmi';
import {
  createHmiMockTelemetry,
  createInitialHmiMockState,
  isHmiMockScenario,
  type HmiMockScenario,
} from './mocks/hmiDevMocks';

export default function App() {
  const [state, dispatch] = useReducer(reduceHmiState, undefined, createInitialHmiMockState);
  const [scenario, setScenario] = useState<HmiMockScenario>('normal');
  const [lastCommand, setLastCommand] = useState<HmiCommand | null>(null);
  const startBlockReason = getStartBlockReason(state);

  const handleScenarioChange = (nextScenario: HmiMockScenario) => {
    setScenario(nextScenario);
    dispatch({
      type: 'TELEMETRY_RECEIVED',
      telemetry: createHmiMockTelemetry(nextScenario),
    });
  };

  const handleCommand = (command: HmiCommand) => {
    if (command === 'START' && startBlockReason) return;
    dispatch({ type: 'OPERATOR_COMMAND_SELECTED', command });
    setLastCommand(command);
  };

  return (
    <div className="smart-hmi-root">
      <main className="ihm-container">
        <div className="ihm-page-heading">
          <div>
            <p className="ihm-eyebrow">MÓDULO G2</p>
            <h1>IHM Siemens — Controle da Estação</h1>
          </div>
          <span className="smart-status-pill smart-status-pill--warning" role="status">
            MODO SIMULAÇÃO (MOCK)
          </span>
        </div>

        <section className="smart-card ihm-mock-controls" aria-label="Cenários simulados">
          <label htmlFor="mock-scenario">Cenário de telemetria simulada</label>
          <select
            id="mock-scenario"
            value={scenario}
            onChange={(event) => {
              const nextScenario = event.target.value;
              if (isHmiMockScenario(nextScenario)) handleScenarioChange(nextScenario);
            }}
          >
            <option value="normal">Normal</option>
            <option value="alarm">Alarme ativo</option>
            <option value="emergency">Emergência</option>
            <option value="unknown-readiness">Prontidão desconhecida</option>
            <option value="disconnected">Conexão perdida</option>
          </select>
        </section>

        <StatusHeader telemetry={state.telemetry} />
        <RecoveryChecklist machineState={state.telemetry.machineState} />
        <ManualControls
          startBlockReason={startBlockReason}
          onCommand={handleCommand}
        />
        <AlarmList
          alarms={state.alarms}
          onAck={(alarmId) => dispatch({ type: 'ACKNOWLEDGE_ALARM_LOCALLY', alarmId })}
          onClear={() => dispatch({ type: 'CLEAR_RESOLVED_ACKNOWLEDGED_ALARMS' })}
        />

        <p className="ihm-mock-disclaimer">
          Nenhum dado de PLC é recebido e nenhum comando é enviado ao barramento. As ações
          abaixo servem apenas para validar a interface.
        </p>
        {lastCommand && <p role="status">Última ação simulada localmente: {lastCommand}</p>}
      </main>
    </div>
  );
}
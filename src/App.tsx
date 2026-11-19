import { useEffect, useState } from 'react';
import './styles/theme.css';
import './styles/App.css';
import { createEvent, emit, on, type MachineStatus, type OperatingMode } from '@ffe-senai/smart40';


export default function App() {
  const [status, setStatus] = useState<MachineStatus>('UNKNOWN');
  const [modo, setModo] = useState<OperatingMode>('MANUAL');
  const [alarmes, setAlarmes] = useState<string[]>([]);
  const [intertravamentoOk, setIntertravamentoOk] = useState(false);
  const [emergenciaAtiva, setEmergenciaAtiva] = useState(false);

  useEffect(() => {
    const unsubscribe = on('machine.telemetry', (event) => {
      setStatus(event.data.status);
      setModo(event.data.mode);
      setEmergenciaAtiva(event.data.emergencyActive);
      setIntertravamentoOk(event.data.safetyInterlockOk);
      setAlarmes(event.data.alarmCodes);
    });

    return unsubscribe;
  }, []);

  const despacharComando = (acao: 'START' | 'STOP' | 'RESET' | 'EMERGENCY_STOP' | 'MOVE_LEFT' | 'MOVE_RIGHT') => {
    emit(createEvent('command.requested', {
      commandId: crypto.randomUUID(),
      target: 'machine',
      action: acao,
      sourceModule: 'ihm',
      simulation: true,
    }, 'mock'));
  };

  const handleStart = () => {
    if (emergenciaAtiva || status === 'EMERGENCY' || status === 'SAFETY_FAULT') {
      alert('Operação bloqueada: Linha de emergência ou falha de segurança ativa.');
      return;
    }
    if (alarmes.length > 0) {
      alert('Operação bloqueada: Alarmes pendentes de confirmação.');
      return;
    }
    if (!intertravamentoOk) {
      alert('Operação bloqueada: Intertravamento de segurança não confirmado.');
      return;
    }
    despacharComando('START');
  };

  const handleComandoManual = (acaoManual: 'MOVE_LEFT' | 'MOVE_RIGHT') => {
    if (modo === 'AUTOMATIC') {
      console.warn('Ação bloqueada: Movimentos manuais inibidos no modo AUTOMÁTICO.');
      return;
    }
    despacharComando(acaoManual);
  };

  const handleAckAlarmes = () => {
    despacharComando('RESET');
  };

  return (
    <div className="smart-hmi-root">
      <main className="ihm-container">
      <h1>IHM Siemens - Controle da Estação</h1>
      
      {/* Indicadores de Status */}
      <section className="smart-card">
        <h2 className="smart-card-title">Indicadores de Status</h2>
        <div className="ihm-status-grid">
          <div className="ihm-status-item">
            <span className="ihm-status-label">Status</span>
            <span className={`smart-status-pill ${
              status === 'EMERGENCY' || status === 'SAFETY_FAULT'
                ? 'smart-status-pill--danger'
                : status === 'RUNNING'
                  ? 'smart-status-pill--ok'
                  : 'smart-status-pill--warning'
            }`}>{status}</span>
          </div>
          <div className="ihm-status-item">
            <span className="ihm-status-label">Modo</span>
            <span className="smart-digital-display">{modo}</span>
          </div>
          <div className="ihm-status-item">
            <span className="ihm-status-label">Intertravamento</span>
            <span className={`smart-status-pill ${intertravamentoOk ? 'smart-status-pill--ok' : 'smart-status-pill--danger'}`}>
              {intertravamentoOk ? 'OK' : 'NOK'}
            </span>
          </div>
        </div>
      </section>

      {/* Lista de Alarmes */}
      {alarmes.length > 0 && (
        <section className="smart-card">
          <h2 className="smart-card-title ihm-alarm-title">Alarmes Ativos</h2>
          <ul className="ihm-alarm-list">
            {alarmes.map((alarme, idx) => <li key={idx}>{alarme}</li>)}
          </ul>
          <button className="smart-btn smart-btn--danger" onClick={handleAckAlarmes}>Reconhecer Falhas (ACK)</button>
        </section>
      )}

      {/* Botões de Comando Principais */}
      <section className="smart-card">
        <h2 className="smart-card-title">Comandos Principais</h2>
        <div className="ihm-actions">
          <button className="smart-btn smart-btn--ok" onClick={handleStart}>START</button>
          <button className="smart-btn smart-btn--warning" onClick={() => despacharComando('STOP')}>STOP</button>
          <button className="smart-btn smart-btn--danger" onClick={() => despacharComando('EMERGENCY_STOP')}>E-STOP</button>
          <button className="smart-btn smart-btn--primary" onClick={() => despacharComando('RESET')}>Reset</button>
        </div>
      </section>

      {/* Painel de Controle Manual (Bloqueado em AUTO) */}
      <section className={`smart-card ihm-manual-panel ${modo === 'AUTOMATIC' ? 'ihm-manual-panel--blocked' : ''}`}>
        <h2 className="smart-card-title">Controle Manual de Atuadores</h2>
        <div className="ihm-manual-actions">
          <button className="smart-btn" disabled={modo === 'AUTOMATIC'} onClick={() => handleComandoManual('MOVE_LEFT')}>Mover à esquerda</button>
          <button className="smart-btn" disabled={modo === 'AUTOMATIC'} onClick={() => handleComandoManual('MOVE_RIGHT')}>Mover à direita</button>
        </div>
      </section>
      </main>
    </div>
  );
}
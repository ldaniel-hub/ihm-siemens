import { useEffect, useState } from 'react';
import './App.css'
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
    <div className="ihm-container" style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>IHM Siemens - Controle da Estação</h1>
      
      {/* Indicadores de Status */}
      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
        <p><strong>Status:</strong> {status}</p>
        <p><strong>Modo:</strong> {modo}</p>
        <p><strong>Intertravamento de segurança:</strong> {intertravamentoOk ? 'OK' : 'NOK'}</p>
      </div>

      {/* Lista de Alarmes */}
      {alarmes.length > 0 && (
        <div style={{ backgroundColor: '#ffebee', padding: '10px', marginBottom: '20px' }}>
          <h3 style={{ color: '#c62828' }}>Alarmes Ativos</h3>
          <ul>
            {alarmes.map((alarme, idx) => <li key={idx}>{alarme}</li>)}
          </ul>
          <button onClick={handleAckAlarmes}>Reconhecer Falhas (ACK)</button>
        </div>
      )}

      {/* Botões de Comando Principais */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={handleStart} style={{ backgroundColor: 'green', color: 'white' }}>START</button>
        <button onClick={() => despacharComando('STOP')} style={{ backgroundColor: 'yellow', color: 'black' }}>STOP</button>
        <button onClick={() => despacharComando('EMERGENCY_STOP')} style={{ backgroundColor: 'red', color: 'white' }}>E-STOP</button>
        <button onClick={() => despacharComando('RESET')}>Reset</button>
      </div>

      {/* Painel de Controle Manual (Bloqueado em AUTO) */}
      <div style={{ marginTop: '20px', opacity: modo === 'AUTOMATIC' ? 0.5 : 1 }}>
        <h3>Controle Manual de Atuadores</h3>
        <button disabled={modo === 'AUTOMATIC'} onClick={() => handleComandoManual('MOVE_LEFT')}>Mover à esquerda</button>
        <button disabled={modo === 'AUTOMATIC'} onClick={() => handleComandoManual('MOVE_RIGHT')}>Mover à direita</button>
      </div>
    </div>
  );
}
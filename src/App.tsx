import { useEffect, useState } from 'react';
import './App.css'
import { bus } from '@ffe-senai/smart40';


type ModoOperacao = 'MANUAL' | 'AUTOMATICO';
type StatusProcesso = 'AGUARDANDO' | 'EMERGENCIA' | 'OPERANDO' | 'FALHA';

interface Telemetria {
  processo: {
    status: StatusProcesso;
    modo: ModoOperacao;
    homing: 'OK' | 'NOK';
  };
  diagnostico: {
    alarmes: string[];
    pressaoBar: number;
  };
}

export default function App() {
  const [status, setStatus] = useState<StatusProcesso>('AGUARDANDO');
  const [modo, setModo] = useState<ModoOperacao>('MANUAL');
  const [alarmes, setAlarmes] = useState<string[]>([]);
  const [homingOk, setHomingOk] = useState(false);
  const [pressao, setPressao] = useState(0);

  useEffect(() => {
    // 1. Escuta contínua de Telemetria via barramento de eventos do App Shell[cite: 41]
    const handleTelemetria = (dados: Telemetria) => {
      setStatus(dados.processo.status);
      setModo(dados.processo.modo);
      setHomingOk(dados.processo.homing === 'OK');
      setAlarmes(dados.diagnostico.alarmes);
      setPressao(dados.diagnostico.pressaoBar);
    };

    bus.on('smart40:telemetria', handleTelemetria); //[cite: 41]

    return () => {
      bus.off('smart40:telemetria', handleTelemetria); // Prevenção de vazamento de memória[cite: 41]
    };
  }, []);

  // 2. Função central de despacho de comandos
  const despacharComando = (acao: string) => {
    const comando = {
      origem: 'IHM_SIEMENS',
      acao: acao,
      modo: modo,
      timestamp: new Date().toISOString(),
    };
    
    // Envia o evento para o App Shell, que fará o envio real via WebSocket[cite: 41]
    bus.emit('smart40:comando', comando); //[cite: 41]
  };

  // 3. Lógica de Intertravamento (Matriz de Segurança e Modos)
  const handleStart = () => {
    if (status === 'EMERGENCIA') {
      alert('Operação bloqueada: Linha de emergência não rearmada.');
      return;
    }
    if (alarmes.length > 0) {
      alert('Operação bloqueada: Alarmes pendentes de confirmação.');
      return;
    }
    if (!homingOk) {
      alert('Operação bloqueada: Rotina de Homing não executada.');
      return;
    }
    despacharComando('START');
  };

  const handleComandoManual = (acaoManual: string) => {
    if (modo === 'AUTOMATICO') {
      console.warn('Ação bloqueada: Movimentos manuais inibidos no modo AUTOMÁTICO.');
      return;
    }
    despacharComando(acaoManual);
  };

  // 4. Procedimento Padrão de Recuperação Pós-Emergência (POP)
  const handleAckAlarmes = () => {
    // Limpa falhas ativas na IHM e solicita reset de relés no CLP
    despacharComando('ACK_ALARMS');
    despacharComando('RESET');
  };

  return (
    <div className="ihm-container" style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>IHM Siemens - Controle da Estação</h1>
      
      {/* Indicadores de Status */}
      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
        <p><strong>Status:</strong> {status}</p>
        <p><strong>Modo:</strong> {modo}</p>
        <p><strong>Homing:</strong> {homingOk ? '🟢 OK' : '🔴 NOK'}</p>
        <p><strong>Pressão Pneumática:</strong> {pressao} bar {pressao < 4 && '⚠️ (Baixa Pressão)'}</p>
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
        <button onClick={() => despacharComando('HOME')}>Executar Homing</button>
      </div>

      {/* Painel de Controle Manual (Bloqueado em AUTO) */}
      <div style={{ marginTop: '20px', opacity: modo === 'AUTOMATICO' ? 0.5 : 1 }}>
        <h3>Controle Manual de Atuadores</h3>
        <button onClick={() => handleComandoManual('CILINDRO_AVANCA')}>Avançar Cilindro</button>
        <button onClick={() => handleComandoManual('CILINDRO_RECUA')}>Recuar Cilindro</button>
      </div>
    </div>
  );
}
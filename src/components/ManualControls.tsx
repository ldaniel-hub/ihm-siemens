import type { HmiCommand } from '../domain/hmi';

interface ManualControlsProps {
  startBlockReason: string | null;
  onCommand: (command: HmiCommand) => void;
}

export function ManualControls({ startBlockReason, onCommand }: ManualControlsProps) {
  return (
    <section className="smart-card">
      <h2 className="smart-card-title">Comandos da botoeira — simulação local</h2>
      {startBlockReason && <p className="ihm-block-reason">START bloqueado: {startBlockReason}</p>}
      <div className="ihm-actions">
        <button
          type="button"
          className="smart-btn smart-btn--ok"
          disabled={Boolean(startBlockReason)}
          title={startBlockReason ?? 'Iniciar ciclo (simulado)'}
          onClick={() => onCommand('START')}
        >
          START
        </button>
        <button type="button" className="smart-btn smart-btn--warning" onClick={() => onCommand('STOP')}>
          STOP
        </button>
        <button type="button" className="smart-btn smart-btn--primary" onClick={() => onCommand('RESET')}>
          RESET
        </button>
        <button type="button" className="smart-btn" onClick={() => onCommand('SETUP')}>
          SETUP
        </button>
        <button type="button" className="smart-btn" onClick={() => onCommand('DESLIGA')}>
          DESLIGA
        </button>
        <button
          type="button"
          className="smart-btn smart-btn--danger"
          onClick={() => onCommand('EMERGENCY_STOP')}
        >
          E-STOP (MOCK)
        </button>
      </div>
    </section>
  );
}

import type { HmiCommand, MachineStatus, OperationMode } from '../types/hmi';

interface ManualControlsProps {
  status: MachineStatus;
  mode: OperationMode;
  axesReferenced: boolean;
  homingInProgress: boolean;
  canStart: boolean;
  startBlockReason: string | null;
  onCommand: (cmd: HmiCommand) => void;
}

export function ManualControls({
  status,
  mode,
  axesReferenced,
  homingInProgress,
  canStart,
  startBlockReason,
  onCommand,
}: ManualControlsProps) {
  const isEmergencyOrFault =
    status === 'EMERGENCY' || status === 'SAFETY_FAULT' || status === 'UNKNOWN';
  const isManualBlocked = mode === 'AUTOMATIC' || isEmergencyOrFault;
  const isHomingDisabled =
    isEmergencyOrFault || homingInProgress || (mode === 'AUTOMATIC' && status === 'RUNNING');

  return (
    <section className="smart-card">
      <h3 className="smart-card-title">Botoeira &amp; Controle de Eixos</h3>

      {/* Ciclo Principal */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '1rem' }}>
        <button
          type="button"
          className="smart-btn smart-btn--ok"
          disabled={!canStart}
          title={startBlockReason ?? 'Iniciar ciclo'}
          onClick={() => onCommand('START')}
        >
          START
        </button>

        <button
          type="button"
          className="smart-btn smart-btn--warning"
          disabled={status === 'UNKNOWN'}
          onClick={() => onCommand('STOP')}
        >
          STOP
        </button>

        <button
          type="button"
          className="smart-btn"
          onClick={() => onCommand('RESET')}
        >
          RESET
        </button>

        <button
          type="button"
          className="smart-btn smart-btn--danger"
          style={{ marginLeft: 'auto', fontWeight: 800 }}
          onClick={() => onCommand('EMERGENCY_STOP')}
        >
          EMERGENCY STOP
        </button>
      </div>

      {startBlockReason && (
        <div
          style={{
            fontSize: '0.8rem',
            color: 'var(--smart-status-warning)',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '6px',
            padding: '0.5rem 0.75rem',
            marginBottom: '1rem',
          }}
        >
          Intertravamento START ativo: <strong>{startBlockReason}</strong>
        </div>
      )}

      {/* Referenciamento (Homing) e JOG Manual */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '0.75rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--smart-border)',
        }}
      >
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--smart-text-muted)', marginBottom: '0.4rem' }}>
            REFERENCIAMENTO DE EIXOS
          </div>
          <button
            type="button"
            className="smart-btn smart-btn--primary"
            style={{ width: '100%' }}
            disabled={isHomingDisabled}
            onClick={() => onCommand('HOME')}
          >
            {homingInProgress
              ? 'REFERENCIANDO...'
              : axesReferenced
              ? 'RE-REFERENCIAR (HOMING)'
              : 'EXECUTAR HOMING'}
          </button>
        </div>

        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--smart-text-muted)', marginBottom: '0.4rem' }}>
            MOVIMENTAÇÃO MANUAL {mode === 'AUTOMATIC' ? '(BLOQUEADA EM AUTO)' : ''}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className="smart-btn"
              style={{ flex: 1 }}
              disabled={isManualBlocked}
              onClick={() => onCommand('JOG_LEFT')}
            >
              ◀ MOVER ESQUERDA
            </button>
            <button
              type="button"
              className="smart-btn"
              style={{ flex: 1 }}
              disabled={isManualBlocked}
              onClick={() => onCommand('JOG_RIGHT')}
            >
              MOVER DIREITA ▶
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
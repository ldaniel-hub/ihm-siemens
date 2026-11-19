import type { MachineStatus, OperationMode } from '../types/hmi';

interface StatusHeaderProps {
  status: MachineStatus;
  mode: OperationMode;
  axesReferenced: boolean;
  pneumaticPressureBar: number;
}

function getStatusBadgeClass(status: MachineStatus): string {
  if (status === 'RUNNING' || status === 'IDLE') return 'smart-status-pill smart-status-pill--ok';
  if (status === 'EMERGENCY' || status === 'SAFETY_FAULT') {
    return 'smart-status-pill smart-status-pill--danger';
  }
  return 'smart-status-pill smart-status-pill--warning';
}

function getPressureColor(bar: number): string {
  if (bar < 4.0) return 'var(--smart-status-danger)';
  if (bar < 6.0) return 'var(--smart-status-warning)';
  return 'var(--smart-status-ok)';
}

export function StatusHeader({
  status,
  mode,
  axesReferenced,
  pneumaticPressureBar,
}: StatusHeaderProps) {
  return (
    <header
      className="smart-card"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
      }}
    >
      <div>
        <div style={{ fontSize: '0.75rem', color: 'var(--smart-text-muted)' }}>
          ESTAÇÃO SMART 4.0 — MÓDULO G2
        </div>
        <h2 style={{ margin: '0.15rem 0 0 0', fontSize: '1.15rem' }}>
          IHM Siemens &amp; Botoeira
        </h2>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
        <div>
          <span style={{ fontSize: '0.7rem', display: 'block', color: 'var(--smart-text-muted)' }}>
            ESTADO CLP
          </span>
          <span className={getStatusBadgeClass(status)}>{status}</span>
        </div>

        <div>
          <span style={{ fontSize: '0.7rem', display: 'block', color: 'var(--smart-text-muted)' }}>
            MODO OPERAÇÃO
          </span>
          <span
            className={`smart-status-pill ${
              mode === 'AUTOMATIC' ? 'smart-status-pill--ok' : 'smart-status-pill--warning'
            }`}
          >
            {mode}
          </span>
        </div>

        <div>
          <span style={{ fontSize: '0.7rem', display: 'block', color: 'var(--smart-text-muted)' }}>
            EIXOS_REFERENCIADOS
          </span>
          <span
            className={`smart-status-pill ${
              axesReferenced ? 'smart-status-pill--ok' : 'smart-status-pill--danger'
            }`}
          >
            {axesReferenced ? 'OK' : 'NOK'}
          </span>
        </div>

        <div>
          <span style={{ fontSize: '0.7rem', display: 'block', color: 'var(--smart-text-muted)' }}>
            REDE PNEUMÁTICA
          </span>
          <span
            className="smart-digital-display"
            style={{ color: getPressureColor(pneumaticPressureBar) }}
          >
            {pneumaticPressureBar.toFixed(1)} bar
          </span>
        </div>
      </div>
    </header>
  );
}
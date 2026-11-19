import type { HmiTelemetry } from '../domain/hmi';

interface StatusHeaderProps {
  telemetry: HmiTelemetry;
}

function readinessLabel(value: HmiTelemetry['safetyOk']): string {
  if (value === 'CONFIRMED') return 'CONFIRMADO';
  if (value === 'NOT_CONFIRMED') return 'NÃO CONFIRMADO';
  return 'DESCONHECIDO';
}

function readinessClass(value: HmiTelemetry['safetyOk']): string {
  if (value === 'CONFIRMED') return 'smart-status-pill smart-status-pill--ok';
  if (value === 'NOT_CONFIRMED') return 'smart-status-pill smart-status-pill--danger';
  return 'smart-status-pill smart-status-pill--warning';
}

function machineStateClass(state: HmiTelemetry['machineState']): string {
  if (state === 'RUNNING') return 'smart-status-pill smart-status-pill--ok';
  if (state === 'EMERGENCY' || state === 'ALARM') return 'smart-status-pill smart-status-pill--danger';
  return 'smart-status-pill smart-status-pill--warning';
}

export function StatusHeader({ telemetry }: StatusHeaderProps) {
  return (
    <header className="smart-card">
      <h2 className="smart-card-title">Indicadores de estado</h2>
      <div className="ihm-status-grid">
        <div>
          <span className="ihm-status-label">Estado da máquina</span>
          <span className={machineStateClass(telemetry.machineState)}>{telemetry.machineState}</span>
        </div>
        <div>
          <span className="ihm-status-label">Modo</span>
          <span className="smart-digital-display">{telemetry.machineMode}</span>
        </div>
        <div>
          <span className="ihm-status-label">SEGURANÇA OK</span>
          <span className={readinessClass(telemetry.safetyOk)}>{readinessLabel(telemetry.safetyOk)}</span>
        </div>
        <div>
          <span className="ihm-status-label">Robô em home</span>
          <span className={readinessClass(telemetry.robotAtHome)}>{readinessLabel(telemetry.robotAtHome)}</span>
        </div>
        <div>
          <span className="ihm-status-label">Cinco módulos montados</span>
          <span className={readinessClass(telemetry.modulesMounted)}>{readinessLabel(telemetry.modulesMounted)}</span>
        </div>
        <div>
          <span className="ihm-status-label">Conexão</span>
          <span className={telemetry.connectionState === 'CONNECTED'
            ? 'smart-status-pill smart-status-pill--ok'
            : 'smart-status-pill smart-status-pill--warning'}>
            {telemetry.connectionState}
          </span>
        </div>
      </div>
    </header>
  );
}
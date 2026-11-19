import type { AlarmItem } from '../types/hmi';

interface AlarmListProps {
  alarms: AlarmItem[];
  onAckSingle: (id: string) => void;
  onAckAndClearAll: () => void;
}

export function AlarmList({ alarms, onAckSingle, onAckAndClearAll }: AlarmListProps) {
  const unackedCount = alarms.filter((a) => !a.acknowledged).length;

  return (
    <section className="smart-card">
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <h3 className="smart-card-title" style={{ margin: 0, border: 'none', padding: 0 }}>
            Alarmes &amp; Diagnósticos
          </h3>
          <span
            className={`smart-status-pill ${
              unackedCount > 0 ? 'smart-status-pill--danger' : 'smart-status-pill--ok'
            }`}
          >
            {unackedCount > 0 ? `${unackedCount} PENDENTE(S)` : 'SEM PENDÊNCIAS'}
          </span>
        </div>

        <button
          type="button"
          className="smart-btn smart-btn--warning"
          disabled={alarms.length === 0}
          onClick={onAckAndClearAll}
        >
          ACK / Clear Alarms
        </button>
      </div>

      {alarms.length === 0 ? (
        <div
          style={{
            padding: '1rem',
            textAlign: 'center',
            color: 'var(--smart-text-muted)',
            backgroundColor: 'var(--smart-bg-surface-alt)',
            borderRadius: '6px',
            fontSize: '0.85rem',
          }}
        >
          Nenhum alarme registrado no histórico da sessão.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.82rem',
              textAlign: 'left',
            }}
          >
            <thead>
              <tr style={{ borderBottom: '1px solid var(--smart-border)', color: 'var(--smart-text-muted)' }}>
                <th style={{ padding: '0.5rem' }}>Hora</th>
                <th style={{ padding: '0.5rem' }}>Código</th>
                <th style={{ padding: '0.5rem' }}>Diagnóstico</th>
                <th style={{ padding: '0.5rem' }}>Estado</th>
                <th style={{ padding: '0.5rem', textAlign: 'right' }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {alarms.map((alarm) => (
                <tr
                  key={alarm.id}
                  style={{
                    borderBottom: '1px solid var(--smart-border)',
                    backgroundColor:
                      alarm.active && !alarm.acknowledged
                        ? 'rgba(239, 68, 68, 0.08)'
                        : 'transparent',
                  }}
                >
                  <td style={{ padding: '0.5rem', fontFamily: 'monospace' }}>{alarm.timestamp}</td>
                  <td style={{ padding: '0.5rem', fontWeight: 700 }}>{alarm.code}</td>
                  <td style={{ padding: '0.5rem' }}>{alarm.message}</td>
                  <td style={{ padding: '0.5rem' }}>
                    <span
                      className={`smart-status-pill ${
                        alarm.active
                          ? alarm.severity === 'CRITICAL'
                            ? 'smart-status-pill--danger'
                            : 'smart-status-pill--warning'
                          : 'smart-status-pill--ok'
                      }`}
                    >
                      {alarm.active ? 'ATIVO' : 'NORMALIZADO'}
                      {alarm.acknowledged ? ' • ACK' : ''}
                    </span>
                  </td>
                  <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                    <button
                      type="button"
                      className="smart-btn"
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                      disabled={alarm.acknowledged}
                      onClick={() => onAckSingle(alarm.id)}
                    >
                      {alarm.acknowledged ? 'Reconhecido' : 'ACK'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
import type { HmiAlarm } from '../domain/hmi';

interface AlarmListProps {
  alarms: HmiAlarm[];
  onAck: (id: string) => void;
  onClear: () => void;
}

export function AlarmList({ alarms, onAck, onClear }: AlarmListProps) {
  const pendingCount = alarms.filter((alarm) => !alarm.acknowledgedLocally).length;
  const canClear = alarms.some((alarm) => !alarm.active && alarm.acknowledgedLocally);

  return (
    <section className="smart-card">
      <div className="ihm-alarm-heading">
        <h2 className="smart-card-title">Alarmes da sessão</h2>
        <div className="ihm-alarm-actions">
          <span
            className={`smart-status-pill ${
              pendingCount > 0 ? 'smart-status-pill--warning' : 'smart-status-pill--ok'
            }`}
          >
            {pendingCount > 0 ? `${pendingCount} SEM ACK LOCAL` : 'SEM PENDÊNCIAS'}
          </span>
          <button
            type="button"
            className="smart-btn smart-btn--warning"
            disabled={!canClear}
            onClick={onClear}
          >
            Limpar normalizados com ACK local
          </button>
        </div>
      </div>

      {alarms.length === 0 ? (
        <p className="ihm-empty-state">Nenhum alarme no cenário simulado.</p>
      ) : (
        <div className="ihm-table-wrap">
          <table className="ihm-alarm-table">
            <thead>
              <tr>
                <th>Registro local</th>
                <th>Diagnóstico simulado</th>
                <th>Estado</th>
                <th>Ação visual</th>
              </tr>
            </thead>
            <tbody>
              {alarms.map((alarm) => (
                <tr
                  key={alarm.id}
                  className={alarm.active && !alarm.acknowledgedLocally
                    ? 'ihm-alarm-unacknowledged'
                    : undefined}
                >
                  <td>{alarm.id}</td>
                  <td>{alarm.message}</td>
                  <td>
                    <span
                      className={`smart-status-pill ${
                        alarm.active
                          ? 'smart-status-pill--danger'
                          : 'smart-status-pill--ok'
                      }`}
                    >
                      {alarm.active ? 'ATIVO' : 'NORMALIZADO'}
                      {alarm.acknowledgedLocally ? ' • ACK LOCAL' : ''}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="smart-btn"
                      disabled={alarm.acknowledgedLocally}
                      onClick={() => onAck(alarm.id)}
                    >
                      {alarm.acknowledgedLocally ? 'Ciência registrada' : 'ACK local'}
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

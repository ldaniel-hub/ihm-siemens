interface RecoveryChecklistProps {
  visible: boolean;
  mushroomReleased: boolean;
  resetDone: boolean;
  alarmsAcknowledged: boolean;
  axesReferenced: boolean;
  canStart: boolean;
}

interface StepItem {
  number: number;
  title: string;
  detail: string;
  done: boolean;
}

export function RecoveryChecklist({
  visible,
  mushroomReleased,
  resetDone,
  alarmsAcknowledged,
  axesReferenced,
  canStart,
}: RecoveryChecklistProps) {
  if (!visible) return null;

  const steps: StepItem[] = [
    {
      number: 1,
      title: 'Desbloqueio do Cogumelo (E-Stop)',
      detail: 'Gire e destrave o botão de emergência físico/simulado.',
      done: mushroomReleased,
    },
    {
      number: 2,
      title: 'Pulso de RESET',
      detail: 'Acione RESET para rearmar o circuito de segurança do CLP.',
      done: mushroomReleased && resetDone,
    },
    {
      number: 3,
      title: 'ACK de Falhas',
      detail: 'Reconheça todos os alarmes pendentes na tabela de diagnósticos.',
      done: mushroomReleased && resetDone && alarmsAcknowledged,
    },
    {
      number: 4,
      title: 'Homing (Referenciamento)',
      detail: 'Execute o referenciamento até EIXOS_REFERENCIADOS: OK.',
      done: mushroomReleased && resetDone && alarmsAcknowledged && axesReferenced,
    },
    {
      number: 5,
      title: 'Liberação de START',
      detail: 'Condições seguras restabelecidas para retomada de ciclo.',
      done: canStart,
    },
  ];

  const currentStepIndex = steps.findIndex((s) => !s.done);

  return (
    <section
      className="smart-card"
      style={{ borderColor: 'var(--smart-status-warning)' }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.75rem',
        }}
      >
        <h3 className="smart-card-title" style={{ margin: 0, border: 'none', padding: 0 }}>
          POP — Recuperação Pós-Emergência
        </h3>
        <span className="smart-status-pill smart-status-pill--warning">
          PROCEDIMENTO OBRIGATÓRIO
        </span>
      </div>

      <ol
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.6rem',
        }}
      >
        {steps.map((step, idx) => {
          const isCurrent = idx === currentStepIndex;
          const borderColor = step.done
            ? 'var(--smart-status-ok)'
            : isCurrent
            ? 'var(--smart-status-warning)'
            : 'var(--smart-border)';

          return (
            <li
              key={step.number}
              style={{
                backgroundColor: 'var(--smart-bg-surface-alt)',
                border: `1px solid ${borderColor}`,
                borderRadius: '6px',
                padding: '0.65rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.3rem',
                }}
              >
                <strong style={{ fontSize: '0.8rem' }}>
                  {step.number}. {step.title}
                </strong>
                <span
                  className={`smart-status-pill ${
                    step.done
                      ? 'smart-status-pill--ok'
                      : isCurrent
                      ? 'smart-status-pill--warning'
                      : ''
                  }`}
                  style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem' }}
                >
                  {step.done ? 'OK' : isCurrent ? 'ATUAL' : 'AGUARD.'}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--smart-text-muted)' }}>
                {step.detail}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
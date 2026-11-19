import type { MachineState } from '../domain/hmi';

export function RecoveryChecklist({ machineState }: { machineState: MachineState }) {
  if (machineState !== 'EMERGENCY') return null;

  return (
    <section className="smart-card ihm-emergency-notice" role="alert">
      <h2 className="smart-card-title">Parada de emergência indicada pela telemetria simulada</h2>
      <p>
        Esta tela não define um procedimento de recuperação. Siga o procedimento aprovado
        pela equipe responsável e aguarde a telemetria indicar a normalização.
      </p>
    </section>
  );
}

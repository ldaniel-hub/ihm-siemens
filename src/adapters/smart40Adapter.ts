import type { HmiCommand, HmiTelemetry } from '../domain/hmi';

export interface Smart40Adapter {
  subscribe(listener: (telemetry: HmiTelemetry) => void): () => void;
  dispatch(command: HmiCommand): void;
}

export function createSmart40Adapter(): Smart40Adapter {
  throw new Error(
    'Integração indisponível: aguardando homologação do contrato global pelo Grupo 1.',
  );
}

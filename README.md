# IHM Siemens — Módulo G2

The interface currently runs in **local mock mode only**. It does not subscribe to PLC
telemetry or publish commands to `@ffe-senai/smart40`.

## Integration boundary

- `src/domain/hmi.ts` contains the internal UI model and alarm lifecycle rules.
- `src/mocks/hmiDevMocks.ts` provides explicit development scenarios.
- `src/adapters/smart40Adapter.ts` defines the future integration boundary and fails
  explicitly until the Group 1 contract is approved.

Do not map undocumented fields or infer robot home from joint angles. Alarm ACK is local
operator acknowledgement only; RESET does not clear alarms or change machine state.

## Development and validation

- `npm run dev` starts the local interface.
- `npm test` runs domain-level unit tests.
- `npm run check` runs TypeScript and ESLint.
- `npm run build` validates and builds the remote module.

The mock badge is intentional. Remove it only after the approved contract, transport,
module readiness, safety/home signals and connection-loss ownership are integrated and
tested.

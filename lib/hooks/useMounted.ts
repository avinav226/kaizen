import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/** False on the server and during hydration, true afterwards. Avoids hydration mismatches for persisted state. */
export function useMounted(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false);
}

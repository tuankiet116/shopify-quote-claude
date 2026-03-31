import { useSyncExternalStore } from 'react';

const noop = () => () => { /* no-op: value never changes at runtime */ };
function getSnapshot() { return !!window.shopify; }
function getServerSnapshot() { return false; }

export function useIsEmbedded(): boolean {
  return useSyncExternalStore(noop, getSnapshot, getServerSnapshot);
}

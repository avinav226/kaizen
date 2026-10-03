'use client';

import { useEffect } from 'react';
import { syncCheckins } from '@/lib/sync/checkins';

/** Retries unsynced check-ins when the app opens and whenever the connection returns. */
export function CheckinSync() {
  useEffect(() => {
    void syncCheckins();
    const run = () => void syncCheckins();
    window.addEventListener('online', run);
    document.addEventListener('visibilitychange', run);
    return () => {
      window.removeEventListener('online', run);
      document.removeEventListener('visibilitychange', run);
    };
  }, []);
  return null;
}

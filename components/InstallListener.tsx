'use client';

import { useEffect } from 'react';
import { listenForInstallPrompt } from '@/lib/installPrompt';

/** Catches the browser's install prompt as early as possible so Settings and the post-onboarding screen can use it. */
export function InstallListener() {
  useEffect(() => listenForInstallPrompt(), []);
  return null;
}

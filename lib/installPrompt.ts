'use client';

import { useSyncExternalStore } from 'react';
import { detectPlatform, type Platform } from './install';

/** Chrome's install prompt, which it hands us once and expects us to keep. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface Window {
    /** Set by a tiny script in the page head, so an install event that fires before the app loads is not lost. */
    __kzInstallEvent?: BeforeInstallPromptEvent;
  }
}

const OFFERED_KEY = 'kaizen.installOffered';

let deferred: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

/** Starts listening. Called once, early, from the root layout. */
export function listenForInstallPrompt(): () => void {
  if (window.__kzInstallEvent && !deferred) {
    deferred = window.__kzInstallEvent;
    emit();
  }
  const onPrompt = (e: Event) => {
    e.preventDefault(); // keep it for our own button instead of Chrome's mini-bar
    deferred = e as BeforeInstallPromptEvent;
    window.__kzInstallEvent = deferred;
    emit();
  };
  const onInstalled = () => {
    deferred = null;
    window.__kzInstallEvent = undefined;
    emit();
  };
  window.addEventListener('beforeinstallprompt', onPrompt);
  window.addEventListener('appinstalled', onInstalled);
  return () => {
    window.removeEventListener('beforeinstallprompt', onPrompt);
    window.removeEventListener('appinstalled', onInstalled);
  };
}

/** True once the browser has told us the app can be installed with one tap. */
export function useCanPromptInstall(): boolean {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => void listeners.delete(cb);
    },
    () => deferred !== null,
    () => false,
  );
}

export async function promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  if (!deferred) return 'unavailable';
  const event = deferred;
  deferred = null;
  window.__kzInstallEvent = undefined; // an install event can only be used once
  emit();
  await event.prompt();
  return (await event.userChoice).outcome;
}

export function currentPlatform(): Platform {
  return detectPlatform({
    userAgent: navigator.userAgent,
    maxTouchPoints: navigator.maxTouchPoints,
    standalone:
      (navigator as Navigator & { standalone?: boolean }).standalone === true ||
      window.matchMedia('(display-mode: standalone)').matches,
  });
}

/** The install offer after onboarding is shown once per device, never repeated. */
export const wasInstallOffered = (): boolean => {
  try {
    return localStorage.getItem(OFFERED_KEY) === '1';
  } catch {
    return true; // can't remember it, so don't risk nagging
  }
};

export const markInstallOffered = (): void => {
  try {
    localStorage.setItem(OFFERED_KEY, '1');
  } catch {
    // nothing to do
  }
};

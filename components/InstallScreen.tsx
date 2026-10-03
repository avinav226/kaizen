'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useMounted } from '@/lib/hooks/useMounted';
import { currentPlatform, markInstallOffered, promptInstall, useCanPromptInstall, wasInstallOffered } from '@/lib/installPrompt';
import { AddToHomeScreen } from './AddToHomeScreen';
import { InstallCard } from './InstallCard';

/** How long to wait for the browser to offer its install prompt before moving on. */
const WAIT_MS = 2500;

/**
 * Shown once after onboarding, and any time from Settings. It never blocks:
 * the app works fully either way, so "Maybe later" is always one tap away.
 */
export function InstallScreen({ fromSettings }: { fromSettings: boolean }) {
  const router = useRouter();
  const mounted = useMounted();
  const canPrompt = useCanPromptInstall();
  const [busy, setBusy] = useState(false);
  const [waited, setWaited] = useState(false);

  const platform = mounted ? currentPlatform() : null;
  const leave = () => router.replace(fromSettings ? '/settings' : '/today');
  const showIos = platform === 'ios';
  const showPrompt = canPrompt && (platform === 'android' || platform === 'desktop');

  // After onboarding: skip the screen if it was already shown, or there is nothing to offer.
  useEffect(() => {
    if (!mounted || fromSettings) return;
    if (platform === 'standalone' || wasInstallOffered()) router.replace('/today');
  }, [mounted, fromSettings, platform, router]);

  useEffect(() => {
    const id = setTimeout(() => setWaited(true), WAIT_MS);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!mounted || fromSettings || platform === 'standalone') return;
    if (showIos || showPrompt) markInstallOffered();
    else if (waited) {
      markInstallOffered();
      router.replace('/today'); // nothing to offer on this browser
    }
  }, [mounted, fromSettings, platform, showIos, showPrompt, waited, router]);

  async function install() {
    setBusy(true);
    await promptInstall();
    leave();
  }

  if (!mounted || platform === null) return <main className="flex-1" />;

  return (
    <main className="flex flex-1 flex-col">
      {showIos ? (
        <AddToHomeScreen />
      ) : showPrompt ? (
        <InstallCard onInstall={install} busy={busy} />
      ) : fromSettings ? (
        <>
          <h1 className="mt-8 font-display text-[28px] leading-[35px] font-medium">
            {platform === 'standalone' ? 'Kaizen is on your home screen' : 'Install Kaizen'}
          </h1>
          <p className="mt-3 text-text-secondary">
            {platform === 'standalone'
              ? 'You opened it like an app, so there is nothing more to do.'
              : 'Open your browser’s menu and choose Install app, or Add to Home screen.'}
          </p>
        </>
      ) : null}

      <div className="mt-auto pt-8 text-center">
        <Link
          href={fromSettings ? '/settings' : '/today'}
          replace
          className="inline-flex min-h-11 items-center px-4 text-accent underline"
        >
          {fromSettings ? 'Back to settings' : 'Maybe later'}
        </Link>
      </div>
    </main>
  );
}

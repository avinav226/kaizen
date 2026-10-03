'use client';

import Link from 'next/link';
import { useMounted } from '@/lib/hooks/useMounted';
import { currentPlatform } from '@/lib/installPrompt';

export function InstallRow() {
  const mounted = useMounted();
  const installed = mounted && currentPlatform() === 'standalone';
  return (
    <Link href="/install?from=settings" className="flex min-h-14 items-center justify-between rounded-[16px] border border-border bg-surface px-5">
      <span>
        <span className="block font-medium">Add to home screen</span>
        <span className="block text-[13px] text-text-secondary">
          {installed ? 'Kaizen is on your home screen' : 'Open it like an app and get daily nudges'}
        </span>
      </span>
      <span aria-hidden="true" className="text-text-muted">›</span>
    </Link>
  );
}

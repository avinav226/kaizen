'use client';

import { useState } from 'react';
import { useCheckins } from '@/lib/store/checkins';
import { syncCheckins } from '@/lib/sync/checkins';

/** Signs out, first sending any waiting check-ins, then clearing what this device kept for the account. */
export function SignOutButton() {
  const [message, setMessage] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    await syncCheckins();
    if (Object.keys(useCheckins.getState().pending).length > 0) {
      setMessage('Some check-ins haven’t been sent yet. Connect to the internet and try again, so nothing is lost.');
      return;
    }
    try {
      await caches.delete('kz-pages'); // the saved copies of Today and Check-in belong to this account
    } catch {
      // Cache API unavailable: nothing was saved.
    }
    Object.keys(localStorage)
      .filter((k) => k.startsWith('kaizen.'))
      .forEach((k) => localStorage.removeItem(k));
    form.submit();
  }

  return (
    <form action="/auth/signout" method="post" onSubmit={onSubmit}>
      <button type="submit" className="h-11 rounded-[12px] border border-border-strong bg-surface px-4 font-medium">
        Sign out
      </button>
      {message && (
        <p className="mt-3 text-text-secondary" role="status">
          {message}
        </p>
      )}
    </form>
  );
}

'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Status = 'idle' | 'sending' | 'sent' | 'error';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  const callback = () => `${window.location.origin}/auth/callback`;

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    const { error } = await createClient().auth.signInWithOtp({
      email,
      options: { emailRedirectTo: callback() },
    });
    setStatus(error ? 'error' : 'sent');
  }

  async function google() {
    const { error } = await createClient().auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: callback() },
    });
    if (error) setStatus('error');
  }

  if (status === 'sent') {
    return (
      <p className="rounded-[14px] bg-accent-bg p-4 text-text" role="status">
        Check your email for a sign-in link. Open it in this same browser.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={sendLink} className="flex flex-col gap-3">
        <label htmlFor="email" className="text-[13px] leading-[18px] font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 rounded-[12px] border border-border bg-surface px-4 outline-none focus-visible:ring-1 focus-visible:ring-accent"
        />
        <button
          type="submit"
          disabled={status === 'sending'}
          className="h-[54px] rounded-[14px] bg-accent font-medium text-on-accent disabled:opacity-60"
        >
          {status === 'sending' ? 'Sending…' : 'Email me a link'}
        </button>
      </form>
      <div className="text-center text-[12px] leading-[17px] text-text-muted">or</div>
      <button
        type="button"
        onClick={google}
        className="h-[54px] rounded-[14px] border border-border-strong bg-surface font-medium"
      >
        Continue with Google
      </button>
      {status === 'error' && (
        <p className="text-[13px] text-error" role="alert">
          That didn’t work. Please try again.
        </p>
      )}
    </div>
  );
}

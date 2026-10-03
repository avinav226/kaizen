'use client';

import { useState } from 'react';

export function LaterList({ items }: { items: { id: string; title: string }[] }) {
  const [open, setOpen] = useState(false);
  if (items.length === 0) return null;

  return (
    <section className="rounded-[18px] border border-border bg-surface-muted">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex min-h-14 w-full items-center justify-between px-5 text-left"
      >
        <span>
          <span className="font-medium">Later</span>
          <span className="ml-3 text-text-secondary">{items.length} waiting</span>
        </span>
        <svg
          width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
          className={open ? 'rotate-180' : ''}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="border-t border-divider px-5 pt-3 pb-5">
          <ul className="flex flex-col gap-2">
            {items.map((g) => (
              <li key={g.id} className="rounded-[12px] bg-surface px-4 py-3">
                {g.title}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[13px] leading-[19px] text-text-secondary">
            Once your step is steady, your review will offer to swap one in.
          </p>
        </div>
      )}
    </section>
  );
}

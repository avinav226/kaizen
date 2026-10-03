'use client';

import { useState } from 'react';

interface Props {
  text: string;
  label: string;
  onSave: (text: string) => void;
}

/** Tap the words to edit them inline. Enter or leaving the field saves, Escape cancels. */
export function EditableText({ text, label, onSave }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(text);

  function commit() {
    const next = draft.trim();
    if (next && next !== text) onSave(next);
    setEditing(false);
  }

  if (editing) {
    return (
      <textarea
        autoFocus
        aria-label={label}
        value={draft}
        rows={2}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            commit();
          } else if (e.key === 'Escape') {
            setEditing(false);
          }
        }}
        className="w-full resize-none rounded-[10px] border border-accent bg-surface p-2 font-display text-xl leading-[26px] outline-none"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setDraft(text);
        setEditing(true);
      }}
      aria-label={`${label}: ${text}. Tap to edit.`}
      className="block min-h-11 w-full text-left font-display text-xl leading-[26px]"
    >
      {text}
    </button>
  );
}

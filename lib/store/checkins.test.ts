import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const memory = new Map<string, string>();
vi.stubGlobal('localStorage', {
  getItem: (k: string) => memory.get(k) ?? null,
  setItem: (k: string, v: string) => void memory.set(k, v),
  removeItem: (k: string) => void memory.delete(k),
});

const { useCheckins } = await import('./checkins');
const DAY = '2026-10-03';

describe('check-in store', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-03T10:00:00Z'));
    useCheckins.getState().reset();
    useCheckins.getState().hydrate('goal-1');
  });
  afterEach(() => vi.useRealTimers());

  it('keeps a tap that has not synced yet when fresh server data arrives', () => {
    useCheckins.getState().record(DAY, 'done', null, 's1');
    useCheckins.getState().hydrate('goal-1');
    expect(useCheckins.getState().entries[DAY].answer).toBe('done');
  });

  it('keeps a just-synced tap even if the server data that arrives is stale', () => {
    const s = useCheckins.getState();
    s.record(DAY, 'partly', null, 's1');
    s.markSynced(DAY, useCheckins.getState().pending[DAY]);
    expect(useCheckins.getState().pending[DAY]).toBeUndefined();
    useCheckins.getState().hydrate('goal-1'); // a read that started before the save landed
    expect(useCheckins.getState().entries[DAY].answer).toBe('partly');
  });

  it('lets the server win once a synced tap is old', () => {
    const s = useCheckins.getState();
    s.record(DAY, 'done', null, 's1');
    s.markSynced(DAY, useCheckins.getState().pending[DAY]);
    vi.setSystemTime(new Date('2026-10-03T10:03:00Z'));
    useCheckins.getState().hydrate('goal-1');
    expect(useCheckins.getState().entries[DAY]).toBeUndefined();
  });

  it('does not mark a newer write as synced', () => {
    const s = useCheckins.getState();
    s.record(DAY, 'done', null, 's1');
    const sent = useCheckins.getState().pending[DAY];
    useCheckins.getState().record(DAY, 'not_today', 'rain', 's1'); // changed while the request was in flight
    useCheckins.getState().markSynced(DAY, sent);
    expect(useCheckins.getState().pending[DAY]).toBeDefined();
    expect(useCheckins.getState().entries[DAY].syncedAt).toBeUndefined();
  });

  it('starts clean for a different goal', () => {
    useCheckins.getState().record(DAY, 'done', null, 's1');
    useCheckins.getState().hydrate('goal-2');
    expect(useCheckins.getState().entries).toEqual({});
    expect(useCheckins.getState().pending).toEqual({});
  });
});

import { describe, expect, it } from 'vitest';
import { offlineHtml } from './offlineHtml';

describe('offlineHtml', () => {
  const html = offlineHtml();
  it('is calm, plain and self-contained', () => {
    expect(html).toContain('You&rsquo;re offline');
    expect(html).not.toMatch(/<script|<link|https?:\/\//i); // nothing to download, nothing to hydrate
  });
  it('takes its colours from the theme', () => {
    expect(html).toContain('#F5F1E8');
    expect(html).toContain('#2F4B6E');
  });
  it('offers a way back to Today', () => {
    expect(html).toContain('href="/today"');
  });
});

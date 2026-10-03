import { describe, expect, it } from 'vitest';
import { detectPlatform } from './install';

const base = { maxTouchPoints: 0, standalone: false };
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1';
const IPAD_AS_MAC = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15';
const ANDROID = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36';
const DESKTOP = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

describe('detectPlatform', () => {
  it('detects an installed app first', () => {
    expect(detectPlatform({ ...base, userAgent: IPHONE, standalone: true })).toBe('standalone');
  });
  it('detects iPhone and iPad (which looks like a Mac with touch)', () => {
    expect(detectPlatform({ ...base, userAgent: IPHONE })).toBe('ios');
    expect(detectPlatform({ ...base, userAgent: IPAD_AS_MAC, maxTouchPoints: 5 })).toBe('ios');
  });
  it('does not mistake a real Mac for an iPad', () => {
    expect(detectPlatform({ ...base, userAgent: IPAD_AS_MAC })).toBe('desktop');
  });
  it('detects Android and desktop', () => {
    expect(detectPlatform({ ...base, userAgent: ANDROID })).toBe('android');
    expect(detectPlatform({ ...base, userAgent: DESKTOP })).toBe('desktop');
  });
});

export type Platform = 'standalone' | 'ios' | 'android' | 'desktop';

export interface PlatformInput {
  userAgent: string;
  maxTouchPoints: number;
  /** True when the app is already running from the home screen. */
  standalone: boolean;
}

/** Where the app is running, which decides how we offer to install it. */
export function detectPlatform({ userAgent, maxTouchPoints, standalone }: PlatformInput): Platform {
  if (standalone) return 'standalone';
  // iPadOS reports itself as a Mac, with a touch screen.
  if (/iPhone|iPad|iPod/.test(userAgent) || (/Macintosh/.test(userAgent) && maxTouchPoints > 1)) return 'ios';
  if (/Android/.test(userAgent)) return 'android';
  return 'desktop';
}

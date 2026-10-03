/// <reference lib="webworker" />
import {
  CacheFirst,
  ExpirationPlugin,
  NetworkFirst,
  NetworkOnly,
  Serwist,
  StaleWhileRevalidate,
  type PrecacheEntry,
  type RuntimeCaching,
  type SerwistGlobalConfig,
  type SerwistPlugin,
} from 'serwist';
import { offlineHtml } from '../lib/offlineHtml';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}
declare const self: ServiceWorkerGlobalScope;

/** Name of the cache holding signed-in pages. The app empties it on sign-out. */
const PAGES_CACHE = 'kz-pages';

/** The pages that should open with no connection. */
const OFFLINE_PAGES = new Set(['/today', '/checkin']);

const pagePlugin: SerwistPlugin = {
  // /checkin?answer=done and /checkin are the same page offline.
  cacheKeyWillBeUsed: async ({ request }) => {
    const url = new URL(request.url);
    return `${url.origin}${url.pathname}`;
  },
  // Never keep a redirect (for example to /login) under a page's address.
  cacheWillUpdate: async ({ response }) => (response.status === 200 && !response.redirected ? response : null),
};

const runtimeCaching: RuntimeCaching[] = [
  {
    // Today and Check-in: the network when there is one, the last copy when there is not.
    matcher: ({ request, url, sameOrigin }) =>
      sameOrigin &&
      OFFLINE_PAGES.has(url.pathname) &&
      !request.headers.get('RSC') &&
      (request.headers.get('Accept') ?? '').includes('text/html'),
    handler: new NetworkFirst({ cacheName: PAGES_CACHE, networkTimeoutSeconds: 4, plugins: [pagePlugin] }),
  },
  {
    // Any other page needs the network, but fails into the calm offline screen instead of the browser's error.
    matcher: ({ request, sameOrigin }) => sameOrigin && request.mode === 'navigate',
    handler: new NetworkOnly(),
  },
  {
    // Built files have hashed names, so a cached copy is never out of date.
    matcher: ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith('/_next/static/'),
    handler: new CacheFirst({
      cacheName: 'kz-static',
      plugins: [new ExpirationPlugin({ maxEntries: 120, maxAgeSeconds: 30 * 24 * 60 * 60 })],
    }),
  },
  {
    matcher: ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith('/icons/'),
    handler: new StaleWhileRevalidate({ cacheName: 'kz-icons' }),
  },
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: false,
  runtimeCaching,
});

// A page that is neither saved nor reachable gets a calm offline screen, never the browser's error.
serwist.setCatchHandler(async ({ request }) =>
  request.destination === 'document'
    ? new Response(offlineHtml(), { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
    : Response.error(),
);

serwist.addEventListeners();

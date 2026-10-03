/**
 * Visits pages in the background so the service worker keeps a fresh saved copy
 * for offline use. Does nothing when offline or when the worker is not ready yet.
 */
export async function primeOfflinePages(urls: readonly string[]): Promise<void> {
  if (typeof navigator === 'undefined' || !navigator.onLine || !('serviceWorker' in navigator)) return;
  try {
    await navigator.serviceWorker.ready;
    // On the very first visit the worker is installed but not yet in charge of this page.
    if (!navigator.serviceWorker.controller) {
      await new Promise<void>((resolve) => {
        navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), { once: true });
        setTimeout(resolve, 4000);
      });
    }
    for (const url of urls) {
      await fetch(url, { headers: { Accept: 'text/html' }, credentials: 'same-origin', cache: 'no-store' });
    }
  } catch {
    // Offline or blocked: the next visit tries again.
  }
}

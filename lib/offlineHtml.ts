import { colors, layout } from '../theme';

/**
 * The page the service worker shows for a page that is neither saved nor reachable.
 * Plain HTML with no framework and no downloads, so it works with no connection and
 * can safely stand in for any address.
 */
export function offlineHtml(): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="${colors.background}">
<title>Kaizen</title>
<style>
  body { margin: 0; background: ${colors.background}; color: ${colors.text};
    font: 15px/23px system-ui, sans-serif; }
  main { box-sizing: border-box; max-width: ${layout.maxWidth}px; margin: 0 auto; min-height: 100vh;
    padding: 56px 24px 24px; display: flex; flex-direction: column; justify-content: center; }
  h1 { font: 500 28px/35px Georgia, serif; margin: 0 0 12px; }
  p { color: ${colors.textSecondary}; margin: 0 0 24px; }
  a { display: inline-flex; align-items: center; min-height: 44px; padding: 0 20px; border-radius: 999px;
    background: ${colors.accent}; color: ${colors.onAccent}; text-decoration: none; font-weight: 500; align-self: flex-start; }
</style>
</head>
<body>
<main>
  <h1>You&rsquo;re offline</h1>
  <p>This page isn&rsquo;t saved on your phone yet. Anything you log is kept and sent when you&rsquo;re back online.</p>
  <a href="/today">Open Today</a>
</main>
</body>
</html>`;
}

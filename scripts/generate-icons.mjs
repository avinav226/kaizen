/**
 * Renders the app icons from the logo ring, using colours from theme.ts.
 * Run when the logo or colours change:
 *   npm i --no-save playwright-core && node scripts/generate-icons.mjs
 * (uses the preinstalled Chromium at PLAYWRIGHT_BROWSERS_PATH, or set CHROMIUM_PATH)
 */
import { chromium } from 'playwright-core';
import { colors } from '../theme.ts';

// Same arc as components/icons/LogoRing.tsx (28x28 viewBox).
const RING = 'M24 14a10 10 0 1 1-4.5-8.4';

/** `scale` is how much of the canvas the ring's 28x28 box fills (smaller for maskable safe zones). */
const svg = (size, scale) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${colors.accent}"/>
  <g transform="translate(${(size * (1 - scale)) / 2} ${(size * (1 - scale)) / 2}) scale(${(size * scale) / 28})">
    <path d="${RING}" fill="none" stroke="${colors.background}" stroke-width="3" stroke-linecap="round"/>
  </g>
</svg>`;

const OUT = [
  ['public/icons/icon-192.png', 192, 0.56],
  ['public/icons/icon-512.png', 512, 0.56],
  ['public/icons/maskable-512.png', 512, 0.42], // ring stays inside the 80% safe zone
  ['app/apple-icon.png', 180, 0.56],
  ['app/icon.png', 512, 0.56],
];

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium' });
for (const [file, size, scale] of OUT) {
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  await page.setContent(`<style>html,body{margin:0}</style>${svg(size, scale)}`);
  await page.screenshot({ path: file, clip: { x: 0, y: 0, width: size, height: size } });
  await page.close();
  console.log('wrote', file);
}
await browser.close();

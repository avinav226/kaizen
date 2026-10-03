import type { MetadataRoute } from 'next';
import { manifest } from '@/theme';

export default function manifestRoute(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: manifest.name,
    short_name: manifest.name,
    description: 'One small step at a time.',
    start_url: '/today',
    scope: '/',
    display: manifest.display,
    orientation: 'portrait',
    theme_color: manifest.themeColor,
    background_color: manifest.backgroundColor,
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}

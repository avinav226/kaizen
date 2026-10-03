import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Sans, Shippori_Mincho } from 'next/font/google';
import { CheckinSync } from '@/components/CheckinSync';
import { themeCss } from '@/lib/themeCss';
import { manifest } from '@/theme';
import './globals.css';

const shippori = Shippori_Mincho({
  variable: '--font-shippori',
  weight: ['400', '500', '600'],
  subsets: ['latin'],
});

const plex = IBM_Plex_Sans({
  variable: '--font-plex',
  weight: ['400', '500', '600'],
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: manifest.name,
  description: 'One small step at a time.',
};

export const viewport: Viewport = {
  themeColor: manifest.themeColor,
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${shippori.variable} ${plex.variable}`}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeCss() }} />
      </head>
      <body>
        <div className="mx-auto flex min-h-dvh flex-col w-full max-w-[var(--t-layout-max-width)] px-6 pt-[max(56px,env(safe-area-inset-top))] pb-[max(24px,env(safe-area-inset-bottom))]">
          <CheckinSync />
          {children}
        </div>
      </body>
    </html>
  );
}

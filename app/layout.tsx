import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { IBM_Plex_Sans, Shippori_Mincho } from 'next/font/google';
import { CheckinSync } from '@/components/CheckinSync';
import { InstallListener } from '@/components/InstallListener';
import { SerwistProvider } from './serwist';
import { themeCss } from '@/lib/themeCss';
import { manifest } from '@/theme';
import './globals.css';

const shippori = Shippori_Mincho({
  variable: '--font-shippori',
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  preload: false, // this font ships many unicode-range files; fetch only the ones the page uses
});

const plex = IBM_Plex_Sans({
  variable: '--font-plex',
  weight: ['400', '500', '600'],
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: manifest.name,
  description: 'One small step at a time.',
  applicationName: manifest.name,
  appleWebApp: { capable: true, title: manifest.name, statusBarStyle: 'default' },
  formatDetection: { telephone: false },
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
        {/* Chrome offers "install" once. Catch it before the app has loaded, so it is never missed. */}
        <Script id="capture-install-prompt" strategy="beforeInteractive">
          {`window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__kzInstallEvent=e;});`}
        </Script>
        <div className="mx-auto flex min-h-dvh flex-col w-full max-w-[var(--t-layout-max-width)] px-6 pt-[max(56px,env(safe-area-inset-top))] pb-[max(24px,env(safe-area-inset-bottom))]">
          <SerwistProvider swUrl="/serwist/sw.js" disable={process.env.NODE_ENV === 'development'} cacheOnNavigation={false} reloadOnOnline={false}>
            <CheckinSync />
            <InstallListener />
            {children}
          </SerwistProvider>
        </div>
      </body>
    </html>
  );
}

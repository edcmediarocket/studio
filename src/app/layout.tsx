
import type {Metadata} from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Providers } from '@/components/layout/providers';
import { PwaRegistration } from '@/components/layout/pwa-registration';
import { AnimatedGalaxyBackground } from '@/components/layout/animated-galaxy-background';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Rocket Meme',
  description: 'AI-Powered Meme Coin Analysis & Signals',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
        <meta name="application-name" content="Rocket Meme" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Rocket Meme" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#000000" />

        <link rel="apple-touch-icon" href="https://placehold.co/192x192.png" data-ai-hint="app icon" />
        <link rel="icon" type="image/png" sizes="192x192" href="https://placehold.co/192x192.png" data-ai-hint="app icon" />
        <link rel="icon" type="image/png" sizes="512x512" href="https://placehold.co/512x512.png" data-ai-hint="app icon large" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      {/* Ensure body can grow and is a flex container for full-height child layouts */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}>
        <AnimatedGalaxyBackground />
        <Providers>
          {children}
          <Toaster />
          <PwaRegistration />
        </Providers>
      </body>
    </html>
  );
}

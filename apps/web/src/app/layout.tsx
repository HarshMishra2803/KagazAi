import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'KagazAi - Real-time Collaborative Document Editor',
    template: '%s | KagazAi',
  },
  description:
    'A real-time collaborative document editor for notes, assignments, and technical specifications with live Yjs CRDT synchronization and deterministic presence.',
  keywords: [
    'collaborative editor',
    'real-time editor',
    'CRDT',
    'Yjs',
    'TipTap',
    'Hocuspocus',
    'Google Docs alternative',
    'Markdown editor',
    'document collaboration',
  ],
  authors: [{ name: 'KagazAi Engineering Team' }],
  creator: 'KagazAi',
  publisher: 'KagazAi',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'http://localhost:3000',
    title: 'KagazAi - Real-time Collaborative Document Editor',
    description:
      'Write assignments, notes, and technical reports together in real time with conflict-free Yjs synchronization.',
    siteName: 'KagazAi',
    images: [
      {
        url: '/apple-touch-icon.png',
        width: 180,
        height: 180,
        alt: 'KagazAi Document Editor Icon',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'KagazAi - Real-time Collaborative Document Editor',
    description:
      'Write assignments, notes, and technical reports together in real time with conflict-free Yjs synchronization.',
    images: ['/apple-touch-icon.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-neutral-50 text-neutral-900 antialiased font-sans selection:bg-neutral-200 selection:text-neutral-900">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

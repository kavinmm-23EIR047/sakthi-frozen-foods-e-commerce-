import './globals.css';
import { CartProvider } from '@/context/CartContext';
import type { Metadata, Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://tnmockmeat.com'),
  title: { default: 'Sakthi Frozen Foods | Plant-Based Frozen Foods', template: '%s | Sakthi Frozen Foods' },
  description: 'Shop Sakthi Frozen Foods for plant-based frozen foods, convenient delivery, and everyday meal inspiration.',
  keywords: ['plant-based frozen foods', 'vegan frozen foods', 'Sakthi Frozen Foods', 'plant-based protein'],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'Sakthi Frozen Foods | 100% Plant-Based Vegan Meats',
    description: 'Premium plant-based vegan mutton, fish, chicken, prawns, cutlets and snacks.',
    url: 'https://tnmockmeat.com',
    siteName: 'Sakthi Frozen Foods',
    locale: 'en_IN',
    type: 'website',
  },
};

import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { Manrope, Bricolage_Grotesque } from 'next/font/google';

const manrope = Manrope({ subsets: ['latin'], weight: ['400', '600', '700', '800'], variable: '--font-manrope' });
const bricolage = Bricolage_Grotesque({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--font-bricolage' });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body className={`${manrope.variable} ${bricolage.variable} font-sans antialiased min-h-screen bg-[#F3FBEE] text-[#2F2F2F]`}>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>{children}</CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

import { generateMetadata as buildMetadata } from '@/lib/utils/metadata';

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import '@/styles/globals.css';
import { AsideProvider } from '@/lib/context/AsideContext';
import { UserProvider } from  '@/lib/context/userContext';
import React from 'react';
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = buildMetadata({
  title: 'O-S-M | Optical System Management',
  description: 'Discover top-quality Optical System Management.',
  openGraphImage: '/og-image.png',
  openGraphType: 'website',
  twitterCardType: 'summary',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <body>
        <UserProvider>
          <AsideProvider>
            {children}
          </AsideProvider>
        </UserProvider>
      </body>
    </html>
  );
}

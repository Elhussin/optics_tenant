import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import '@/styles/globals.css';
import MainLayout from '@/components/layout/MainLayout';
import { generateMetadata } from '@/lib/utils/metadata';
import { UserProvider } from  '@/lib/hooks/useCurrentUser'
import React from 'react';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


generateMetadata({
  title: 'O-S-M | Optical System Management',
  description: 'Discover top-quality Optical System Management.',
  openGraphImage: '/og-image.png',
  openGraphType: 'website',
  twitterCardType: 'summary',
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased body-background`}
      >
               
               <UserProvider>
          <MainLayout>
              {children}
            </MainLayout>
         </UserProvider>  
     
      </body>
    </html>
  );
}

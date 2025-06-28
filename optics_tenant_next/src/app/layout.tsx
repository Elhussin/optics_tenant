import React from 'react';
import '../styles/globals.css';
import MainLayout from '@/src/components/layout/MainLayout';
import { generateMetadata } from '@/src/lib/utils/metadata';
import { UserProvider } from  '@/src/lib/hooks/useCurrentUser'


generateMetadata({
  title: 'O-S-M | Optical System Management',
  description: 'Discover top-quality Optical System Management.',
  openGraphImage: '/og-image.png',
  openGraphType: 'website',
  twitterCardType: 'summary',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
       
        <UserProvider>
          <MainLayout>
              {children}
            </MainLayout>
         </UserProvider>  
     
        
      </body>
    </html>
  );
}


// export const metadata = {
//   title: 'Solo Vizion | Stylish Eyewear',
//   description: 'Discover top-quality medical and fashion glasses.',
//   openGraph: {
//     title: 'Solo Vizion',
//     description: 'Eyewear for every vision.',
//     url: 'https://solo-vizion.com',
//     siteName: 'Solo Vizion',
//     images: [
//       {
//         url: '/og-image.png',
//         width: 1200,
//         height: 630,
//       },
//     ],
//     locale: 'en_US',
//     type: 'website',
//   },
//   twitter: {
//     card: 'summary_large_image',
//     title: 'Solo Vizion',
//     description: 'Eyewear for every style.',
//     images: ['/og-image.png'],
//   },
//   // viewport: 'width=device-width, initial-scale=1',
//   icons: {
//     icon: '/favicon.ico',
//   },
// };

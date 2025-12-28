import { MetadataRoute } from 'next';
/**
 * I created 
src/app/manifest.ts
. Next.js will use this file to automatically generate a manifest.json.
This manifest allows users to install your app to their home screen (mobile/desktop) and is the first step towards "Offline" functionality.
Note: To enable true offline support (caching pages so they work without internet), you need a Service Worker. The recommended way to do this in Next.js is to install the next-pwa package (npm install next-pwa) and configure it in your next.config.js. Since I cannot run installation commands in your environment, I have set up the foundation (the manifest), and you can add the service worker package when ready.
Good luck with your app!
 * @returns 
 */
export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'OSM - Optical Store Management',
        short_name: 'OSM',
        description: 'Advanced Optical Store Management Solution',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
        icons: [
            {
                src: '/media/icon.jpg',
                sizes: '192x192',
                type: 'image/jpeg',
            },
            {
                src: '/media/icon.jpg',
                sizes: '512x512',
                type: 'image/jpeg',
            },
        ],
    };
}

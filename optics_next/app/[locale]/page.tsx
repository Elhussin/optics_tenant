
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Next.js App',
  description: 'A description of my app',
  icons: {
    icon: [
      {
        media: '(prefers-color-scheme: light)',
        url: '/icon-light.png', // Assuming icon-light.png is in the public directory or app/
        href: '/icon-light.png',
      },
      {
        media: '(prefers-color-scheme: dark)',
        url: '/icon-dark.png', // Assuming icon-dark.png is in the public directory or app/
        href: '/icon-dark.png',
      },
    ],
    apple: '/apple-icon.png', // Assuming apple-icon.png is in the public directory or app/
  },
};

// import {useTranslations} from 'next-intl';
import { getTranslations } from 'next-intl/server';

import {Link} from '@/app/i18n/navigation';
 

export default async function HomePage() {
  const t = await getTranslations('HomePage');
  return (
    <div>
    
      <h2 className="text-2xl font-semibold">{t('title')}</h2>
      <p className="mt-4">{t('description')}</p>
      <Link href="/about">About</Link>
    </div>
  );
}

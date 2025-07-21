
export const metadata = {
  title: 'O-S-M | Optical System Management',
  description: 'Discover the Best Solution For Optical System Management at O-S-M.',
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

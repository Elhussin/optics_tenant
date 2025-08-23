"use client"

import {Link} from '@/app/i18n/navigation'
import { useTranslations } from 'next-intl';

const metadata = {
  title: 'Blog | O-S-M',
  description: 'Learn more about Optical Store Management [O-S-M], a comprehensive system for managing optical shops and businesses.',
};

export default function BlogPage() {
  const t = useTranslations('blog');
  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white dark:bg-gray-900 rounded-xl shadow space-y-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <p>{t("description")}</p>

      <h2 className="text-xl font-semibold">{t("section1.title")}</h2>
      <p>{t("section1.content")}</p>

      <h2 className="text-xl font-semibold">{t("section2.title")}</h2>
      <p>{t("section2.content")}</p>
    </div>
  );

}

// export interface PageData {
//   id: number;
//   tenant: string;
//   title: string;
//   slug: string;
//   content: string;
//   created_at: string;
//   updated_at: string;
//   seo_title: string;
//   meta_description: string;
//   meta_keywords: string;
// }

// export interface CreatePageData {
//   // tenant: string;
//   title: string;
//   slug: string;
//   content: string;
//   seo_title: string;
//   meta_description: string;
//   meta_keywords: string;
// }
export type Language = 'en' | 'ar';

export interface PageTranslation {
  language: Language;
  title: string;
  content: string;
  seo_title: string;
  meta_description: string;
  meta_keywords: string;
}

export interface PageData {
  id: number;
  tenant: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  is_active: boolean;
  translations: PageTranslation[];
  default_language: Language;
  is_published: boolean;
  slug: string;
}

export interface CreatePageData {
  default_language: Language;
  translations: PageTranslation[];
  is_published?: boolean;
  slug: string;
}


export const getTranslation = (page: PageData, language: Language): PageTranslation | undefined => {
  return page.translations.find(t => t.language === language);
};

export const getCurrentTranslation = (page: PageData, language: Language): PageTranslation => {
  return getTranslation(page, language) || getTranslation(page, page.default_language) || page.translations[0];
};

export const LANGUAGES = {
  en: { name: 'English', dir: 'ltr', flag: '🇺🇸' },
  ar: { name: 'العربية', dir: 'rtl', flag: '🇸🇦' }
} as const;


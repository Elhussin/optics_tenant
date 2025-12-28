import { Language, PageData, PageTranslation } from "@/src/features/pages/types";
// optics_tenant/osmFront/src/features/pages/types/index.tsx
const FALLBACK_TRANSLATION: PageTranslation = {
  language: 'en',
  title: '',
  content: '',
  seo_title: '',
  meta_description: '',
  meta_keywords: ''
};

export const getTranslation = (page: PageData | null | undefined, language: Language): PageTranslation | undefined => {
  return page?.translations?.find(t => t.language === language);
};

export const getCurrentTranslation = (page: PageData | null | undefined, language: Language): PageTranslation => {
  if (!page || !page.translations || page.translations.length === 0) return FALLBACK_TRANSLATION;
  
  return getTranslation(page, language) 
      || getTranslation(page, page.default_language) 
      || page.translations[0]
      || FALLBACK_TRANSLATION;
};

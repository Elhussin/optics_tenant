import { Language, PageData, PageTranslation } from "@/types/pages";

export const getTranslation = (page: PageData, language: Language): PageTranslation | undefined => {
  return page.translations.find(t => t.language === language);
};

export const getCurrentTranslation = (page: PageData, language: Language): PageTranslation => {
  return getTranslation(page, language) || getTranslation(page, page.default_language) || page.translations[0];
};

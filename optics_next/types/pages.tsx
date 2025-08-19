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
  slug: string;
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
  translations: PageTranslation[];
  default_language: Language;
  is_published: boolean;
}

export interface CreatePageData {
  tenant: string;
  default_language: Language;
  translations: PageTranslation[];
  is_published?: boolean;
}

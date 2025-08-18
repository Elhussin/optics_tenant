export interface PageData {
  id: number;
  tenant: string;
  title: string;
  slug: string;
  content: string;
  created_at: string;
  updated_at: string;
  seo_title: string;
  meta_description: string;
  meta_keywords: string;
}

export interface CreatePageData {
  // tenant: string;
  title: string;
  slug: string;
  content: string;
  seo_title: string;
  meta_description: string;
  meta_keywords: string;
}

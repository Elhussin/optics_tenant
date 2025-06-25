
export  interface MetadataOptions {
    title: string;
    description: string;
    keywords?: string[];
    canonicalUrl?: string;
    suffix?: string;
    openGraphImage?: string; // ← صورة لمعاينة OG / Twitter
    openGraphType?: string; // ← نوع المحتوى في OG (مثلاً: article)
    twitterCardType?: 'summary' | 'summary_large_image'; // ← نوع بطاقة تويتر
  }
  


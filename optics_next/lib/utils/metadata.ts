import { MetadataOptions } from "@/types/metadata";
  export function generateMetadata({
    title,
    description,
    keywords = [],
    canonicalUrl,
    suffix = 'Solo Vizion',
    openGraphImage,
    openGraphType = 'website',
    twitterCardType = 'summary_large_image',
  }: MetadataOptions) {
    const fullTitle = `${title} | ${suffix}`;
  
    return {
      title: fullTitle,
      description,
      keywords,
      // alternates: canonicalUrl
      //   ? {
      //       canonical: canonicalUrl,
      //     }
      //   : undefined,
      // openGraph: {
      //   title: fullTitle,
      //   description,
      //   type: openGraphType,
      //   url: canonicalUrl,
      //   images: openGraphImage ? [{ url: openGraphImage }] : undefined,
      // },
      // twitter: {
      //   card: twitterCardType,
      //   title: fullTitle,
      //   description,
      //   images: openGraphImage ? [openGraphImage] : undefined,
      // },
    };
  }
  
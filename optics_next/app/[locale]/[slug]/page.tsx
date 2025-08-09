export async function generateMetadata({ params }: { params: { slug: string } }) {
  
  const res = await fetch(`${process.env.API_URL}/api/pages/${params.slug}`);
  const data = await res.json();

  return {
    title: data.title,
    description: data.description,
  };
}

// export async function generateMetadata({ params }: { params: { slug: string, locale: string } }) {
//   const page = await getPageBySlugAndLocale(params.slug, params.locale);

//   if (!page) return {};

//   return {
//     title: page.metaTitle || page.title,
//     description: page.metaDescription,
//   };
// }


export default async function Page({ params }: { params: { slug: string } }) {
  const res = await fetch(`${process.env.API_URL}/api/pages/${params.slug}`);
  const pageData = await res.json();

  return (
    <main>
      <h1>{pageData.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: pageData.content }} />
    </main>
  );
}


// app/[locale]/[slug]/page.tsx

// import { getPageBySlugAndLocale } from '@/lib/api';
// import { notFound } from 'next/navigation';

// export default async function Page({
//   params,
// }: {
//   params: { slug: string; locale: string };
// }) {
//   const { slug, locale } = params;

//   const page = await getPageBySlugAndLocale(slug, locale);

//   if (!page) return notFound();

//   return (
//     <main>
//       <h1>{page.title}</h1>

//       {/* استخدام مكونات مخصصة */}
//       {page.sections.map((section, index) => {
//         switch (section.type) {
//           case 'hero':
//             return <HeroSection key={index} data={section} />;
//           case 'features':
//             return <FeaturesSection key={index} data={section} />;
//           case 'faq':
//             return <FaqSection key={index} data={section} />;
//           default:
//             return null;
//         }
//       })}
//     </main>
//   );
// }

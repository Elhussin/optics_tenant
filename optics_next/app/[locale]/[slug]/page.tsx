// "use client";

// import { useEffect, useState } from "react";
// import { toast } from "sonner";
// import { useParams } from "next/navigation";
// import { useFormRequest } from "@/lib/hooks/useFormRequest";

// export default function DynamicPage() {
//   const [page, setPage] = useState<any>(null);
//   const params = useParams();
//   const pageName = params?.slug as string;
// // cms_api_public_pages_retrieve
// // cms_api_pages_retrieve
//   const fetchPage = useFormRequest({ alias: `public_api_pages_retrieve` });

//   useEffect(() => {
//     if (!pageName) {
//       toast.error("No page slug provided");
//       return;
//     }

//     const fetchData = async () => {
//       try {

//         // جلب الصفحة المحددة
//         const result = await fetchPage.submitForm({slug:pageName });
    

//         if (!result?.success) {
//           toast.error(result?.message || "Failed to fetch page data");
//           return;
//         }

//         if (!result.data) {
//           toast.error("Page not found");
//           return;
//         }
//        console.log("Fetched page:", result.data);
//         setPage(result.data);

//       } catch (error) {
//         console.error("Error fetching data:", error);
//         toast.error("An error occurred while fetching page");
//       }
//     };

//     fetchData();
//   }, [pageName]);

//   if (!page) {
//     return <div className="container mx-auto p-6">Page not found</div>;
//   }

//   return (
//     <main className="container mx-auto p-6">
//       <h1 className="text-3xl font-bold mb-4">{page?.title}</h1>
//       <div dangerouslySetInnerHTML={{ __html: page?.body }} />
//     </main>
//   );
// }
// app/[slug]/page.js (server component)
// export default async function Page({ params }: { params: { locale: string; slug: string } }) {
//   const res = await fetch(`http:localhost:8000/cms-api/pages/?slug=${params.slug}`, { cache: 'no-store' });
//   console.log("Fetching page with slug:", params.slug);
//   const data = await res.json();

//   if (!data) {
      
//     return <div className="container mx-auto p-6">Page not found</div>;
//   }
//   if (data.length === 0) {
//     return <div className="container mx-auto p-6">Page not found</div>;
//   }
//   const page = data[0];
//   if (!page) {
//     return <div className="container mx-auto p-6">Page not found</div>;
//   }
//   return (
//     <main className="container mx-auto p-6">
//       <h1 className="text-3xl font-bold mb-4">{page.title}</h1>
//       <div dangerouslySetInnerHTML={{ __html: page.body }} />
//       </main>
//   )
// }
// app/[slug]/page.tsx
interface PageData {
  title: string;
  intro?: string;
  body?: string;
  meta: { slug: string };
}

// جلب المسارات من Wagtail
export async function generateStaticParams() {
  const res = await fetch('http://localhost:8000/cms-api/pages/?type=home.HomePage&fields=title,slug', {
    next: { revalidate: 60 },
  });
  const data = await res.json();

  return data.items.map((p: any) => ({
    slug: p.meta.slug,
  }));
}

// جلب بيانات الصفحة
// export default async function Page({ params }: { params: { slug: string } }) {
//   const res = await fetch(`http://localhost:8000/cms-api/pages/?slug=${params.slug}`, {
//     next: { revalidate: 60 },
//   });
//   const data = await res.json();
//   const page: PageData = data.items[0];

//   if (!page) {
//     return <h1>Page not found</h1>;
//   }

//   return (
//     <main>
//       <h1>{page.title}</h1>
//       {page.intro && <p>{page.intro}</p>}
//       {page.body && (
//         <div dangerouslySetInnerHTML={{ __html: page.body }} />
//       )}
//     </main>
//   );
// }
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const res = await fetch(`http://localhost:8000/cms-api/pages/?slug=${params.slug}`);
  const data = await res.json();
  const page = data.items[0];

  if (!page) return {};

  return {
    title: page.seo_title || page.title,
    description: page.search_description || '',
  };
}
import React from "react";

async function getPageData(slug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cms/pages/${slug}/`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Page not found");
  return res.json();
}

export default async function DynamicPage({ params }: { params: { slug: string } }) {
  const page = await getPageData(params.slug);

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{page.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: page.body }} />
    </main>
  );
}

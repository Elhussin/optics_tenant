"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { useFormRequest } from "@/lib/hooks/useFormRequest";

export default function DynamicPage() {
  const [page, setPage] = useState<any>(null);
  const params = useParams();
  const pageName = params?.slug as string;
  const fetchPage = useFormRequest({ alias: `cms_api_v2_pages_retrieve` });
  const fetchPageDetiles = useFormRequest({ alias: `cms_api_v2_pages_retrieve_2` });

  useEffect(() => {
    if (!pageName) {
      toast.error("No page slug provided");
      return;
    }

    const fetchData = async () => {
      try {

        // جلب الصفحة المحددة
        const result = await fetchPage.submitForm({slug:pageName });
        if (result?.success) {
          if (result.data.items.length === 0 || !result.data.items[0]) {
            return <div>Page not found</div>;
          }
          const pageId = result.data.items[0].id;
          const pageResult = await fetchPageDetiles.submitForm({ id: pageId });
          if (pageResult?.success) {
            setPage(pageResult.data);
          } else {
            return <div>Page not found</div>;
          }
          return;
        }
        
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("An error occurred while fetching page");
      }
    };

    fetchData();
  }, [pageName]);

  if (!page) {
    return <div className="container mx-auto p-6">Page not found</div>;
  }
   console.log("Fetched page data:", page);
  return <View page={page} />;
}

function renderField(key: string, value: any) {
  // لو الحقل نص HTML زي body أو intro
  if (typeof value === "string" && value.includes("<")) {
    return (
      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: value }}
      />
    );
  }

  // لو الحقل صورة واحدة من Wagtail API
  if (value && typeof value === "object" && value.meta && value.meta.download_url) {
    return (
      <div className="my-4">
        <img
          src={value.meta.download_url}
          alt={value.title || key}
          className="rounded-lg shadow-md max-w-full"
        />
      </div>
    );
  }

  // لو الحقل عبارة عن StreamField
  if (Array.isArray(value)) {
    return value.map((block) => {
      if (block.type === "feature") {
        return (
          <div
            key={block.id}
            className="p-4 border rounded-lg shadow-sm bg-gray-50 mb-3"
          >
            <h3 className="text-lg font-bold">{block.value.key}</h3>
            <p className="text-gray-700">{block.value.text}</p>
          </div>
        );
      }
      return (
        <div key={block.id} className="p-4 border rounded-lg mb-3">
          <strong>{block.type}</strong>: {JSON.stringify(block.value)}
        </div>
      );
    });
  }

  // أي نص أو قيمة عادية
  return <p className="text-gray-700">{String(value)}</p>;
}

export function View({ page }: { page: any }) {
  return (
    <div className="max-w-4xl mx-auto p-6 font-sans">
      <h1 className="text-3xl font-bold mb-6">{page.title}</h1>
      {Object.keys(page).map((key) => {
        if (["id", "title", "meta"].includes(key)) return null;
        return (
          <section key={key} className="mb-6">
            <h2 className="text-xl font-semibold mb-2 capitalize">{key}</h2>
            {renderField(key, page[key])}
          </section>
        );
      })}
    </div>
  );
}

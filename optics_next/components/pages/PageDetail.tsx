'use client';
import { useEffect, useState } from "react";
import { Loading4 } from "@/components/ui/loding";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams } from "next/navigation";
import { RenderButtons } from "@/components/ui/buttons/RenderButtons";
import { useFetchData } from '@/lib/hooks/useCrudActions';
import { useCallback } from "react";

export const PageDetail = ({ pageId }: { pageId: any }) => {

  const params = useParams();
  const locale = params?.locale as string;
  const [pageData, setPageData] = useState<any>(null);

  const aliases = { deleteAlias: 'users_pages_destroy', editAlias: 'users_pages_partial_update' };

  const { submitForm: getData } = useFetchData(
    "users_pages_retrieve",
    setPageData
  );


  const refetch = useCallback(() => {
    if (pageId == null) return;
    getData({ id: pageId });
  }, [pageId]);
  
  useEffect(() => {
    refetch();
  }, [refetch]);
  

  const translation = pageData?.translations?.find((t: any) => t.language === locale)
    || pageData?.translations?.find((t: any) => t.language === pageData.default_language);
  
    if (!pageId) return <div>No Page Found</div>;
  if (!pageData) return <Loading4 />;

  return (
    <Card className="shadow-md rounded-2xl border">
      <CardHeader>
        <CardTitle>{translation?.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <p><b>Slug:</b> {pageData?.slug}</p>
        <p><b>Status:</b> {pageData?.is_published ? "Published" : "Draft"}</p>
        <p><b>SEO Title:</b> {translation?.seo_title}</p>
        <p>Is Deleted: {pageData?.is_deleted ? <span>✅</span> : <span className="text-red-700">❌</span>}</p>
        <p>Is Published: {pageData?.is_published ? <span>✅</span> : <span  className="text-red-700">❌</span>}</p>
        <p>Is Active: {pageData?.is_active ? <span>✅</span> : <span  className="text-red-700">❌</span>}</p>


        <p className="text-red-500 text-sm bg-red-50">
          {pageData?.is_deleted && "This item is deleted. You can restore it or delete it permanently."}
        </p>
        <div className="prose max-w-none border-t pt-4"
          dangerouslySetInnerHTML={{ __html: translation?.content ?? "" }}
        />

        <RenderButtons data={pageData} alias={aliases} refetch={refetch} navigatePath={`/dashboard/pages/`} />
      </CardContent>
    </Card>
  );
};


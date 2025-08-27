'use client';
import { useFormRequest } from "@/lib/hooks/useFormRequest";
import { useEffect, useState } from "react";
import { Loading4 } from "@/components/ui/loding";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams } from "next/navigation";
import { ConfirmDialog } from '@/components/ui/dialogs/ConfirmDialog';
import { useRouter } from "@/app/i18n/navigation";
import { X, Trash2, Pencil, ArrowLeft, Eye, Check,TimerReset,
   Plus, Copy, Printer, FileText } from "lucide-react";

import { PageData } from "@/types/pages";
import {ActionButton } from "@/components/ui/buttons";
import { safeToast } from '@/lib/utils/toastService';
import { RenderButtons } from "@/components/ui/buttons/RenderButtons";
export const PageDetail = ({ pageId }: { pageId: any }) => {
  const params = useParams();
  const locale = params?.locale as string;
  const [showDialog, setShowDialog] = useState(false);
  const [pageData, setPageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pageDetailRequest = useFormRequest({ alias: `users_pages_retrieve` });

  const aliases = { deleteAlias:'users_pages_destroy', editAlias:'users_pages_partial_update' };
  if (!pageId) return <div>No Page Found</div>;

  // 🔑 تعريف refetch
  const fetchPageDetail = async () => {
    setLoading(true);
    try {
      const result = await pageDetailRequest.submitForm({ id: pageId });
      if (result?.success) {
        setPageData(result.data);
      } else {
        setError("Page not found");
      }
    } catch {
      setError("Error loading page detail");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pageId) fetchPageDetail();
  }, [pageId]);

  const translation = pageData?.translations?.find((t: any) => t.language === locale) 
    || pageData?.translations?.find((t: any) => t.language === pageData.default_language);

  const handleConfirm = () => setShowDialog(false);

  if (loading) return <Loading4 />
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <Card className="shadow-md rounded-2xl border">
      <CardHeader>
        <CardTitle>{translation?.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <p><b>Slug:</b> {pageData?.slug}</p>
        <p><b>Status:</b> {pageData?.is_published ? "Published" : "Draft"}</p>
        <p><b>SEO Title:</b> {translation?.seo_title}</p>
        <p>Is Deleted: {pageData?.is_deleted ? <span>✅</span> : <span>❌</span>}</p>
        <p>Is Published: {pageData?.is_published ? <span>✅</span> : <span>❌</span>}</p>
        <p>Is Active: {pageData?.is_active ? <span>✅</span> : <span>❌</span>}</p>
        
        
          <p className="text-red-500 text-sm bg-red-50">
              {pageData.is_deleted && "This item is deleted. You can restore it or delete it permanently."}
        </p>
        <div className="prose max-w-none border-t pt-4" 
          dangerouslySetInnerHTML={{ __html: translation?.content ?? "" }} 
        />

        <RenderButtons data={pageData} alias={aliases} refetch={fetchPageDetail} navigatePath={`/dashboard/pages/`}/>
      </CardContent>
    </Card>
  );
};


import { useFormRequest } from "@/lib/hooks/useFormRequest";
import { useEffect, useState } from "react";
import { Loading4 } from "@/components/ui/loding";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams } from "next/navigation";
import {ActionButton } from "@/components/ui/buttons";
import { ConfirmDialog } from '@/components/ui/dialogs/ConfirmDialog';



export const PageDetail = ({ pageSlug }: { pageSlug: any }) => {
    const params = useParams();
    const locale = params?.locale as string;
    const [showDialog, setShowDialog] = useState(false);
    const [pageData, setPageData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const pageDetailRequest = useFormRequest({ alias: `users_pages_retrieve` });
    if (!pageSlug) return <div>No Page Found</div>;
  
      useEffect(() => {
        if (pageSlug) {
  
          const fetchPageDetail = async () => {
            try {
              const result = await pageDetailRequest.submitForm({ slug: pageSlug });
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
          fetchPageDetail();
        }
      }, [pageSlug]);
  
  
    const translation = pageData?.translations?.find((t: any) => t.language === locale) 
                        || pageData?.translations?.find((t: any) => t.language === pageData.default_language);
    console.log("Page Translation:", translation);
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
  
  
          {/* محتوى الصفحة */}
          <div 
            className="prose max-w-none border-t pt-4" 
            dangerouslySetInnerHTML={{ __html: translation?.content ?? "" }} 
          />
  
          <div className="flex gap-2 mt-4">
            {/* {pageData.is_deleted ? (
              <RestoreButton onClick={() => handleRestore(pageData.id)} />
            ) : (
              <>
                <EditButton onClick={() => handleEdit(pageData.id)} />
                <DeleteButton onClick={() => handleSoftDelete(pageData.id)} />
              </>
            )}
            {pageData.is_active ? (
              !pageData.is_deleted && <DeactivateButton onClick={() => handleDeactivate(pageData.id)} />
            ) : (
              !pageData.is_deleted && <ActivateButton onClick={() => handleActivate(pageData.id)} />
            )} */}
          </div>
        </CardContent>
  
        <ConfirmDialog
          open={showDialog}
          title={"Do You Want Delete Page"}
          message={"Are You Sure You Want To Delete This Page"}
          onCancel={() => setShowDialog(false)}
          onConfirm={handleConfirm}
        />
      </Card>
    );
  };
  
"use client";
import { notFound } from "next/navigation";
import { useFormRequest } from "@/lib/hooks/useFormRequest";
import { useEffect, useState } from "react";
import { Link } from "@/app/i18n/navigation";
import { useRouter } from "@/app/i18n/navigation";
import { EditButton, DeleteButton, CreateButton,RestoreButton, HardDeleteButton, DeactivateButton, ActivateButton } from "@/components/ui/buttons/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSearchParams } from "next/navigation";
import { useHardDeleteWithDialog } from "@/lib/hooks/useHardDeleteWithDialog";
import { ConfirmDialog } from '@/components/ui/dialogs/ConfirmDialog';
import {usePageActions} from "@/lib/hooks/usePageActions";
export default function AllPages() {
  const searchParams = useSearchParams();
  const pageSlug = searchParams.get("slug"); 

  const [pagesData, setPagesData] = useState<any>(null);
  const [pageData, setPageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pageRequest = useFormRequest({ alias: `users_pages_list` });
  const pageDetailRequest = useFormRequest({ alias: `users_pages_retrieve` });
  // const pageDeleteRequest = useFormRequest({ alias: `users_pages_destroy` });
  // const pageUpdateRequest = useFormRequest({ alias: `users_pages_partial_update` });
  const router = useRouter();

 
  useEffect(() => {
    if (!pageSlug) {
      const fetchPages = async () => {
        try {
          const result = await pageRequest.submitForm();
          if (result?.success) {
            setPagesData(result.data);
          } else {
            setError("No pages found");
          }
        } catch {
          setError("Error loading pages");
        } finally {
          setLoading(false);
        }
      };
      fetchPages();
    }
  }, [pageSlug]);
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <CreateButton onClick={() => router.push("/pages/new")} />
      </div>
      {pageSlug ? (
        <PageDetail pageData={pageData} />
        // <ViewCard entity={pageSlug} />
      ) : (
        <PagesList pagesData={pagesData} />
      )}
    </div>
  );
}


export const PageDetail = ({ pageData }: { pageData: any }) => {
    // const { confirmHardDelete, ConfirmDialogComponent } = useHardDeleteWithDialog({
    //   alias: `users_pages_list`,
    //   // onSuccess: () => fetchUser({ id })
    // });
  
    
  const [showDialog, setShowDialog] = useState(false);
  const router = useRouter();
  const {handleRestore,handleSoftDelete,handleEdit,handleDeactivate,handleActivate} = usePageActions("users_pages_list");
  
  const handleConfirm = () => {
    setShowDialog(false);
    // handleHardDelete(pageData.id);
  };
    const renderButtons = () => (
      <>
        {pageData.is_deleted ? (
          <>
            <RestoreButton onClick={() => handleRestore(pageData.id)} />
            {/* <HardDeleteButton onClick={() => confirmHardDelete(pageData.id)} /> */}
          </>
        ) : (
          <>
            <EditButton onClick={() => handleEdit(pageData.id )} />
            
            <DeleteButton onClick={() => handleSoftDelete(pageData.id)} />
          </>
        )}
        {pageData.is_active ? !pageData.is_deleted && (
          <DeactivateButton onClick={() => handleDeactivate(pageData.id)} />
        ) : !pageData.is_deleted && (
          <ActivateButton onClick={() => handleActivate(pageData.id)} />
        )}
      </>
    );
  
  return (
    <Card className="shadow-md rounded-2xl border">
    <CardHeader>
      <CardTitle>{pageData?.title}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-2 text-sm">
      <p>Slug: {pageData?.slug}</p>
      <p>Status: {pageData?.status}</p>
      <p>SEO Title: {pageData?.seo_title}</p>
      <p>Active: {String(pageData?.is_active)}</p>
      <div className="flex gap-2 mt-4">
        {renderButtons()}
      </div>
    </CardContent>
   
        <ConfirmDialog
          open={showDialog}
          title={"Do You Wont Delete e PAge"}
          message={"Are You Sure You Want To Delete This Page"}
          onCancel={() => setShowDialog(false)}
          onConfirm={handleConfirm}
        />
  </Card>
  )
}

export const PagesList = ({ pagesData }: { pagesData: any[] }) => {
  const router = useRouter();
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {pagesData.map((p: any) => (
      <Card key={p.id ?? p.slug} className="shadow-md rounded-2xl border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{p.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><span className="font-medium">Slug:</span> {p.slug}</p>
          <p><span className="font-medium">Status:</span> {p.status}</p>
          <p><span className="font-medium">SEO Title:</span> {p.seo_title}</p>
          <p><span className="font-medium">Active:</span> {String(p.is_active)}</p>
          <div className="flex gap-2 mt-4">
            <EditButton onClick={() => router.push(`/pages/${p.slug}/`)} />
            <Link href={`/pages?slug=${p.slug}`} className="text-blue-500 underline">
              View
            </Link>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
  )
}

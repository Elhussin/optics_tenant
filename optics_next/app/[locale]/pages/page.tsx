"use client";
import { notFound } from "next/navigation";
import { useFormRequest } from "@/lib/hooks/useFormRequest";
import { useEffect, useState } from "react";
import { Link } from "@/app/i18n/navigation";
import { useRouter } from "@/app/i18n/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSearchParams,useParams } from "next/navigation";
import { useHardDeleteWithDialog } from "@/lib/hooks/useHardDeleteWithDialog";
import { ConfirmDialog } from '@/components/ui/dialogs/ConfirmDialog';
// // import {usePageActions} from "@/lib/hooks/usePageActions";
// import { DeleteButton, EditButton } from '@/components/ui/buttons/Button';
// import { useCrudActions } from '@/lib/hooks/useCrudActions';
// import { usePageRouting } from '@/lib/hooks/usePageRouting';

  // const crud = useCrudActions({ onSuccessRefresh: () => routing.refresh() });
import {ActionButton } from "@/components/ui/buttons";

export default function AllPages() {

  const searchParams = useSearchParams();
  const pageSlug = searchParams.get("slug"); 

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <ActionButton label="Create Page" variant="link" navigateTo={"/pages/new"} />
      </div>
      {pageSlug ? (
        <PageDetail pageSlug={pageSlug} />
      ) : (
        <PagesList/>
      )}
    </div>
  );
}




export const PageDetail = ({ pageSlug }: { pageSlug: any }) => {
  const params = useParams();
  const local = params?.local as string;
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


  const translation = pageData?.translations?.find((t: any) => t.language === local) 
                      || pageData?.translations?.find((t: any) => t.language === pageData.default_language);
  console.log("Page Translation:", translation);
  const handleConfirm = () => setShowDialog(false);

  if (loading) return <div>Loading...</div>;
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


export const PagesList = () => {
  const [pagesData, setPagesData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const locale = params?.locale as string;
  const router = useRouter();
  const pageRequest = useFormRequest({ alias: `users_pages_list` });
  useEffect(() => {

      const fetchPages = async () => {
        try {
          const result = await pageRequest.submitForm();
          console.log("Pages List Result:", result);
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
    
  }, []);
  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {pagesData.map((p: any) => {
        // اختيار الترجمة المناسبة
        const translation = p.translations?.find((t: any) => t.language === locale)
                          || p.translations?.find((t: any) => t.language === p.default_language);
                  console.log("Page Translation:", translation);

        return (
          <Card key={p.id ?? p.slug} className="shadow-md rounded-2xl border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">{translation?.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><span className="font-medium">Slug:</span> {p.slug}</p>
              <p><span className="font-medium">Status:</span> {p.is_published ? "Published" : "Draft"}</p>
              <p><span className="font-medium">SEO Title:</span> {translation?.seo_title}</p>
              <div className="flex gap-2 mt-4">
                {/* <ActionButton label="Edit" onClick={() => router.push(`/pages/${p.slug}/`)} /> */}
                <ActionButton label="Edit " variant="link" navigateTo={`/pages/${p.slug}/`} />
                <Link href={`/pages?slug=${p.slug}`} className="text-blue-500 underline">
                  View
                </Link>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};




  // const crud = useCrudActions({ onSuccessRefresh: () => routing.refresh() });
  // const params = useParams();
  // const locale = params.locale;
  // const [pagesData, setPagesData] = useState<any>(null);
  // const [pageData, setPageData] = useState<any>(null);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);

  // const pageRequest = useFormRequest({ alias: `users_pages_list` });
  // const pageDetailRequest = useFormRequest({ alias: `users_pages_retrieve` });

  // const router = useRouter();

 
  // useEffect(() => {
  //   if (!pageSlug) {
  //     const fetchPages = async () => {
  //       try {
  //         const result = await pageRequest.submitForm();
  //         console.log("Pages List Result:", result);
  //         if (result?.success) {
  //           setPagesData(result.data);
  //         } else {
  //           setError("No pages found");
  //         }
  //       } catch {
  //         setError("Error loading pages");
  //       } finally {
  //         setLoading(false);
  //       }
  //     };
  //     fetchPages();
  //   }
  // }, []);
  // useEffect(() => {
  //   if (pageSlug) {
  //     const fetchPageDetail = async () => {
  //       try {
  //         const result = await pageDetailRequest.submitForm({ slug: pageSlug });
  //         if (result?.success) {
  //           setPageData(result.data);
  //         } else {
  //           setError("Page not found");
  //         }
  //       } catch {
  //         setError("Error loading page detail");
  //       } finally {
  //         setLoading(false);
  //       }
  //     };
  //     fetchPageDetail();
  //   }
  // }, [pageSlug]);

  // if (loading) return <div>Loading...</div>;
  // if (error) return <div className="text-red-500">{error}</div>;
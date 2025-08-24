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



export const PageDetail = ({ pageSlug }: { pageSlug: any }) => {
    const params = useParams();
    const locale = params?.locale as string;
    const [showDialog, setShowDialog] = useState(false);
    const [pageData, setPageData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const pageDetailRequest = useFormRequest({ alias: `users_pages_retrieve` });
  
    const aliases = { deleteAlias:'users_pages_destroy', editAlias:'users_pages_partial_update' };
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


          {/* محتوى الصفحة */}
          <div 
            className="prose max-w-none border-t pt-4" 
            dangerouslySetInnerHTML={{ __html: translation?.content ?? "" }} 
          />
  
          <div className="flex gap-2 mt-4">
            <RenderButtons data={pageData} alias={aliases} />
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
  



interface Alias {
  deleteAlias: string;
  editAlias: string;
}

type RenderButtonsProps = {
  data: PageData;
  alias: Alias;
};


// export const RenderButtons = ({ data, alias }: RenderButtonsProps) => {
//     const routing = useRouter();
//   const editRequest = useFormRequest({ alias: alias.editAlias });
//   const deleteRequest = useFormRequest({ alias: alias.deleteAlias });
//   const handleHardDelete = () =>
//     deleteRequest.submitForm({ slug: data.slug }, () => routing.back());
//   const handleDelete = () =>
//     editRequest.submitForm({ slug: data.slug, is_deleted: true, is_active: false }, () => routing.refresh());

//   const handleRestore = () =>
//     editRequest.submitForm({ slug: data.slug, is_deleted: false, is_active: true }, () => routing.refresh());

//   const handleActivate = () =>
//     editRequest.submitForm({ slug: data.slug, is_active: true }, () => routing.refresh());

//   const handleDeactivate = () =>
//     editRequest.submitForm({ slug: data.slug, is_active: false }, () => routing.refresh());

//   return (
//     <div className="flex gap-2 mt-4">
//       {data.is_deleted && (
//         <>
//           <ActionButton label="Delete" icon={<Trash2 size={16} />} variant="danger" onCrud={handleHardDelete} />
//           <ActionButton label="Restore" icon={<TimerReset size={16} />} variant="info" onCrud={handleRestore} />
//         </>
//       )}

//       {!data.is_deleted && !data.is_active && (
//         <>
//           <ActionButton label="Delete" icon={<Trash2 size={16} />} variant="danger" onCrud={handleDelete} />
//           <ActionButton label="Activate" icon={<Check size={16} />} variant="success" onCrud={handleActivate} />
//         </>
//       )}

//       {data.is_active && !data.is_deleted && (
//         <>
//           <ActionButton label="Edit" icon={<Pencil size={16} />} variant="info" navigateTo={`/dashboard/pages/${data.slug}/`} />
//           <ActionButton label="Deactivate" icon={<X size={16} />} variant="warning" onCrud={handleDeactivate} />
//         </>
//       )}

//       <ActionButton label="Back" icon={<ArrowLeft size={16} />} variant="info" navigateTo={`/dashboard/pages`} />
//     </div>
//   );
// };

export const RenderButtons = ({ data, alias }: RenderButtonsProps) => {
  const routing = useRouter();

  const editRequest = useFormRequest({ 
    alias: alias.editAlias,
    onSuccess: () => routing.refresh()
  });

  const deleteRequest = useFormRequest({ 
    alias: alias.deleteAlias,
    onSuccess: () => routing.back()
  });

  const handleHardDelete = () =>
    deleteRequest.submitForm({ slug: data.slug });

  const handleDelete = () =>
    editRequest.submitForm({ slug: data.slug, is_deleted: true, is_active: false });

  const handleRestore = () =>
    editRequest.submitForm({ slug: data.slug, is_deleted: false, is_active: true });

  const handleActivate = () =>
    editRequest.submitForm({ slug: data.slug, is_active: true });

  const handleDeactivate = () =>
    editRequest.submitForm({ slug: data.slug, is_active: false });

  const handlePublish = () =>
    editRequest.submitForm({ slug: data.slug, is_published: true });

  const handleDePublish = () =>
    editRequest.submitForm({ slug: data.slug, is_published: false });

  return (
    <div className="flex gap-2 mt-4">
      {data.is_deleted && (
        <>
          <ActionButton label="Deleten Permanent" icon={<Trash2 size={16} />} variant="danger" onCrud={handleHardDelete} />
          <ActionButton label="Restore" icon={<TimerReset size={16} />} variant="info" onCrud={handleRestore} />
        </>
      )}

      {!data.is_deleted && !data.is_active && (
        <>
          <ActionButton label="Delete" icon={<Trash2 size={16} />} variant="danger" onCrud={handleDelete} />
          <ActionButton label="Activate" icon={<Check size={16} />} variant="success" onCrud={handleActivate} />
        </>
      )}

      {data.is_active && !data.is_deleted && (
        <>
          <ActionButton label="Edit" icon={<Pencil size={16} />} variant="info" navigateTo={`/dashboard/pages/${data.slug}/`} />
          <ActionButton label="Deactivate" icon={<X size={16} />} variant="warning" onCrud={handleDeactivate} />
        </>
      )}

      <ActionButton label="Back" icon={<ArrowLeft size={16} />} variant="info" navigateTo={`/dashboard/pages`} />
    </div>
  );
};


    // <>
    //   {item.is_deleted ? (
    //     <>
    //       <RestoreButton onClick={() => handleRestore(item.id)} />
    //       <HardDeleteButton onClick={() => confirmHardDelete(item.id)} />
    //     </>
    //   ) : (
    //     <>
    //       <EditButton onClick={() => handleEdit(item.id )} />
          
    //       <DeleteButton onClick={() => handleSoftDelete(item.id)} />
    //     </>
    //   )}
    //   {item..is_active ? !item.is_deleted && (
    //     <DeactivateButton onClick={() => handleDeactivate(item.id)} />
    //   ) : !item.is_deleted && (
    //     <ActivateButton onClick={() => handleActivate(item.id)} />
    //   )}
    // </>
// 'primary' | 'secondary' | 'danger' | 'success' | 'info' | 'outline' | 'link' | 'reset' | 'cancel' | 'close';

{/* <ActionButton
  label="Delete"
  icon={<TrashIcon />}
  onCrud={() =>
    crud.submit(
      'softDeleteAlias',
      'Item deleted',
      'Failed to delete',
      { id: page.id, is_deleted: true }
    )
  }
/> */}

{/* <ActionButton
  label="Edit"
  icon={<EditIcon />}
  navigateTo={`/pages?id=${page.id}&action=edit`}
/> */}

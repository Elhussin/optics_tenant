'use client';
import { useFormRequest } from "@/lib/hooks/useFormRequest";
import { useRouter } from "@/app/i18n/navigation";
import { X, Trash2, Pencil, ArrowLeft, Check,RotateCcw  } from "lucide-react";
import { useHardDeleteWithDialog } from '@/lib/hooks/useHardDeleteWithDialog';
import { PageData } from "@/types/pages";
import {ActionButton } from "@/components/ui/buttons";
import { safeToast } from '@/lib/utils/toastService';


interface Alias {
  deleteAlias: string;
  editAlias: string;
}

type RenderButtonsProps = {
  data: PageData;
  alias: Alias;
  refetch: () => void;   // ✅ إضافة refetch
  navigatePath:string;
};

export const RenderButtons = ({ data, alias, refetch, navigatePath}: RenderButtonsProps) => {

  const editRequest = useFormRequest({ 
    alias: alias.editAlias,
    onSuccess: () => { 
      safeToast("Updated Successfully",{type:"success"});
      refetch();   // ✅ تحديث البيانات بدل refresh()
    },
    onError: () => {
      safeToast("Error Updating ",{type:"error"});
    }
  });

  const handleDelete = () =>
    editRequest.submitForm({ id: data.id, is_deleted: true, is_active: false,   ...("is_published" in data ? { is_published: false } : {}) });

  const handleRestore = () =>
    editRequest.submitForm({ id: data.id,
      is_deleted: false,
      is_active: true,
      ...("is_published" in data ? { is_published: true } : {})
    });

  const handleActivate = () =>
    editRequest.submitForm({ id: data.id, is_active: true,  ...("is_published" in data ? { is_published: true } : {}) });

  const handleDeactivate = () =>
    editRequest.submitForm({ id: data.id, is_active: false, ...("is_published" in data ? { is_published: false } : {}) });


    const { confirmHardDelete, ConfirmDialogComponent } = useHardDeleteWithDialog({
      alias: alias.deleteAlias!,
      redirectPath:navigatePath,
    });
{/* <HardDeleteButton onClick={() => confirmHardDelete(item.id)} /> */}
    const deleteButton = <ActionButton label="Delete" icon={<Trash2 size={16} />} variant="danger" title="Delete Item" onCrud={handleDelete} />;
    const hardDeleteButton = <ActionButton label="Delete Permanently" icon={<Trash2 size={16} />} variant="danger" title="Delete Permanently"  onClick={() => confirmHardDelete(data.id)} />;
    const editButton = <ActionButton label="Edit" icon={<Pencil size={16} />} variant="info" title="Edit Item" navigateTo={`${navigatePath}/${data?.id}/edit`} />;
    const activateButton = <ActionButton label="Activate" icon={<Check size={16} />} variant="success" title="Activate Item" onCrud={handleActivate} />;
    const deactivateButton = <ActionButton label="Deactivate" icon={<X size={16} />} variant="warning" title="Deactivate Item" onCrud={handleDeactivate} />;
    const restoreButton = <ActionButton label="Restore" icon={<RotateCcw  size={16} />} variant="info" title="Restore Item" onCrud={handleRestore} />;
    const backButton = <ActionButton label="Back" icon={<ArrowLeft size={16} />} variant="info" navigateTo={`${navigatePath}`} />;

  return (
    <div className="flex gap-2 mt-4">
      {data?.is_deleted && (
        <>
          {hardDeleteButton}
          {restoreButton}
        </>
      )}

      {!data?.is_deleted && !data?.is_active && (
        <>
          {deleteButton}
          {activateButton}
        </>
      )}

      {data?.is_active && !data?.is_deleted && (
        <>
          {editButton}
          {deactivateButton}
          {deleteButton}
        </>
      )}
            {ConfirmDialogComponent}
      {backButton}
    </div>
  );
};

'use client';
import { useFormRequest } from "@/src/shared/hooks/useFormRequest";
import { X, Trash2, Pencil, ArrowLeft, Check, RotateCcw } from "lucide-react";
import { useHardDeleteWithDialog } from '@/src/shared/hooks/useHardDeleteWithDialog';

import { ActionButton } from "@/src/shared/components/ui/buttons";
import { safeToast } from '@/src/shared/utils/toastService';
import { useTranslations } from 'next-intl';
import { RenderButtonsProps } from '@/src/shared/types';




export const RenderButtons = ({ data, alias, refetch, navigatePath }: RenderButtonsProps) => {
  const t = useTranslations("button");
  const editRequest = useFormRequest({
    alias: alias.editAlias,
    onSuccess: () => {
      safeToast(t("updatedSuccessfully"), { type: "success" });
      refetch();   // ✅ تحديث البيانات بدل refresh()
    },
    onError: () => {
      safeToast(t("errorUpdating"), { type: "error" });
    }
  });

  const handleDelete = () =>
    editRequest.submitForm({ id: data.id, is_deleted: true, is_active: false, ...("is_published" in data ? { is_published: false } : {}) });

  const handleRestore = () =>
    editRequest.submitForm({
      id: data.id,
      is_deleted: false,
      is_active: true,
      ...("is_published" in data ? { is_published: true } : {})
    });

  const handleActivate = () =>
    editRequest.submitForm({ id: data.id, is_active: true, ...("is_published" in data ? { is_published: true } : {}) });

  const handleDeactivate = () =>
    editRequest.submitForm({ id: data.id, is_active: false, ...("is_published" in data ? { is_published: false } : {}) });


  const { confirmHardDelete, ConfirmDialogComponent } = useHardDeleteWithDialog({
    alias: alias.deleteAlias!,
    redirectPath: navigatePath,
  });

  const deleteButton = <ActionButton icon={<Trash2 size={16} />} variant="danger" title={t("delete")} onCrud={handleDelete} />;
  const hardDeleteButton = <ActionButton icon={<Trash2 size={16} />} variant="danger" title={t("deleteTitle")} onClick={() => confirmHardDelete(data.id)} />;
  const editButton = <ActionButton icon={<Pencil size={16} />} variant="info" title={t("edit")} navigateTo={`${navigatePath}/${data?.id}/edit`} />;
  const activateButton = <ActionButton icon={<Check size={16} />} variant="success" title={t("activate")} onCrud={handleActivate} />;
  const deactivateButton = <ActionButton icon={<X size={16} />} variant="warning" title={t("deactivate")} onCrud={handleDeactivate} />;
  const restoreButton = <ActionButton icon={<RotateCcw size={16} />} variant="info" title={t("restoreTitle")} onCrud={handleRestore} />;
  const backButton = <ActionButton icon={<ArrowLeft size={16} />} variant="info" title={t("back")} navigateTo={`${navigatePath}`} />;

  return (
    <div className="flex gap-2 mt-4">
      {backButton}
      {data?.is_deleted && (
        <>
          {restoreButton}
          {hardDeleteButton}

        </>
      )}

      {!data?.is_deleted && !data?.is_active && (
        <>
          {activateButton}
          {deleteButton}

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

    </div>
  );
};

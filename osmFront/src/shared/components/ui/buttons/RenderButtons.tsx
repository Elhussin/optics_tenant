"use client";
import { X, Trash2, Pencil, ArrowLeft, Check, RotateCcw } from "lucide-react";
import { useHardDeleteWithDialog } from "@/src/shared/hooks/useHardDeleteWithDialog";

import { ActionButton } from "@/src/shared/components/ui/buttons";
import { safeToast } from "@/src/shared/utils/safeToast";
import { useTranslations } from "next-intl";
import { RenderButtonsProps } from "@/src/shared/types";
import { useApiForm } from "@/src/shared/hooks/useApiForm";

export const RenderButtons = ({
  data,
  alias,
  refetch,
  navigatePath,
  isViewOnly = false,
}: RenderButtonsProps) => {
  const t = useTranslations("button");

  const editRequest = useApiForm({
    alias: alias.editAlias,
    onSuccess: () => {
      safeToast(t("updatedSuccessfully"), { type: "success" });
      refetch(); // ✅ تحديث البيانات بدل refresh()
    },
    onError: () => {
      safeToast(t("errorUpdating"), { type: "error" });
    },
  });

  const handleDelete = () =>
    editRequest.mutation.mutateAsync({
      id: data.id,
      is_deleted: true,
      is_active: false,
      ...("is_published" in data ? { is_published: false } : {}),
    });

  const handleRestore = () =>
    editRequest.mutation.mutateAsync({
      id: data.id,
      is_deleted: false,
      is_active: true,
      ...("is_published" in data ? { is_published: true } : {}),
    });

  const handleActivate = () =>
    editRequest.mutation.mutateAsync({
      id: data.id,
      is_active: true,
      ...("is_published" in data ? { is_published: true } : {}),
    });

  const handleDeactivate = () =>
    editRequest.mutation.mutateAsync({
      id: data.id,
      is_active: false,
      ...("is_published" in data ? { is_published: false } : {}),
    });

  const { confirmHardDelete, ConfirmDialogComponent } = useHardDeleteWithDialog(
    {
      alias: alias.deleteAlias!,
      redirectPath: navigatePath,
    }
  );

  const deleteButton = (
    <ActionButton
      icon={<Trash2 size={18} />}
      variant="custom"
      className="h-9 w-9 p-0 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition-colors"
      title={t("delete")}
      onCrud={handleDelete}
    />
  );
  const hardDeleteButton = (
    <ActionButton
      icon={<Trash2 size={18} />}
      variant="custom"
      className="h-9 w-9 p-0 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-300 dark:hover:bg-red-900/60 transition-colors border border-red-200 dark:border-red-800"
      title={t("deleteTitle")}
      onClick={() => confirmHardDelete(data.id)}
    />
  );
  const editButton = (
    <ActionButton
      icon={<Pencil size={18} />}
      variant="custom"
      className="h-9 w-9 p-0 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/40 transition-colors"
      title={t("edit")}
      navigateTo={`${navigatePath}/${data?.id}/edit`}
    />
  );
  const activateButton = (
    <ActionButton
      icon={<Check size={18} />}
      variant="custom"
      className="h-9 w-9 p-0 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40 transition-colors"
      title={t("activate")}
      onCrud={handleActivate}
    />
  );
  const deactivateButton = (
    <ActionButton
      icon={<X size={18} />}
      variant="custom"
      className="h-9 w-9 p-0 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
      title={t("deactivate")}
      onCrud={handleDeactivate}
    />
  );
  const restoreButton = (
    <ActionButton
      icon={<RotateCcw size={18} />}
      variant="custom"
      className="h-9 w-9 p-0 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 transition-colors"
      title={t("restoreTitle")}
      onCrud={handleRestore}
    />
  );
  // Back button removed as it's now handled in ViewDetailsCard header

  return (
    <div className="flex items-center gap-2">
      {!isViewOnly && (
        <>
          {data?.is_deleted ? (
            <>
              {restoreButton}
              {hardDeleteButton}
            </>
          ) : (
            <>
              {editButton}
              {data?.is_active ? deactivateButton : activateButton}
              {deleteButton}
            </>
          )}
          {ConfirmDialogComponent}
        </>
      )}
    </div>
  );
};

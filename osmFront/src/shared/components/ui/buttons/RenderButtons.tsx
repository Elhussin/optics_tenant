"use client";

import { X, Trash2, Pencil, Check, RotateCcw } from "lucide-react";
import { useHardDeleteWithDialog } from "@/src/shared/hooks/useHardDeleteWithDialog";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { safeToast } from "@/src/shared/utils/safeToast";
import { useTranslations } from "next-intl";
import { RenderButtonsProps } from "@/src/shared/types";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { cn } from "@/src/shared/utils/cn";

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
      refetch();
    },
    onError: () => {
      safeToast(t("errorUpdating"), { type: "error" });
    },
  });

  const isLoading = editRequest.mutation.isPending;

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

  // مجموعة أزرار العنصر المحذوف
  if (data?.is_deleted) {
    return (
      <>
        <div className="flex items-center gap-2 p-1.5 bg-elevated/50 rounded-xl border border-border-main">
          {/* Restore Button */}
          <ActionButton
            variant="icon-success"
            size="sm"
            icon={<RotateCcw size={18} />}
            title={t("restoreTitle")}
            onCrud={handleRestore}
            isLoading={isLoading}
            className="rounded-lg"
          />

          {/* Hard Delete Button */}
          <ActionButton
            variant="icon-delete"
            size="sm"
            icon={<Trash2 size={18} />}
            title={t("deleteTitle")}
            onClick={() => confirmHardDelete(data.id)}
            className="rounded-lg border-2"
          />
        </div>
        {ConfirmDialogComponent}
      </>
    );
  }

  // مجموعة أزرار العنصر النشط
  if (!isViewOnly) {
    return (
      <>
        <div className="flex items-center gap-2 p-1.5 bg-elevated/50 rounded-xl border border-border-main">
          {/* Edit Button */}
          <ActionButton
            variant="icon-edit"
            size="sm"
            icon={<Pencil size={18} />}
            title={t("edit")}
            navigateTo={`${navigatePath}/${data?.id}/edit`}
            className="rounded-lg"
          />

          {/* Activate/Deactivate Toggle */}
          {data?.is_active ? (
            <ActionButton
              variant="icon-info"
              size="sm"
              icon={<X size={18} />}
              title={t("deactivate")}
              onCrud={handleDeactivate}
              isLoading={isLoading}
              className="rounded-lg"
            />
          ) : (
            <ActionButton
              variant="icon-success"
              size="sm"
              icon={<Check size={18} />}
              title={t("activate")}
              onCrud={handleActivate}
              isLoading={isLoading}
              className="rounded-lg"
            />
          )}

          {/* Delete Button */}
          <ActionButton
            variant="icon-delete"
            size="sm"
            icon={<Trash2 size={18} />}
            title={t("delete")}
            onCrud={handleDelete}
            isLoading={isLoading}
            className="rounded-lg"
          />
        </div>
        {ConfirmDialogComponent}
      </>
    );
  }

  // عرض فارغ للـ view-only
  return null;
};

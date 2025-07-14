// lib/hooks/useCrudHandlers.ts
'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useFormRequest } from './useFormRequest';

type CrudOptions = {
  softDeleteAlias?: string;
  restoreAlias?: string;
  hardDeleteAlias?: string;
  onSuccessRefresh?: () => void;
};

export function useCrudHandlers(basePath: string, options?: CrudOptions) {
  const router = useRouter();
  const {
    softDeleteAlias,
    restoreAlias,
    hardDeleteAlias,
    onSuccessRefresh,
  } = options || {};

  // 👉 التوجيهات
  const handleView = (id: string | number) => router.push(`${basePath}/${id}/view`);
  const handleEdit = (id: string | number) => router.push(`${basePath}/${id}/edit`);
  const handleCreate = () => router.push(`${basePath}/create`);
  const handleCancel = () => router.back();
  const handleRefresh = () => router.refresh();

  // 👉 الحذف الجزئي (soft)
  const softDeleteRequest = useFormRequest({
    alias: softDeleteAlias ?? '',
    onSuccess: () => {
      toast.success('Item soft-deleted');
      onSuccessRefresh?.();
    },
    onError: (err) => {
      console.error('Soft delete error:', err);
      toast.error('Failed to soft-delete item');
    },
  });

  // 👉 الاستعادة
  const restoreRequest = useFormRequest({
    alias: restoreAlias ?? '',
    onSuccess: () => {
      toast.success('Item restored');
      onSuccessRefresh?.();
    },
    onError: (err) => {
      console.error('Restore error:', err);
      toast.error('Failed to restore item');
    },
  });



  // 👉 عمليات CRUD
  const handleSoftDelete = (id: string | number) => {
    if (!softDeleteAlias) {
      console.warn('Soft delete alias not defined');
      return;
    }
    softDeleteRequest.submitForm({ id, is_deleted: true,is_active: false });
  };

  const handleRestore = (id: string | number) => {
    if (!restoreAlias) {
      console.warn('Restore alias not defined');
      return;
    }
    restoreRequest.submitForm({ id, is_deleted: false,is_active: true });
  };



    return {
    handleView,
    handleEdit,
    handleCreate,
    handleSoftDelete,      // Soft delete
    handleRestore,     // Restore
    handleCancel,
    handleRefresh,
  };


}

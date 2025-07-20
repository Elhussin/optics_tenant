// lib/hooks/useCrudHandlers.ts
'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useFormRequest } from './useFormRequest';

type CrudOptions = {
  softDeleteAlias?: string;
  restoreAlias?: string;
  onSuccessRefresh?: () => void;
};

export function useCrudHandlers(basePath: string, options?: CrudOptions) {
  const router = useRouter();
  const {
    softDeleteAlias,
    restoreAlias,
    onSuccessRefresh,
  } = options || {};

  // routes
  const handleView = (id: string | number) => router.push(`${basePath}/${id}/view`);
  const handleEdit = (id: string | number) => router.push(`${basePath}/${id}/edit`);
  const handleCreate = () => router.push(`${basePath}/create`);
  const handleCancel = () => router.back();
  const handleRefresh = () => router.refresh();



  const activateRequest=useFormRequest({
    alias: softDeleteAlias ?? '',

    onSuccess: (res) => {
      toast.success('Item activated');
      onSuccessRefresh?.();
    },
    onError: (err) => {
  
      toast.error('Failed to activate item');
    },
  });

    
  const deactivateRequest=useFormRequest({
    alias: softDeleteAlias ?? '',
    onSuccess: () => {
      toast.success('Item deactivated');
      onSuccessRefresh?.();
    },
    onError: (err) => {
      toast.error('Failed to deactivate item');
    },
  });

  const softDeleteRequest = useFormRequest({
    alias: softDeleteAlias ?? '',
    onSuccess: () => {
      toast.success('Item soft-deleted');
      onSuccessRefresh?.();
    },
    onError: (err) => {
  
      toast.error('Failed to soft-delete item');
    },
  });


  const restoreRequest = useFormRequest({
    alias: restoreAlias ?? '',
    onSuccess: () => {
      toast.success('Item restored');
      onSuccessRefresh?.();
    },
    onError: (err) => {
      toast.error('Failed to restore item');
    },
  });


  // 👉 عمليات CRUD
  const handleSoftDelete = (id: string | number) => {
    if (!softDeleteAlias) {
      return;
    }
    softDeleteRequest.submitForm({ id, is_deleted: true,is_active: false });
    // router.back();
  };

  const handleRestore = (id: string | number) => {
    if (!restoreAlias) {
      return;
    }
    restoreRequest.submitForm({ id, is_deleted: false,is_active: true });
  };


  const handleActivate = (id: string | number) => {
    if (!softDeleteAlias) {
      return;
    }
    activateRequest.submitForm({ id, is_active: true });
  };

  const handleDeactivate = (id: string | number) => {
    if (!softDeleteAlias) {
  
      return;
    }
    deactivateRequest.submitForm({ id, is_active: false });
  };


    return {
    handleView,
    handleEdit,
    handleCreate,
    handleSoftDelete,     
    handleRestore, 
    handleCancel,
    handleRefresh,
    handleActivate,
    handleDeactivate,
  };


}


// 'use client';

// import { useRouter } from 'next/navigation';
// import { toast } from 'sonner';
// import { useFormRequest } from './useFormRequest';

// type CrudOptions = {
//   softDeleteAlias?: string;
//   restoreAlias?: string;
//   activateAlias?: string;
//   deactivateAlias?: string;
//   onSuccessRefresh?: () => void;
// };

// export function usePageActions(basePath: string, options?: CrudOptions) {
//   const router = useRouter();
//   const {
//     softDeleteAlias,
//     restoreAlias,
//     activateAlias,
//     deactivateAlias,
//     onSuccessRefresh,
//   } = options || {};

//   // 🔨 Helper لإنشاء requests
//   const makeRequest = (
//     alias?: string,
//     successMsg?: string,
//     errorMsg?: string
//   ) =>
//     useFormRequest({
//       alias: alias ?? '',
//       onSuccess: () => {
//         toast.success(successMsg || 'Success');
//         onSuccessRefresh?.();
//       },
//       onError: () => {
//         toast.error(errorMsg || 'Failed');
//       },
//     });

//   // 📝 Requests
//   const softDeleteRequest = makeRequest(
//     softDeleteAlias,
//     'Item soft-deleted',
//     'Failed to soft-delete item'
//   );
//   const restoreRequest = makeRequest(
//     restoreAlias,
//     'Item restored',
//     'Failed to restore item'
//   );
//   const activateRequest = makeRequest(
//     activateAlias,
//     'Item activated',
//     'Failed to activate item'
//   );
//   const deactivateRequest = makeRequest(
//     deactivateAlias,
//     'Item deactivated',
//     'Failed to deactivate item'
//   );

//   // 📌 Navigation handlers
//   const handleView = (id: string | number) =>
//     router.push(`${basePath}/${id}/view`);
//   const handleEdit = (id: string | number) =>
//     router.push(`${basePath}?id=${id}&action=edit`);
//   const handleCreate = () => router.push(`${basePath}/create`);
//   const handleCancel = () => router.back();
//   const handleRefresh = () => router.refresh();

//   // 📌 CRUD handlers
//   const handleSoftDelete = (id: string | number) => {
//     if (!softDeleteAlias) return;
//     softDeleteRequest.submitForm({ id, is_deleted: true, is_active: false });
//   };

//   const handleRestore = (id: string | number) => {
//     if (!restoreAlias) return;
//     restoreRequest.submitForm({ id, is_deleted: false, is_active: true });
//   };

//   const handleActivate = (id: string | number) => {
//     if (!activateAlias) return;
//     activateRequest.submitForm({ id, is_active: true });
//   };

//   const handleDeactivate = (id: string | number) => {
//     if (!deactivateAlias) return;
//     deactivateRequest.submitForm({ id, is_active: false });
//   };

//   return {
//     handleView,
//     handleEdit,
//     handleCreate,
//     handleCancel,
//     handleRefresh,
//     handleSoftDelete,
//     handleRestore,
//     handleActivate,
//     handleDeactivate,
//   };
// }


// lib/hooks/useCrudActions.ts
'use client';

import { toast } from 'sonner';
import { useFormRequest } from './useFormRequest';

type CrudOptions = {
  onSuccessRefresh?: () => void;
};

export function useCrudActions(options?: CrudOptions) {
  const { onSuccessRefresh } = options || {};

  const withFeedback = (successMsg: string, errorMsg: string, cb?: () => void) => ({
    onSuccess: () => {
      toast.success(successMsg);
      cb?.();
    },
    onError: () => {
      toast.error(errorMsg);
    },
  });

  const createRequest = (alias: string, success: string, error: string) =>
    useFormRequest({
      alias,
      ...withFeedback(success, error, onSuccessRefresh),
    });

  const submit = (alias: string, success: string, error: string, data: any) => {
    const request = createRequest(alias, success, error);
    request.submitForm(data);
  };

  return { submit };
}



// export function createFetcher(alias: string, onSuccess?: (res: any) => void, onError?: (err: any) => void) {
//   return useFormRequest({
//     alias,
//     onSuccess,
//     onError: (err: any) => {
//       onError?.(err);
//     },
//   }).submitForm;
// }

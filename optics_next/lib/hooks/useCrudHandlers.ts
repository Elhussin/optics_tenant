// lib/hooks/useCrudHandlers.ts
'use client';

import { useRouter } from 'next/navigation';

export function useCrudHandlers(basePath: string) {
  const router = useRouter();

  const handleView = (id: string) => {
    router.push(`${basePath}/${id}/view`);
  };

  const handleEdit = (id: string) => {
    router.push(`${basePath}/${id}/edit`);
  };

  const handleCreate = () => {
    router.push(`${basePath}/create`);
  };

//   const handleDelete = (
//     id: string | number,
//     submitDelete: (payload: any) => void,
//     refetchFn?: () => void
//   ) => {
//     if (confirm('Are you sure you want to delete this item?')) {
//       submitDelete({ id });
//       if (refetchFn) {
//         // NOTE: You may want to wait until `onSuccess` triggers instead of here
//         // This depends on useFormRequest internal behavior
//         // So better to call refetchFn inside onSuccess callback
//       }
//     }
//   };

  return {
    handleView,
    handleEdit,
    handleCreate,

  };
}

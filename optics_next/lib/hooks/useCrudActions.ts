
'use client';

import { toast } from 'sonner';
import { useFormRequest } from './useFormRequest';

type CrudOptions = {
  onSuccessRefresh?: () => void;
};

/**
 * Custom React hook for handling CRUD actions with feedback messages.
 *
 * @remarks
 * This hook simplifies submitting CRUD requests and provides automatic success/error toast notifications.
 * You can optionally provide an `onSuccessRefresh` callback to refresh data after a successful operation.
 *
 * @param options - Optional configuration for CRUD actions.
 * @param options.onSuccessRefresh - Callback to execute after a successful request (e.g., refresh data).
 *
 * @returns An object containing the `submit` function for performing CRUD requests.
 *
 * @example
 * ```tsx
 * const crud = useCrudActions({ onSuccessRefresh: () => routing.refresh() });
 *
 * crud.submit(
 *   'softDeleteAlias',          // The alias for the request
 *   'Item deleted',             // Success message
 *   'Failed to delete',         // Error message
 *   { id: page.id, is_deleted: true } // Dynamic request data
 * );
 * ```
 *
 * @hint
 * Use this hook to centralize CRUD operations and feedback handling in your components.
 */
// export function useCrudActions(options?: CrudOptions) {
//   const { onSuccessRefresh } = options || {};

//   const withFeedback = (successMsg: string, errorMsg: string, cb?: () => void) => ({
//     onSuccess: () => {
//       toast.success(successMsg);
//       cb?.();
      
//     },
//     onError: () => {
//       toast.error(errorMsg);
//     },
//   });

//   const createRequest = (alias: string, success: string, error: string) =>
//     useFormRequest({
//       alias,
//       ...withFeedback(success, error, onSuccessRefresh),
//     });

//   const submit = (alias: string, success: string, error: string, data: any) => {
//     const request = createRequest(alias, success, error);
//     request.submitForm(data);
//   };

//   return { submit };
// }
//  function useCreateRequest() { const formRequest = useFormRequest(); return formRequest; }

// export function fetchData(alias: string, onSuccess?: (res: any) => void, onError?: (err: any) => void) {
  
//   return useFormRequest({
//     alias,
//     onSuccess,
//     onError: (err: any) => {
//       onError?.(err);
//     },
//   }).submitForm;
// }


export function useFetchData(alias: string, onSuccess?: (res: any) => void, onError?: (err: any) => void) {
  const formRequest = useFormRequest({
    alias,
    onSuccess,
    onError: (err: any) => {
      onError?.(err);
    },
  });

  const submitForm = (data?: any) => formRequest.submitForm(data);

  return { submitForm, reset: formRequest.reset, data: formRequest.data };
}

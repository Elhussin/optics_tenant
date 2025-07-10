import { toast } from 'react-toastify';
import { useFormRequest } from '../lib/hooks/useFormRequest';

// أنواع العمليات المختلفة
export type ApiOperation = 'create' | 'read' | 'update' | 'delete' | 'patch';

// رسائل افتراضية لكل عملية
const defaultMessages: Record<ApiOperation, { success: string; error: string }> = {
  create: {
    success: "Item created successfully",
    error: "Failed to create item"
  },
  read: {
    success: "Data loaded successfully",
    error: "Failed to load data"
  },
  update: {
    success: "Item updated successfully",
    error: "Failed to update item"
  },
  delete: {
    success: "Item deleted successfully",
    error: "Failed to delete item"
  },
  patch: {
    success: "Item modified successfully",
    error: "Failed to modify item"
  }
};

interface UseApiRequestProps {
  alias: string;
  operation: ApiOperation;
  successMessage?: string;
  errorMessage?: string;
  showToast?: boolean;
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
}

export function useApiRequest({
  alias,
  operation,
  successMessage,
  errorMessage,
  showToast = true,
  onSuccess,
  onError
}: UseApiRequestProps) {
  const defaultMsg = defaultMessages[operation];
  
  const { submitForm, isLoading } = useFormRequest({
    alias,
    onSuccess: (response) => {
      if (showToast && (successMessage || defaultMsg.success)) {
        toast.success(successMessage || defaultMsg.success);
      }
      onSuccess?.(response);
    },
    onError: (error) => {
      if (showToast && (errorMessage || defaultMsg.error)) {
        toast.error(errorMessage || defaultMsg.error);
      }
      onError?.(error);
    }
  });

  const execute = async (data?: any) => {
    return await submitForm(data);
  };

  return { 
    execute, 
    isLoading,
    // أسماء مختلفة حسب العملية للوضوح
    ...(operation === 'create' && { create: execute }),
    ...(operation === 'read' && { fetch: execute }),
    ...(operation === 'update' && { update: execute }),
    ...(operation === 'delete' && { deleteItem: execute }),
    ...(operation === 'patch' && { patch: execute })
  };
}

// ===============================
// Specialized Hooks للعمليات الشائعة
// ===============================

// هوك للإنشاء
export function useCreateRequest(alias: string, options?: Partial<UseApiRequestProps>) {
  return useApiRequest({
    alias,
    operation: 'create',
    ...options
  });
}

// هوك للقراءة
export function useReadRequest(alias: string, options?: Partial<UseApiRequestProps>) {
  return useApiRequest({
    alias,
    operation: 'read',
    ...options
  });
}

// هوك للتحديث
export function useUpdateRequest(alias: string, options?: Partial<UseApiRequestProps>) {
  return useApiRequest({
    alias,
    operation: 'update',
    ...options
  });
}

// هوك للحذف
export function useDeleteRequest(alias: string, options?: Partial<UseApiRequestProps>) {
  return useApiRequest({
    alias,
    operation: 'delete',
    ...options
  });
}

// هوك للتعديل الجزئي
export function usePatchRequest(alias: string, options?: Partial<UseApiRequestProps>) {
  return useApiRequest({
    alias,
    operation: 'patch',
    ...options
  });
}

// ===============================
// Resource-specific Hooks
// ===============================

// مثال لهوكس متخصصة للمستخدمين
export const useUserOperations = () => ({
  create: useCreateRequest("users_users_store", {
    successMessage: "User created successfully",
    errorMessage: "Failed to create user"
  }),
  
  update: useUpdateRequest("users_users_update", {
    successMessage: "User updated successfully",
    errorMessage: "Failed to update user"
  }),
  
  delete: useDeleteRequest("users_users_destroy", {
    successMessage: "User deleted successfully",
    errorMessage: "Failed to delete user"
  }),
  
  fetch: useReadRequest("users_users_show", {
    showToast: false // عدم إظهار toast للقراءة
  })
});

// ===============================
// أمثلة للاستخدام
// ===============================

// الاستخدام العام
function GenericExample() {
  const { execute, isLoading } = useApiRequest({
    alias: "products_products_store",
    operation: 'create',
    successMessage: "Product created!",
    onSuccess: (response) => {
      console.log('Product created:', response);
    }
  });

  const handleSubmit = async (productData: any) => {
    await execute(productData);
  };

  return null;
}

// الاستخدام المتخصص
function UserManagement() {
  const { create, update, deleteItem, fetch } = useUserOperations();

  const handleCreateUser = async (userData: any) => {
    const result = await create.execute(userData);
    if (result.success) {
      // إعادة تحميل قائمة المستخدمين
      refetchUsers();
    }
  };

  const handleUpdateUser = async (userId: string, userData: any) => {
    await update.execute({ id: userId, ...userData });
  };

  const handleDeleteUser = async (userId: string) => {
    await deleteItem.execute({ id: userId });
  };

  const handleFetchUser = async (userId: string) => {
    const user = await fetch.execute({ id: userId });
    return user;
  };

  return null;
}

// الاستخدام المبسط
function SimpleExample() {
  const { create, isLoading } = useCreateRequest("posts_posts_store");
  const { deleteItem } = useDeleteRequest("posts_posts_destroy");

  const handleCreate = async (postData: any) => {
    await create(postData);
  };

  const handleDelete = async (postId: string) => {
    await deleteItem({ id: postId });
  };

  return null;
}
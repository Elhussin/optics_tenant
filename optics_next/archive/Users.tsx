import { useFormRequest } from "@/lib/hooks/useFormRequest";

// مثال على حذف مستخدم
export function useDeleteUser() {
  const { submitForm, isLoading } = useFormRequest({
    alias: "users_users_destroy",
    onSuccess: (response) => {
      console.log("User deleted successfully:", response);
      // يمكنك إضافة منطق إضافي هنا مثل إعادة تحديث القائمة
    },
    onError: (error) => {
      console.error("Error deleting user:", error);
    }
  });

  const deleteUser = async (userId: string | number) => {
    // تمرير الـ ID كـ parameter
    return await submitForm({ id: userId });
  };

  return { deleteUser, isLoading };
}


export function UserList() {
  const { deleteUser, isLoading } = useDeleteUser();

  const handleDelete = async (userId: string) => {
    const result = await deleteUser(userId);
    if (result.success) {
      // نجح الحذف
      console.log("User deleted successfully");
    } else {
      // فشل الحذف
      console.error("Failed to delete user");
    }
  };

  return (
    <div>
      <button 
        onClick={() => handleDelete("123")} 
        disabled={isLoading}
      >
        {isLoading ? "Deleting..." : "Delete User"}
      </button>
    </div>
  );
}

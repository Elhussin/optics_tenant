'use client'

import { useFormRequest } from "@/lib/hooks/useFormRequest";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCrudHandlers } from '@/lib/hooks/useCrudHandlers';
import { toast } from 'sonner';
import ActionButtons from '@/components/ui/ActionButtons';
import { useParams } from 'next/navigation';
export default function UserDetail() {
    const params = useParams();
    const { userId } = params;
    const router = useRouter();
    const [user, setUser] = useState<any | null>(null);

    const {
        handleView,
        handleEdit,
        handleCreate,
        handleSoftDelete,
        handleRestore,
        handleHardDelete,
      } = useCrudHandlers('/users', {
        softDeleteAlias: 'users_users_partial_update',
        restoreAlias: 'users_users_partial_update',
        hardDeleteAlias: 'users_users_destroy', // DELETE /api/users/{id}/
        // onSuccessRefresh: user.refetch,
      });

      
    const fetchUser = useFormRequest({
        alias: "users_users_retrieve",
        onSuccess: (res) => {
            console.log('User loaded:', res);
            setUser(res);

        },
        onError: (err) => {
            console.error('Error loading user:', err);
        }
    });

    useEffect(() => {
        if (userId) {
            fetchUser.submitForm({ id: userId });
        }
    }, [userId]); // ✅ استدعاء مرة واحدة فقط عند تغير userId

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">User Details</h1>
                <button
                    onClick={() => router.push('/users')}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                >
                    Back to Users
                </button>
            </div>

            {fetchUser.isLoading ? (
                <div className="text-center py-8">Loading user details...</div>
            ) : user ? (
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold">Basic Information</h3>
                            <div className="mt-2">
                                <p className="text-gray-600">Username: {user.username}</p>
                                <p className="text-gray-600">Full Name: {user.first_name} {user.last_name}</p>
                                <p className="text-gray-600">Email: {user.email}</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">Role & Permissions</h3>
                            <div className="mt-2">
                                <p className="text-gray-600">Role: {user.role}</p>
                                <p className="text-gray-600">Status: {user.is_active ? 'Active' : 'Inactive'}</p>
                                {user.is_staff && <p className="text-gray-600">Staff Member</p>}
                                {user.is_superuser && <p className="text-gray-600">Superuser</p>}
                            </div>
                        </div>
                    </div>
                                {/* <div className="btn-card">
                                  <ActionButtons
                                    onView={() => handleView(user.id)}
                                    onEdit={() => handleUpdate(user.id)}
                                    onDelete={() => handleDelete(user.id)}
                                  />
                                </div> */}
                </div>
            ) : (
                <div className="text-center py-8 text-red-500">
                    Error loading user details
                </div>
            )}
        </div>
    );
}

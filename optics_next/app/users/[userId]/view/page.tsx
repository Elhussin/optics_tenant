'use client'

import React, { useEffect } from "react";
import { useFormRequest } from "@/lib/hooks/useFormRequest";
import { useRouter } from 'next/navigation';

export default function UserDetail(params: { userId: string }) {
    const { userId } = params;
    const router = useRouter();
    const fetchUser = useFormRequest({ 
        alias: "users_users_retrieve", 
        onSuccess: (res) => { 
            s
            console.log('User loaded:', res); 
        }, 
        onError: (err) => { 
            console.error('Error loading user:', err);
        }
    });

    // Fetch user data when userId changes
    useEffect(() => {
        if (userId) {
            fetchUser.submitForm({ id: userId });
            console.log('User ID:', userId);
        }
    }, [userId]);

    // ... rest of your component


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
            ) : fetchUser.data ? (
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold">Basic Information</h3>
                            <div className="mt-2">
                                <p className="text-gray-600">Username: {fetchUser.data.username}</p>
                                <p className="text-gray-600">Full Name: {fetchUser.data.first_name} {fetchUser.data.last_name}</p>
                                <p className="text-gray-600">Email: {fetchUser.data.email}</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">Role & Permissions</h3>
                            <div className="mt-2">
                                <p className="text-gray-600">Role: {fetchUser.data.role}</p>
                                <p className="text-gray-600">Status: {fetchUser.data.is_active ? 'Active' : 'Inactive'}</p>
                                {fetchUser.data.is_staff && <p className="text-gray-600">Staff Member</p>}
                                {fetchUser.data.is_superuser && <p className="text-gray-600">Superuser</p>}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-8 text-red-500">
                    Error loading user details
                </div>
            )}
        </div>
    );
}
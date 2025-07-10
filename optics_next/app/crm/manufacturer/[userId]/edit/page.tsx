'use client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import CreateUserForm from '@/components/forms/UserForm';
import { api } from "@/lib/api/axios";
import { useFormRequest } from '@/lib/hooks/useFormRequest';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { GeneratedFormComponent } from '@/components/GeneratedFormComponent';

export default function ManufacturerEditPage() {
  const params = useParams();
  const userId = params.userId; // or params['userId']

  const [defaultValues, setDefaultValues] = useState<any>(null);
  const router = useRouter();

    const fetchUser = useFormRequest({
        alias: "manufacturer_manufacturers_retrieve",
        onSuccess: (res) => {
            console.log('User loaded:', res);
            setDefaultValues(res);

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

  
  if (!defaultValues) return <p>Loading...</p>;
    return (
        <div>
            <h1>Orders</h1>
            {GeneratedFormComponent({
                schemaName: 'Manufacturer',
                alias: 'manufacturer_manufacturers_partial_update',
                onSuccess: (res) => {
                    console.log(res);
                },
                onCancel: () => {
                    console.log('cancel');
                },
                className: 'w-full',
                submitText: 'Save',
                showCancelButton: true,
            })}
        </div>
    );
}

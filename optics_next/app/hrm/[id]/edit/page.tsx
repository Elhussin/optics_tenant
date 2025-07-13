'use client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useFormRequest } from '@/lib/hooks/useFormRequest';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import DynamicFormGenerator from '@/components/generate/DynamicFormGenerator';
import Button from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';
export default function CustomerEditPage() {
    const params = useParams();
    const id = params.id;

    const [defaultValues, setDefaultValues] = useState<any>(null);
    const router = useRouter();

    const fetchUser = useFormRequest({
        alias: "crm_customers_retrieve",
        onSuccess: (res) => {
            console.log('User loaded:', res);
            setDefaultValues(res);

        },
        onError: (err) => {
            console.error('Error loading user:', err);
        }
    });

    useEffect(() => {
        if (id) {
            fetchUser.submitForm({ id: id });
        }
    }, [id]);


    if (!defaultValues) return <p>Loading...</p>;
    return (
        <>
            <div className="main-header">
                <h2 className="title-1">Edit Customer</h2>
                <Button
                    label="Back"
                    onClick={() => router.back()}
                    variant="primary"
                    icon={<ArrowLeft size={16} />}
                    className="md:mt-0 mt-4"
                />
            </div>
            <DynamicFormGenerator
                schemaName="Customer"
                alias="crm_customers_partial_update"
                onSubmit={(data) => console.log(data)}
                onSuccess={() => {
                    toast.success('Customer updated successfully');
                }}
                onCancel={() => {
                    console.log('cancel');
                }}
                className="w-full flex flex-col col-span-2 gap-4"
                submitText="Update"
                showCancelButton={true}
                defaultValues={defaultValues}
                mode="edit"
            />
        </>
    );
}


'use client';
import { toast } from 'sonner';
import { Loading4 } from '@/components/ui/loding';
import DynamicFormGenerator from '@/components/generate/DynamicFormGenerator';
import { useParamValue } from '@/lib/hooks/useParamValue';

export default function CustomerEditPage() {
    const id= useParamValue("id");

    if(!id){
        return <Loading4 />
    }
 
    return (
            <DynamicFormGenerator
                schemaName="Customer"
                id={id}
                alias="crm_customers_partial_update"
                onSuccess={() => {toast.success('Customer updated successfully');}}
                mode="edit"
                submitText="Update"
            />
    );
}


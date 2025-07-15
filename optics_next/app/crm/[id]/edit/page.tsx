'use client';
import { toast } from 'sonner';
import { BackButton } from '@/components/ui/button/ActionButtons';
import { Loading4 } from '@/components/ui/button/loding';
import DynamicFormGenerator from '@/components/generate/DynamicFormGenerator';
import { useParamValue } from '@/lib/hooks/useParamValue';

export default function CustomerEditPage() {
    const id= useParamValue("id");

    if(!id){
        return <Loading4 />
    }
 
    return (
        <>
            <div className="main-header">
                <h2 className="title-1">Edit Customer</h2>
                <BackButton />
            </div>
            <DynamicFormGenerator
                schemaName="Customer"
                id={id}
                alias="crm_customers_partial_update"
                onSuccess={() => {toast.success('Customer updated successfully');}}
                mode="edit"
                submitText="Update"
    
            />
        </>
    );
}


'use client';
import { toast } from 'sonner';
import { BackButton } from '@/components/ui/buttons/ActionButtons';
import { Loading4 } from '@/components/ui/loding';
import DynamicFormGenerator from '@/components/generate/DynamicFormGenerator';
import { useParamValue } from '@/lib/hooks/useParamValue';

export default function DepartmentEditPage() {
    const id= useParamValue("id");

    if(!id){
        return <Loading4 />
    }
 
    return (
            <DynamicFormGenerator
                schemaName="Branch"
                id={id}
                alias="branches_branches_partial_update"
                onSuccess={() => {toast.success('Branch updated successfully');}}
                mode="edit"
                submitText="Update"
    
            />

    );
}


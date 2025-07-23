'use client';
import { toast } from 'sonner';
import { Loading4 } from '@/components/ui/loding';
import DynamicFormGenerator from '@/components/generate/DynamicFormGenerator';
import { useParamValue } from '@/lib/hooks/useParamValue';

export default function EmployeeEditPage() {
    const id= useParamValue("id");

    if(!id){
        return <Loading4 />
    }
 
    return (
            <DynamicFormGenerator
                schemaName="Employee"
                id={id}
                alias="hrm_employees_partial_update"
                onSuccess={() => {toast.success('Employee updated successfully');}}
                mode="edit"
                submitText="Update"
                />
    
    );
}


'use client';
import { toast } from 'sonner';
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
                schemaName="Department"
                id={id}
                alias="hrm_departments_partial_update"
                onSuccess={() => {toast.success('Department updated successfully');}}
                mode="edit"
                submitText="Update"
            />
    );
}


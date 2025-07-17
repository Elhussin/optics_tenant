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
        <>
            <div className="main-header">
                <h2 className="title-1">Edit Department</h2>
                {/* <BackButton /> */}
            </div>
            <DynamicFormGenerator
                schemaName="Department"
                id={id}
                alias="hrm_departments_partial_update"
                onSuccess={() => {toast.success('Department updated successfully');}}
                mode="edit"
                submitText="Update"
    
            />
        </>
    );
}


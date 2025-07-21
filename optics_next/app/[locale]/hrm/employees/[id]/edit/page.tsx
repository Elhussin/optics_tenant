'use client';
import { toast } from 'sonner';
import { BackButton } from '@/components/ui/buttons/ActionButtons';
import { Loading4 } from '@/components/ui/loding';
import DynamicFormGenerator from '@/components/generate/DynamicFormGenerator';
import { useParamValue } from '@/lib/hooks/useParamValue';

export default function EmployeeEditPage() {
    const id= useParamValue("id");

    if(!id){
        return <Loading4 />
    }
 
    return (
        <>
            <div className="main-header">
                <h2 className="title-1">Edit Employee</h2>
                <BackButton />
            </div>
            <DynamicFormGenerator
                schemaName="Employee"
                id={id}
                alias="hrm_employees_partial_update"
                onSuccess={() => {toast.success('Employee updated successfully');}}
                mode="edit"
                submitText="Update"
    
            />
        </>
    );
}


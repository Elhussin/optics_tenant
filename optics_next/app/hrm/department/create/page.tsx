'use client';
import { toast } from 'sonner';
import DynamicFormGenerator from '@/components/generate/DynamicFormGenerator';
import { BackButton } from '@/components/ui/button/ActionButtons';

export default function CreateCustomerPage() {

  return (
    <>
      <div className="main-header">
        <h2 className="title-1">Add Department</h2>
        <BackButton />
      </div>
      <DynamicFormGenerator
        schemaName="Department"
        alias="hrm_departments_create"
        onSuccess={() => toast.success('Department created successfully')}
        submitText="Add Department"
      />
    </>

  );
}

'use client';
import { toast } from 'sonner';
import DynamicFormGenerator from '@/components/generate/DynamicFormGenerator';


export default function CreateCustomerPage() {

  return (

      <DynamicFormGenerator
        schemaName="Department"
        alias="hrm_departments_create"
        submitText="Add Department"
        successMessage="Department created successfully"
        errorMessage="Failed to create department"
        title='Add Supplier'
      />
  );
}

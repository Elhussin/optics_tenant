'use client';
import { toast } from 'sonner';
import DynamicFormGenerator from '@/components/generate/DynamicFormGenerator';

export default function CreateCustomerPage() {

  return (

      <DynamicFormGenerator
        schemaName="Department"
        alias="hrm_departments_create"
        onSuccess={() => toast.success('Department created successfully')}
        submitText="Add Department"

      />

  );
}

'use client';
import { toast } from 'sonner';
import DynamicFormGenerator from '@/components/generate/DynamicFormGenerator';

export default function CreateBranchPage() {

  return (
      <DynamicFormGenerator
        schemaName="Branch"
        alias="branches_branches_create"
        onSuccess={() => toast.success('Branch created successfully')}
        submitText="Add Branch"

      />

  );
}

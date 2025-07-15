'use client';
import { toast } from 'sonner';
import DynamicFormGenerator from '@/components/generate/DynamicFormGenerator';
import { BackButton } from '@/components/ui/button/ActionButtons';

export default function CreateEmployeePage() {

  return (
    <>
      <div className="main-header">
        <h2 className="title-1">Add Employee</h2>
        <BackButton />
      </div>
      <DynamicFormGenerator
        schemaName="EmployeeRequest"
        alias="hrm_employees_create"
        onSuccess={() => toast.success('Employee created successfully')}
        submitText="Add Employee"
      />
    </>

  );
}
// hrm_employees_create
// hrm_employees_retrieve
// Employee EmployeeRequest PatchedEmployeeRequest
// hrm_employees_update
// hrm_employees_partial_update,hrm_employees_destroy
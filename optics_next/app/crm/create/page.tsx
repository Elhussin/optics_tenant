'use client';
import DynamicFormGenerator from '@/components/generate/DynamicFormGenerator';
import { toast } from 'sonner';
export default function CreateUserPage() {
  return (
    <DynamicFormGenerator
    schemaName="Customer"
    alias="crm_customers_create"
    onSuccess={() => toast.success('Customer created successfully')}
      onSubmit={(data) => console.log(data)}
      className="w-full"
      submitText="Save"
      showCancelButton={true}
    />
  );
}


// crm_customers_list
// crm_customers_create
// crm_customers_retrieve
// crm_customers_update
// crm_customers_partial_update
// crm_customers_destroy
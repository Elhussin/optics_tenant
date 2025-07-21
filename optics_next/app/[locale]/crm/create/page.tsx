'use client';
import { toast } from 'sonner';
import DynamicFormGenerator from '@/components/generate/DynamicFormGenerator';
import { BackButton } from '@/components/ui/buttons/ActionButtons';

export default function CreateCustomerPage() {

  return (
    <>
      <div className="main-header">
        <h2 className="title-1">Add Customer</h2>
        <BackButton />
      </div>
      <DynamicFormGenerator
        schemaName="Customer"
        alias="crm_customers_create"
        onSuccess={() => toast.success('Customer created successfully')}
        submitText="Add Customer"
      />
    </>

  );
}

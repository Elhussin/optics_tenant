'use client';
import { toast } from 'sonner';
import DynamicFormGenerator from '@/components/generate/DynamicFormGenerator';
import { BackButton } from '@/components/ui/button/ActionButtons';

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
        onSubmit={(data) => console.log(data)}
        submitText="Add Customer"
      />
    </>

  );
}

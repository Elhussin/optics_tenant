'use client';
import { toast } from 'sonner';
import DynamicFormGenerator from '@/components/generate/DynamicFormGenerator';
import { BackButton } from '@/components/ui/buttons/Button';

export default function CreateCustomerPage() {

  return (
      <DynamicFormGenerator
        schemaName="Customer"
        alias="crm_customers_create"
        onSuccess={() => toast.success('Customer created successfully')}
        submitText="Add Customer"
      />

  );
}

'use client';
import DynamicFormGenerator from '@/components/generate/DynamicFormGenerator';
import { toast } from 'sonner';
import Button from '@/components/ui/button/Button';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
export default function CreateUserPage() {
  const router = useRouter();
  return (
    <>

      <div className="main-header">
        <h2 className="title-1">Create Customer</h2>
        <Button
          label="Back"
          onClick={() => router.back()}
          variant="primary"
          icon={<ArrowLeft size={16} />}
          className="md:mt-0 mt-4"
        />
      </div>
      <DynamicFormGenerator

        schemaName="Customer"
        alias="crm_customers_create"
        onSuccess={() => toast.success('Customer created successfully')}
        onSubmit={(data) => console.log(data)}
        className="w-full"
        submitText="Save"
        showCancelButton={true}
      />
    </>
  );
}


// crm_customers_list
// crm_customers_create
// crm_customers_retrieve
// crm_customers_update
// crm_customers_partial_update
// crm_customers_destroy
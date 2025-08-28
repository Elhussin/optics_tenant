'use client';
import { toast } from 'sonner';
import DynamicFormGenerator from '@/components/generate/DynamicFormGenerator';


export default function CreateSubscriptionPlanPage() {

  return (
      <DynamicFormGenerator
        schemaName="SubscriptionPlan"
        alias="tenants_subscription_plans_create"
        onSuccess={() => toast.success('Subscription Plan created successfully')}
        submitText="Add Subscription Plan"
      />

  );
}

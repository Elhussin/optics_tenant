'use client';
import { toast } from 'sonner';
import { Loading4 } from '@/components/ui/loding';
import DynamicFormGenerator from '@/components/generate/DynamicFormGenerator';
import { useParamValue } from '@/lib/hooks/useParamValue';

export default function SubscriptionPlanEditPage() {
    const id= useParamValue("id");

    if(!id){
        return <Loading4 />
    }
 
    return (
            <DynamicFormGenerator
                schemaName="SubscriptionPlan"
                id={id}
                alias="tenants_subscription_plans_partial_update"
                onSuccess={() => {toast.success('Subscription Plan updated successfully');}}
                mode="edit"
                submitText="Update"
            />
    );
}


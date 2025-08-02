'use client';
import ViewDetailsCard from '@/components/view/ViewDetailsCard';
import { generateViewFieldsWithLabels } from '@/lib/utils/generateViewFields';
import { schemas } from '@/lib/api/zodClient'
import { useParamValue } from '@/lib/hooks/useParamValue';
import { Loading4 } from '@/components/ui/loding';

const fields = generateViewFieldsWithLabels(schemas.SubscriptionPlan, {
  hiddenFields: ["id", "password"],
  fieldLabels: {
    name: "Subscription Plan Name",
    price: "Subscription Plan Price",
    description: "Subscription Plan Description",
    duration_days: "Subscription Plan Duration Days",
    max_users: "Subscription Plan Max Users",
    max_branches: "Subscription Plan Max Branches",
    max_products: "Subscription Plan Max Products",
    currency: "Subscription Plan Currency",
    is_active: "Subscription Plan Is Active",
  },
});


export default function SubscriptionPlanDetailsPage() {
  const id = useParamValue("id");
     if(!id){
         return <Loading4 />}
     
  return (
    <ViewDetailsCard
      id={id}
      fields={fields}
      title="Subscription Plan Details"
      alias="tenants_subscription_plans_retrieve"
      restoreAlias="tenants_subscription_plans_partial_update"
      hardDeleteAlias="tenants_subscription_plans_destroy"
      path="/tenants/subscription-plans"
    />
  );
}

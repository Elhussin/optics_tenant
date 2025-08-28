import ViewCard from '@/components/view/ViewCard';
export default function SubscriptionPlanPage() {
  return (
    <ViewCard
      alias="tenants_subscription_plans_list"
      restoreAlias="tenants_subscription_plans_partial_update"
      hardDeleteAlias="tenants_subscription_plans_destroy"
      path="/tenants/subscription-plans"
      viewFields={["name", "price", "description", "duration_days", "max_users", "max_branches", "max_products", "currency", "is_active"]}
      title="Subscription Plans"
    />
  );
}


'use client';
import ViewCard from '@/components/view/ViewCard';


export default function CustomerPage() {
  return (
    <ViewCard
      alias="crm_customers_list"
      restoreAlias="crm_customers_partial_update"
      hardDeleteAlias="crm_customers_destroy"
      path="/crm"
      viewFields={["first_name", "last_name", "email", "phone", "identification_number"]}
      title="Customers List"
    />
  );
}

'use client';
import { GeneratedFormComponent } from '@/components/GeneratedFormComponent';
import ViewCard from '@/components/ViewCard';

export default function ManufacturerPage() {
    return (
<ViewCard
  alias="crm_customers_list"
  fieldsAlias="crm_customers_list"
  restoreAlias="crm_customers_restore"
  hardDeleteAlias="crm_customers_destroy"
  path="/crm"
  viewFields={["name", "email", "phone"]}
  title="Customers List"
/>
    );
}



// crm_customers_list
// crm_customers_create
// crm_customers_retrieve
// crm_customers_update
// crm_customers_partial_update
// crm_customers_destroy
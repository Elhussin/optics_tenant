'use client';
import ViewDetailsCard from '@/components/view/ViewDetailsCard';
import { generateViewFieldsWithLabels } from '@/lib/utils/generateViewFields';
import { schemas } from '@/lib/api/zodClient'
import { useParamValue } from '@/lib/hooks/useParamValue';
import { Loading4 } from '@/components/ui/loding';

const fields = generateViewFieldsWithLabels(schemas.Customer, {
  hiddenFields: ["id", "password"],
  fieldLabels: {
    email: "Customer Email",
    first_name: "Customer First Name",
    last_name: "Customer Last Name",
    identification_number: "Customer Identification Number",
    phone: "Customer Phone",
  },
});


export default function CustomerDetailsPage() {
  const id = useParamValue("id");
     if(!id){
         return <Loading4 />}
     
  return (
    <ViewDetailsCard
      id={id}
      fields={fields}
      title="Customer Details"
      alias="crm_customers_retrieve"
      restoreAlias="crm_customers_partial_update"
      hardDeleteAlias="crm_customers_destroy"
      path="/crm"
    />
  );
}

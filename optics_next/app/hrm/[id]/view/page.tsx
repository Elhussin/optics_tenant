import { schemas } from "@/lib/api/zodClient";
import { generateViewFieldsWithLabels } from "@/lib/utils/generateViewFieldsFromSchema";
import ViewDetailsCard from "@/components/ViewDetailsCard";

export default function UserDetailsPage({ user }: { user: any }) {
  const schema = schemas.User;

  const fields = generateViewFieldsWithLabels(schema, {
    hiddenFields: ["id", "password"],
    fieldLabels: {
      email: "Customer Email",
      first_name: "Customer First Name",
      last_name: "Customer Last Name",
    },
  });

  return (
    <ViewDetailsCard
      item={user}
      fields={fields}
      title="Customer Details"
      alias="crm_customers_retrieve"
      fieldsAlias="crm_customers_retrieve"
      restoreAlias="crm_customers_restore"
      hardDeleteAlias="crm_customers_destroy"
      path="/crm"
    />
  );
}

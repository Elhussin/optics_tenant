import { schemas } from "@/lib/api/zodClient";
import { generateViewFieldsWithLabels } from "@/lib/utils/generateViewFields";
import ViewDetailsCard from "@/components/view/ViewDetailsCard";

export default function UserDetailsPage({ user }: { user: any }) {
  const schema = schemas.User;

  const fields = generateViewFieldsWithLabels(schema, {
    hiddenFields: ["id", "password"],
    fieldLabels: {
      email: "البريد الإلكتروني",
      first_name: "الاسم الأول",
      last_name: "اسم العائلة",
    },
  });

  return (
    <ViewDetailsCard
      item={user}
      fields={fields}
      title="تفاصيل المستخدم"
    />
  );
}

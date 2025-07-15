'use client';
import ViewDetailsCard from '@/components/view/ViewDetailsCard';
import { generateViewFieldsWithLabels } from '@/lib/utils/generateViewFields';
import { schemas } from '@/lib/api/zodClient'
import { useParamValue } from '@/lib/hooks/useParamValue';
import { Loading4 } from '@/components/ui/loding';

const fields = generateViewFieldsWithLabels(schemas.Department, {
  hiddenFields: ["id", "password"],
  fieldLabels: {
    name: "Department Name",
    location: "Department Location",
    description: "Department Description",
  },
});


export default function DepartmentDetailsPage() {
  const id = useParamValue("id");
     if(!id){
         return <Loading4 />}
     
  return (
    <ViewDetailsCard
      id={id}
      fields={fields}
      title="Department Details"
      alias="hrm_departments_retrieve"
      restoreAlias="hrm_departments_partial_update"
      hardDeleteAlias="hrm_departments_destroy"
      path="/hrm/department"
    />
  );
}

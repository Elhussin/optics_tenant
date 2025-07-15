'use client';
import ViewCard from '@/components/view/ViewCard';


export default function DepartmentPage() {
  return (
    <ViewCard
      alias="hrm_departments_list"
      fieldsAlias="hrm_departments_list"
      restoreAlias="hrm_departments_restore"
      hardDeleteAlias="hrm_departments_destroy"
      path="/hrm/department"
      viewFields={["name", "location", "description"]}
      title="Departments List"
    />
  );
}

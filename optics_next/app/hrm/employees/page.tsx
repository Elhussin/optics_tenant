'use client';
import ViewCard from '@/components/view/ViewCard';


export default function employeesPage() {
  return (
    <ViewCard
      alias="hrm_employees_list"
      fieldsAlias="hrm_employees_list"
      restoreAlias="hrm_employees_restore"
      hardDeleteAlias="hrm_employees_destroy"
      path="/hrm/employees"
      viewFields={["department", "position", "salary", "phone",]}
      title="Employees List"
    />
  );
}



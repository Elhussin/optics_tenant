'use client';
import ViewDetailsCard from '@/components/view/ViewDetailsCard';
import { generateViewFieldsWithLabels } from '@/lib/utils/generateViewFields';
import { schemas } from '@/lib/api/zodClient'
import { useParamValue } from '@/lib/hooks/useParamValue';
import { Loading4 } from '@/components/ui/loding';


// hrm_employees_create
// hrm_employees_retrieve
// Employee EmployeeRequest PatchedEmployeeRequest
// hrm_employees_update
// hrm_employees_partial_update,hrm_employees_destroy


const fields = generateViewFieldsWithLabels(schemas.Employee, {
  hiddenFields: ["id", "password"],
  fieldLabels: {
    email: "Employee Email",
    first_name: "Employee First Name",
    last_name: "Employee Last Name",
    identification_number: "Employee Identification Number",
    phone: "Employee Phone",
  },
});


export default function EmployeeDetailsPage() {
  const id = useParamValue("id");
     if(!id){
         return <Loading4 />}
     
  return (
    <ViewDetailsCard
      id={id}
      fields={fields}
      title="Employee Details"
      alias="hrm_employees_retrieve"
      restoreAlias="hrm_employees_partial_update"
      hardDeleteAlias="hrm_employees_destroy"
      path="/hrm/employees"
    />
  );
}


// hrm_employees_create
// hrm_employees_retrieve
// Employee EmployeeRequest PatchedEmployeeRequest
// hrm_employees_update
// hrm_employees_partial_update,hrm_employees_destroy
'use client';
import ViewCard from '@/components/view/ViewCard';


export default function BranchPage() {
  return (
    <ViewCard
      alias="branches_branches_list"
      restoreAlias="branches_branches_partial_update"
      hardDeleteAlias="branches_branches_destroy"
      path="/branchs/branch"
      viewFields={["name", "branch_code", "branch_type"]}
      title="Branches List"
    />
  );
}

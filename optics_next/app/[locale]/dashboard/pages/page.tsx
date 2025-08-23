"use client";

import { useSearchParams } from "next/navigation";
import {ActionButton } from "@/components/ui/buttons";
import {PageDetail} from "@/components/pages/PageDetail"
import {PagesList} from "@/components/pages/PagesList"
export default function AllPages() {

  const searchParams = useSearchParams();
  const pageSlug = searchParams.get("view"); 
  const publicPages=["about","contact","privacy","terms","faq","support","careers","blog"]
  
  return (

    <div className="space-y-6">
      <div className="flex justify-end gap-2">
       {/* create Public Page */}
    {   publicPages.map((page) => (
         <ActionButton key={page} label={`Add  ${page.charAt(0).toUpperCase() + page.slice(1)} Page`} variant="info" navigateTo={`/dashboard/pages/create?add=${page}`} />
       ))}

        
        <ActionButton label="Create Page" variant="info" navigateTo={"/dashboard/pages/create"} />

      </div>
      {pageSlug ? (
        <PageDetail pageSlug={pageSlug} />
      ) : (
        <PagesList/>
      )}
    </div>
  );
}



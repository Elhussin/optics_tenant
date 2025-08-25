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

        
        <ActionButton label="Create Page" variant="info" navigateTo={"/dashboard/pages/create"} />

      </div>
      {pageSlug ? (
        <PageDetail pageSlug={pageSlug} />
      ) : (
        <>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {   publicPages.map((page) => (
              <div className="card btn" key={page}>
                Add  
         <ActionButton key={page} label={`${page.charAt(0).toUpperCase() + page.slice(1)} `} variant=""  navigateTo={`/dashboard/pages/create?add=${page}`} />
            Page
       </div>
       ))}
          </div>
        <PagesList/>
        </>
      )}
    </div>
  );
}



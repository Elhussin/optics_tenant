"use client";

import { useSearchParams } from "next/navigation";
import { ActionButton } from "@/components/ui/buttons";
import { PageDetail } from "@/components/pages/PageDetail"
import { PagesList } from "@/components/pages/PagesList"
import { Plus } from "lucide-react";
export default function AllPages() {

  const searchParams = useSearchParams();
  const pageSlug = searchParams.get("view");
  const publicPages = ["about", "contact", "privacy", "terms", "faq", "support", "careers", "blog"]

  return (

    <div className="space-y-6">
      <div className="flex justify-end gap-2">
        {/* create Public Page */}


        <ActionButton label="Create Page" icon={<Plus size={16} />} variant="info" title="Create a new" navigateTo={"/dashboard/pages/create"} />

      </div>
      {pageSlug ? (
        <PageDetail pageSlug={pageSlug} />
      ) : (
        <>
          <h5>Public Pages </h5>
          <p>These are the publicly accessible pages on your site if your site is public.</p>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">

            {publicPages.map((page) => (
              <div className="card btn" key={page}>

                <ActionButton key={page} label={` Add ${page.charAt(0).toUpperCase() + page.slice(1)} Page `} icon={<Plus size={16} />} variant="outline" title={`Create a new ${page.charAt(0).toUpperCase() + page.slice(1)} Page`} navigateTo={`/dashboard/pages/create?add=${page}`} />

              </div>
            ))}
          </div>
          <PagesList />
        </>
      )}
    </div>
  );
}



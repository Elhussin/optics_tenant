"use client";
import React, { Suspense } from "react";
import { SectionLoading } from "@/src/shared/components/ui/Spinner";
const ViewEyeTest = React.lazy(
  () => import("@/src/features/prescription/components/ViewEyeTest"),
);
export default function ViewPrescriptionPage() {
  return (
    <Suspense
      fallback={
        <div>
          <SectionLoading />
        </div>
      }
    >
      <ViewEyeTest title="View Prescription" />
    </Suspense>
  );
}

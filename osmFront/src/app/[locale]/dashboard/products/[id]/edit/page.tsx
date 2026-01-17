"use client";

import React, { Suspense, use } from "react";
import { Loading4 } from "@/src/shared/components/ui/loding";
import { ArrowRight } from "lucide-react";
import { ActionButton } from "@/src/shared/components/ui/buttons";

const ProductEdit = React.lazy(() => import("@/src/features/products/edit"));

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProductEditPage({ params }: PageProps) {
  const { id } = use(params);
    const numericId = parseInt(id, 10);


  return (
    <div className="container mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <ActionButton
          icon={<ArrowRight size={20} />}
          variant="ghost"
          navigateTo="/dashboard/products"
          title="العودة للقائمة"
        />
        <div>
          <h1 className="text-2xl font-bold text-main">تعديل المنتج</h1>
          <p className="text-sm text-secondary">قم بتحديث بيانات المنتج</p>
        </div>
      </div>

      <Suspense fallback={<Loading4 />}>
        <ProductEdit productId={id} />
      </Suspense>
    </div>
  );
}

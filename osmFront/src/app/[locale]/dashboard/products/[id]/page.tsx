"use client";

import React, { Suspense, use } from "react";
import { Loading4 } from "@/src/shared/components/ui/loding";
import { ArrowRight } from "lucide-react";
import { ActionButton } from "@/src/shared/components/ui/buttons";

const ProductView = React.lazy(() => import("@/src/features/products/view"));

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProductViewPage({ params }: PageProps) {
  const { id } = use(params);


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
          <h1 className="text-2xl font-bold text-main">تفاصيل المنتج</h1>
          <p className="text-sm text-secondary">عرض بيانات المنتج</p>
        </div>
      </div>

      <Suspense fallback={<Loading4 />}>
        <ProductView productId={id} />
      </Suspense>
    </div>
  );
}

"use client";

import React, { Suspense, use } from "react";
import { Loading4 } from "@/src/shared/components/ui/loding";
import { ArrowRight } from "lucide-react";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { NotFound } from "@/src/shared/components/views/NotFound";
import { useRouter } from "next/navigation";

const AddVariant = React.lazy(
  () => import("@/src/features/products/variant/AddVariant")
);

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AddVariantPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const numericId = parseInt(id, 10);

  // Fetch product to get variant_type and type
  const { query, isBusy } = useApiForm({
    alias: "products_products_retrieve",
    defaultValues: { id: numericId },
    enabled: !isNaN(numericId),
  });

  const { data: product, isLoading, isError } = query;

  if (isLoading || isBusy) {
    return <Loading4 />;
  }

  if (isError || !product) {
    return <NotFound error="لم يتم العثور على المنتج" />;
  }

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <ActionButton
          icon={<ArrowRight size={20} />}
          variant="ghost"
          navigateTo={`/dashboard/products/${id}`}
          title="العودة للمنتج"
        />
        <div>
          <h1 className="text-2xl font-bold text-main">إضافة متغير جديد</h1>
          <p className="text-sm text-secondary">
            للمنتج: {product.name || `${product.brand_name} ${product.model}`}
          </p>
        </div>
      </div>

      <Suspense fallback={<Loading4 />}>
        <AddVariant
          productId={numericId}
          variantType={product.variant_type}
          productType={product.type}
          onSuccess={() => {
            router.push(`/dashboard/products/${id}`);
          }}
          onCancel={() => {
            router.push(`/dashboard/products/${id}`);
          }}
        />
      </Suspense>
    </div>
  );
}

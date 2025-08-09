// products/supplier/page.tsx
// 'use client';
import ViewCard from '@/components/view/ViewCard';


export default function SupplierPage() {
  return (
    <ViewCard
      alias="products_suppliers_list"
      restoreAlias="products_suppliers_partial_update"
      path="/products/supplier"
      viewFields={["name"]}
      title="Suppliers"
    />
  );
}


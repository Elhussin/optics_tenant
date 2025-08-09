'use client';
import ViewCard from '@/components/view/ViewCard';
import { useRouter } from '@/app/i18n/navigation';
import { CreateButton, EditButton } from '@/components/ui/buttons/Button';
import { buildFormUrl } from '@/lib/utils/buildFormUrl';

export default function SupplierPage() {
  const router = useRouter();

  return (
    <ViewCard
      alias="products_suppliers_list"
      restoreAlias="products_suppliers_partial_update"
      path="/products/supplier"
      viewFields={["name"]}
      title="Suppliers"
      createButton={
        <CreateButton
          onClick={() => router.push(buildFormUrl('supplier', 'create'))}
          label='Add Supplier'
        />
      }
      updateButton={(id: string) => (
        <EditButton
          onClick={() => router.push(buildFormUrl('supplier', 'update', { id }))}
          label='Update Supplier'
        />
      )}
    />
  );
}

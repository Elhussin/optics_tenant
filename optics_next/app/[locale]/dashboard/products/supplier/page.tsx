'use client';
import ViewCard from '@/components/view/ViewCard';
import { useRouter } from '@/app/i18n/navigation';
import { CreateButton, EditButton, ViewButton } from '@/components/ui/buttons/Button';

const goTo = (path: string, params: Record<string, string>) => {
  const router = useRouter();
  const query = new URLSearchParams(params).toString();
  router.replace(`/${path}?${query}`);
};


export default function SupplierPage() {
  return (
    <ViewCard
      alias="products_suppliers_list"
      restoreAlias="products_suppliers_partial_update"
      path="/products/supplier"
      viewFields={["name"]}
      title="Suppliers"

      createButton={
        <CreateButton
          onClick={() => goTo('dashboard/supplier', { mode: 'create' })}
          label='Add Supplier'
        />
      }
      
      updateButton={(id: string) => (
        <EditButton
          onClick={() => goTo('dashboard/supplier', { id, mode: 'edit' })}
          label='Update Supplier'
        />
      )}
      viewButton={(id: string) => (
        <ViewButton
          onClick={() => goTo('dashboard/supplier', { id, mode: 'view' })}
          label='View Supplier'
        />
      )}
    />
  );
}

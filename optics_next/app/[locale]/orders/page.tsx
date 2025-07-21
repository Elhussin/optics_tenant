'use client';
import { GeneratedFormComponent } from '@/components/GeneratedFormComponent';

export default function OrdersPage() {
    return (
        <div>
            <h1>Orders</h1>
            {GeneratedFormComponent({
                schemaName: 'Order',
                alias: 'sales_orders_create',
                onSuccess: (res) => {
                    console.log(res);
                },
                onCancel: () => {
                    console.log('cancel');
                },
                className: 'w-full',
                submitText: 'Save',
                showCancelButton: true,
                defaultValues: {
                    name: 'test',
                    email: 'test',
                    phone: 'test',
                    address: 'test',
                    city: 'test',
                    state: 'test',
                    zip: 'test',
                    country: 'test',
                    tenant_id: 'test',
                    owner_id: 'test',
                }
            })}
        </div>
    );
}

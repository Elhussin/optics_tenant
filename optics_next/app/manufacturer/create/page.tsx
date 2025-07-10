'use client';
import { GeneratedFormComponent } from '@/components/GeneratedFormComponent';

export default function ManufacturerPage() {
    return (
        <div>
            <h1>Orders</h1>
            {GeneratedFormComponent({
                schemaName: 'Manufacturer',
                alias: 'manufacturer_manufacturers_create',
                onSuccess: (res) => {
                    console.log(res);
                },
                onCancel: () => {
                    console.log('cancel');
                },
                className: 'w-full',
                submitText: 'Save',
                showCancelButton: true,
            })}
        </div>
    );
}

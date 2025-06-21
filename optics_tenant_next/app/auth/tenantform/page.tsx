'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { schemas } from '@/src/api-zod';
import { TenantService } from '@/src/api/services/TenantService'; // من التوليد السابق
import { z } from 'zod';

const tenantSchema = schemas.TenantCreate;
type TenantFormData = z.infer<typeof tenantSchema>;

export default function TenantForm() {
    const {
      register,
      handleSubmit,
      formState: { errors },
      reset,
    } = useForm<TenantFormData>({
      resolver: zodResolver(tenantSchema),
    });
  
    const onSubmit = async (data: TenantFormData) => {
      try {
        await TenantService.apiTenantsCreate(data); // أو client.post(...)
        alert('Tenant Created!');
        reset();
      } catch (error) {
        console.error(error);
        alert('Error creating tenant');
      }
    };
  
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
        <div>
          <label>Name</label>
          <input {...register('name')} className="border w-full px-2 py-1" />
          {errors.name && <p className="text-red-600">{errors.name.message}</p>}
        </div>
  
        <div>
          <label>Domain</label>
          <input {...register('domain')} className="border w-full px-2 py-1" />
          {errors.domain && <p className="text-red-600">{errors.domain.message}</p>}
        </div>
  
        <div>
          <label>Paid Until</label>
          <input type="date" {...register('paid_until')} className="border w-full px-2 py-1" />
          {errors.paid_until && <p className="text-red-600">{errors.paid_until.message}</p>}
        </div>
  
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Create Tenant
        </button>
      </form>
    );
  }
  
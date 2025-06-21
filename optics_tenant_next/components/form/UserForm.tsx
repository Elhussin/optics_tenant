// forms/UserForm.tsx
'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { schemas } from '@/src/api-zod';
import { api } from '@/src/api-zod';

const userSchema = schemas.UserRequest;
type UserFormData = z.infer<typeof userSchema>;

export default function UserForm({ defaultValues, onSuccess }: {
  defaultValues?: Partial<UserFormData>;
  onSuccess?: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues,
  });

  const onSubmit = async (data: UserFormData) => {
    try {
      if (defaultValues?.email) {
        await api.patch('/api/users/users/{id}/', data, {
          params: { id: defaultValues.email }, // أو id الحقيقي
        });
      } else {
        await api.post('/api/users/users/', data);
      }
      onSuccess?.();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      <div>
        <label>Username</label>
        <input {...register('username')} className="border w-full p-2" />
        {errors.username && <p className="text-red-500">{errors.username.message}</p>}
      </div>

      <div>
        <label>Email</label>
        <input {...register('email')} className="border w-full p-2" />
        {errors.email && <p className="text-red-500">{errors.email.message}</p>}
      </div>

      <div>
        <label>Role</label>
        <select {...register('role')} className="border w-full p-2">
          <option value="">Select...</option>
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
          <option value="viewer">Viewer</option>
        </select>
        {errors.role && <p className="text-red-500">{errors.role.message}</p>}
      </div>

      <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-4 py-2 rounded">
        {isSubmitting ? 'Saving...' : 'Submit'}
      </button>
    </form>
  );
}

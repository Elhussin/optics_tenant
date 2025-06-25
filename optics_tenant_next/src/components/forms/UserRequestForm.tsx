import { useUserRequestForm } from '@/src/lib/forms/useUserRequestForm';
import { API } from '@/src/lib/api';

export default function UserRequestForm({ defaultValues, onSuccess }: any) {
  const { register, handleSubmit, formState: { errors }, handleServerErrors } = useUserRequestForm(defaultValues);

  const onSubmit = async (data: any) => {
    try {
      console.log('Submitting user here:', data);
      await API.post('/api/users/users/', data);
      onSuccess?.();
    } catch (e: any) {
      console.log('Submitting user here:', e);
      if (e.response?.status === 400) {
        console.error('Validation error:', e.response.data);
        handleServerErrors(e.response.data);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      
  <div className="mb-4">
    
    <label htmlFor="username" className="block text-sm font-medium mb-1">username</label>
    <input id="username" type="text" {...register("username")} className="input-base" />
    {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
  </div>

  <div className="mb-4">
    
    <label htmlFor="email" className="block text-sm font-medium mb-1">email</label>
    <input id="email" type="email" {...register("email")} className="input-base" />
    {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
  </div>

  <div className="mb-4">
    
    <label htmlFor="first_name" className="block text-sm font-medium mb-1">first_name</label>
    <input id="first_name" type="text" {...register("first_name")} className="input-base" />
    {errors.first_name && <p className="text-red-500 text-sm">{errors.first_name.message}</p>}
  </div>

  <div className="mb-4">
    
    <label htmlFor="last_name" className="block text-sm font-medium mb-1">last_name</label>
    <input id="last_name" type="text" {...register("last_name")} className="input-base" />
    {errors.last_name && <p className="text-red-500 text-sm">{errors.last_name.message}</p>}
  </div>

  <div className="mb-4">
    
    <label htmlFor="is_staff" className="inline-flex items-center space-x-2">
      <input id="is_staff" type="checkbox" {...register("is_staff")} />
      <span>is_staff</span>
    </label>
    {errors.is_staff && <p className="text-red-500 text-sm">{errors.is_staff.message}</p>}
  </div>

  <div className="mb-4">
    
    <label htmlFor="role" className="block text-sm font-medium mb-1">role</label>
    <input 
      id="role" 
      list="role-list" 
      {...register("role")} 
      className="input-base"
      placeholder="Type or select..."
    />
    <datalist id="role-list">
      <option value="ADMIN">ADMIN</option>
    <option value="BRANCH_MANAGER">BRANCH_MANAGER</option>
    <option value="TECHNICIAN">TECHNICIAN</option>
    <option value="SALESPERSON">SALESPERSON</option>
    <option value="ACCOUNTANT">ACCOUNTANT</option>
    <option value="INVENTORY_MANAGER">INVENTORY_MANAGER</option>
    <option value="RECEPTIONIST">RECEPTIONIST</option>
    <option value="CRM">CRM</option>
    </datalist>
    {errors.role && <p className="text-red-500 text-sm">{errors.role.message}</p>}
  </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded ">Save</button>
    </form>
  );
}

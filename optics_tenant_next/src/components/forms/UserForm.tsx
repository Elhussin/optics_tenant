import { useUserForm } from '@/src/lib/forms/useUserForm';
import { api } from '@/src/api-zod/zodSchemas';


export default function UserRequestForm({ defaultValues, onSuccess }: any) {
  const { register, handleSubmit, formState: { errors }, handleServerErrors } = useUserForm(defaultValues);

  const onSubmit = async (data: any) => {
    try {
      await api.post('/api/YOUR_ENDPOINT/', data);
      onSuccess?.();
    } catch (e: any) {
      if (e.response?.status === 400) {
        handleServerErrors(e.response.data);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      
  <div className="mb-4">
    <label htmlFor="password" className="block text-sm font-medium mb-1 capitalize">password</label>
    <input id="password" type="text" {...register("password")} className="w-full border border-gray-300 rounded-md px-3 py-2" />
    {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
  </div>
  

  <div className="mb-4">
    <label htmlFor="last_login" className="block text-sm font-medium mb-1 capitalize">last_login</label>
    <input id="last_login" type="text" {...register("last_login")} className="w-full border border-gray-300 rounded-md px-3 py-2" />
    {errors.last_login && <p className="text-red-500 text-sm">{errors.last_login.message}</p>}
  </div>
  

  <div className="mb-4">
    <label htmlFor="is_superuser" className="block text-sm font-medium mb-1 capitalize">is_superuser</label>
    <input id="is_superuser" type="text" {...register("is_superuser")} className="w-full border border-gray-300 rounded-md px-3 py-2" />
    {errors.is_superuser && <p className="text-red-500 text-sm">{errors.is_superuser.message}</p>}
  </div>
  

  <div className="mb-4">
    <label htmlFor="username" className="block text-sm font-medium mb-1 capitalize">username</label>
    <input id="username" type="text" {...register("username")} className="w-full border border-gray-300 rounded-md px-3 py-2" />
    {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
  </div>
  

  <div className="mb-4">
    <label htmlFor="first_name" className="block text-sm font-medium mb-1 capitalize">first_name</label>
    <input id="first_name" type="text" {...register("first_name")} className="w-full border border-gray-300 rounded-md px-3 py-2" />
    {errors.first_name && <p className="text-red-500 text-sm">{errors.first_name.message}</p>}
  </div>
  

  <div className="mb-4">
    <label htmlFor="last_name" className="block text-sm font-medium mb-1 capitalize">last_name</label>
    <input id="last_name" type="text" {...register("last_name")} className="w-full border border-gray-300 rounded-md px-3 py-2" />
    {errors.last_name && <p className="text-red-500 text-sm">{errors.last_name.message}</p>}
  </div>
  

  <div className="mb-4">
    <label htmlFor="email" className="block text-sm font-medium mb-1 capitalize">email</label>
    <input id="email" type="text" {...register("email")} className="w-full border border-gray-300 rounded-md px-3 py-2" />
    {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
  </div>
  

  <div className="mb-4">
    <label htmlFor="is_staff" className="block text-sm font-medium mb-1 capitalize">is_staff</label>
    <input id="is_staff" type="text" {...register("is_staff")} className="w-full border border-gray-300 rounded-md px-3 py-2" />
    {errors.is_staff && <p className="text-red-500 text-sm">{errors.is_staff.message}</p>}
  </div>
  

  <div className="mb-4">
    <label htmlFor="is_active" className="block text-sm font-medium mb-1 capitalize">is_active</label>
    <input id="is_active" type="text" {...register("is_active")} className="w-full border border-gray-300 rounded-md px-3 py-2" />
    {errors.is_active && <p className="text-red-500 text-sm">{errors.is_active.message}</p>}
  </div>
  

  <div className="mb-4">
    <label htmlFor="date_joined" className="block text-sm font-medium mb-1 capitalize">date_joined</label>
    <input id="date_joined" type="text" {...register("date_joined")} className="w-full border border-gray-300 rounded-md px-3 py-2" />
    {errors.date_joined && <p className="text-red-500 text-sm">{errors.date_joined.message}</p>}
  </div>
  

  <div className="mb-4">
    <label htmlFor="role" className="block text-sm font-medium mb-1 capitalize">role</label>
    <input id="role" type="text" {...register("role")} className="w-full border border-gray-300 rounded-md px-3 py-2" />
    {errors.role && <p className="text-red-500 text-sm">{errors.role.message}</p>}
  </div>
  

  <div className="mb-4">
    <label htmlFor="phone" className="block text-sm font-medium mb-1 capitalize">phone</label>
    <input id="phone" type="text" {...register("phone")} className="w-full border border-gray-300 rounded-md px-3 py-2" />
    {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
  </div>
  

  <div className="mb-4">
    <label htmlFor="groups" className="block text-sm font-medium mb-1 capitalize">groups</label>
    <input id="groups" type="text" {...register("groups")} className="w-full border border-gray-300 rounded-md px-3 py-2" />
    {errors.groups && <p className="text-red-500 text-sm">{errors.groups.message}</p>}
  </div>
  

  <div className="mb-4">
    <label htmlFor="user_permissions" className="block text-sm font-medium mb-1 capitalize">user_permissions</label>
    <input id="user_permissions" type="text" {...register("user_permissions")} className="w-full border border-gray-300 rounded-md px-3 py-2" />
    {errors.user_permissions && <p className="text-red-500 text-sm">{errors.user_permissions.message}</p>}
  </div>
  
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
    </form>
  );
}

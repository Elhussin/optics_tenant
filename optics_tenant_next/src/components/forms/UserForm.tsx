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
    <label htmlFor="password" className="label-base ">Password</label>
    <input id="password" type="password" {...register("password")} className="input-base" />
    {errors.password && <p className="error-text">{errors.password.message}</p>}
  </div>

  <div className="mb-4">
    <label htmlFor="is_superuser" className="label-base ">Is Superuser</label>

    <input id="is_superuser" type="radio" {...register("is_superuser")} className="input-radio" />
    {errors.is_superuser && <p className="error-text">{errors.is_superuser.message}</p>}
  </div>
  

  <div className="mb-4">
    <label htmlFor="username" className="label-base ">username</label>
    <input id="username" type="text" {...register("username")} className="input-base" />
    {errors.username && <p className="error-text">{errors.username.message}</p>}
  </div>
  

  <div className="mb-4">
    <label htmlFor="first_name" className="label-base ">first_name</label>
    <input id="first_name" type="text" {...register("first_name")} className="input-base" />
    {errors.first_name && <p className="error-text">{errors.first_name.message}</p>}
  </div>
  

  <div className="mb-4">
    <label htmlFor="last_name" className="label-base ">last_name</label>
    <input id="last_name" type="text" {...register("last_name")} className="input-base" />
    {errors.last_name && <p className="error-text">{errors.last_name.message}</p>}
  </div>
  

  <div className="mb-4">
    <label htmlFor="email" className="label-base ">email</label>
    <input id="email" type="text" {...register("email")} className="input-base" />
    {errors.email && <p className="error-text">{errors.email.message}</p>}
  </div>
  

  <div className="mb-4">
    <label htmlFor="is_staff" className="label-base ">is_staff</label>
    <input id="is_staff" type="text" {...register("is_staff")} className="input-base" />
    {errors.is_staff && <p className="error-text">{errors.is_staff.message}</p>}
  </div>
  

  <div className="mb-4">
    <label htmlFor="is_active" className="label-base ">is_active</label>
    <input id="is_active" type="text" {...register("is_active")} className="input-base" />
    {errors.is_active && <p className="error-text">{errors.is_active.message}</p>}
  </div>
  

  <div className="mb-4">
    <label htmlFor="date_joined" className="label-base ">date_joined</label>
    <input id="date_joined" type="text" {...register("date_joined")} className="input-base" />
    {errors.date_joined && <p className="error-text">{errors.date_joined.message}</p>}
  </div>
  

  <div className="mb-4">
    <label htmlFor="role" className="label-base ">role</label>
    <input id="role" type="text" {...register("role")} className="input-base" />
    {errors.role && <p className="error-text">{errors.role.message}</p>}
  </div>
  

  <div className="mb-4">
    <label htmlFor="phone" className="label-base ">phone</label>
    <input id="phone" type="text" {...register("phone")} className="input-base" />
    {errors.phone && <p className="error-text">{errors.phone.message}</p>}
  </div>
  

  <div className="mb-4">
    <label htmlFor="groups" className="label-base ">groups</label>
    <input id="groups" type="text" {...register("groups")} className="input-base" />
    {errors.groups && <p className="error-text">{errors.groups.message}</p>}
  </div>
  

  <div className="mb-4">
    <label htmlFor="user_permissions" className="label-base ">user_permissions</label>
    <input id="user_permissions" type="text" {...register("user_permissions")} className="input-base" />
    {errors.user_permissions && <p className="error-text">{errors.user_permissions.message}</p>}
  </div>
  
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
    </form>
  );
}

import { useLoginRequestForm } from '@/src/lib/forms/useLoginRequestForm';
import { API } from '@/src/lib/api';

export default function LoginRequestForm({ defaultValues, onSuccess }: any) {
  const { register, handleSubmit, formState: { errors }, handleServerErrors } = useLoginRequestForm(defaultValues);

  const onSubmit = async (data: any) => {
    try {
      await API.post('/api/users/login/', data);
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
    
    <label htmlFor="username" className="block text-sm font-medium mb-1">username</label>
    <input id="username" type="text" {...register("username")} className="input-base" />
    {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
  </div>

  <div className="mb-4">
    
    <label htmlFor="password" className="block text-sm font-medium mb-1">password</label>
    <input id="password" type="text" {...register("password")} className="input-base" />
    {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
  </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
    </form>
  );
}

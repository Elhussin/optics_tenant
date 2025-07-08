// components/forms/UserRequestForm.tsx
import React from 'react';
import { useFormRequest } from '@/lib/hooks/useFormRequest';
import { toast } from 'sonner';
import { FormProps } from '@/types';
import { SubmitHandler } from "react-hook-form";
import { useRouter } from 'next/navigation';
export default function CreateUserForm({
  onSuccess,
  onCancel,
  className = "",
  submitText = "Save",
  showCancelButton = true,
  alias="users_users_create",
  mode="create",
  defaultValues

}: FormProps) {
  const router = useRouter();
  const form = useFormRequest({
      alias:alias,
      onSuccess: (res) => {
        onSuccess?.(res);
      },
      onError: (err) => {
        toast.error("User creation failed");
        console.log("error", err);
      },
      defaultValues
    });
    

  const onSubmit: SubmitHandler<any> = async (data) => {
    const result = await form.submitForm(data);
    if (!result || !result.success) {
      // فشل، إما الاستثناء أو فشل التحقق
      console.log("error", result?.error);
      return;
    }
    if (result.success) {
      form.reset();
    }
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    form.reset();
    router.push('/users');
  };

  return (
    <div className={`${className}`}>

            {form.formState.errors.root && (
              <p className="text-red-500 text-sm mb-2">
                {form.formState.errors.root.message}
              </p>
            )}
            
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        
  <div className="mb-4">
    
    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
      Username *
    </label>
    <textarea 
      id="username" 
      {...form.register("username", { required: true })} 
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
      rows={3}
      placeholder="Username..."
    />
    
    {form.formState.errors.username && <p className="text-red-500 text-sm mt-1">{form.formState.errors.username?.message}</p>}
  </div>

  <div className="mb-4">
    
    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
      Email *
    </label>
    <input 
      id="email" 
      type="email" 
      {...form.register("email")} 
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
      placeholder="Email..."
      disabled={mode === 'edit'}
      
    />
    
    {form.formState.errors.email && <p className="text-red-500 text-sm mt-1">{form.formState.errors.email?.message}</p>}
  </div>

  <div className="mb-4">
    
    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
      First name
    </label>
    <input 
      id="first_name" 
      {...form.register("first_name")} 
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
      placeholder="First name..."
    />
    
    {form.formState.errors.first_name && <p className="text-red-500 text-sm mt-1">{form.formState.errors.first_name?.message}</p>}
  </div>

  <div className="mb-4">
    
    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
      Last name
    </label>
    <input 
      id="last_name" 
      {...form.register("last_name")} 
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
      placeholder="Last name..."
    />
    
    {form.formState.errors.last_name && <p className="text-red-500 text-sm mt-1">{form.formState.errors.last_name?.message}</p>}
  </div>

  <div className="mb-4">
    <div className="flex items-center space-x-2">
    
      <input 
        id="is_active" 
        type="checkbox" 
        {...form.register("is_active")} 
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
      />
      <label htmlFor="is_active" className="block text-sm font-medium text-gray-700 mb-1">Is active</label>
    </div>
    {form.formState.errors.is_active && <p className="text-red-500 text-sm mt-1">{form.formState.errors.is_active?.message}</p>}
  </div>

  <div className="mb-4">
    <div className="flex items-center space-x-2">
    
      <input 
        id="is_staff" 
        type="checkbox" 
        {...form.register("is_staff")} 
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
      />
      <label htmlFor="is_staff" className="block text-sm font-medium text-gray-700 mb-1">Is staff</label>
    </div>
    {form.formState.errors.is_staff && <p className="text-red-500 text-sm mt-1">{form.formState.errors.is_staff?.message}</p>}
  </div>

  <div className="mb-4">
    
    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
      Role
    </label>
    <select 
      id="role" 
      {...form.register("role")} 
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    >
      <option value="">Select...</option>
      <option value="ADMIN">ADMIN</option>
      <option value="BRANCH_MANAGER">BRANCH_MANAGER</option>
      <option value="TECHNICIAN">TECHNICIAN</option>
      <option value="SALESPERSON">SALESPERSON</option>
      <option value="ACCOUNTANT">ACCOUNTANT</option>
      <option value="INVENTORY_MANAGER">INVENTORY_MANAGER</option>
      <option value="RECEPTIONIST">RECEPTIONIST</option>
      <option value="CRM">CRM</option>
    </select>
    
    {form.formState.errors.role && <p className="text-red-500 text-sm mt-1">{form.formState.errors.role?.message}</p>}
  </div>

  <div className="mb-4">
    
    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
      Password *
    </label>
    <input 
      id="password" 
      type="password" 
      {...form.register("password")} 
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
      placeholder="Password..."
      disabled={mode === 'edit'}
    />
    
    {form.formState.errors.password && <p className="text-red-500 text-sm mt-1">{form.formState.errors.password?.message}</p>}
  </div>
        
        <div className="flex gap-3 pt-4">
          <button 
            type="submit" 
            disabled={form.formState.isSubmitting}
            className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors ${form.formState.isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {form.formState.isSubmitting ? 'Saving...' : submitText}
          </button>
          
          
          
          {showCancelButton && (
            <button 
              type="button" 
              onClick={handleCancel}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-md font-medium transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}


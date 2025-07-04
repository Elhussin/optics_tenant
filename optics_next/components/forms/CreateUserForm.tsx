// components/forms/UserRequestForm.tsx
import React from 'react';
import { schemas } from '@/lib/api/zodClient';
import { useFormRequest } from '@/lib/hooks/useFormRequest';
import { toast } from 'sonner';
import { handleErrorStatus } from '@/utils/error';
import { z } from 'zod';
import { CreateUserType } from '@/types';
const schema = schemas.UserRequest;

export default function CreateUserForm({
  onSuccess,
  onCancel,
  className = "",
  submitText = "Save",
  showCancelButton = false,
  mode =  'create',
  id,
  endpoint='users/register',
}: CreateUserType) {
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting }, 
    submitForm,
    reset
  } =useFormRequest(schema,{ mode: mode as any, id, apiOptions: { endpoint: endpoint, onSuccess: (res) => onSuccess?.(res), }});

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      const result = await submitForm(data);
      onSuccess?.(result);
      // if (mode === 'create') {
      //   reset();
      // }
    } catch (error: any) {
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'object') {
          // عرض جميع رسائل الخطأ
          Object.entries(errorData).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              messages.forEach(message => toast.error(`${field}: ${message}`));
            } else {
              toast.error(`${field}: ${messages}`);
            }
          });
        } else {
          toast.error(errorData);
        }
      } else {
        toast.error(handleErrorStatus(error));
      }
      console.error('Form submission error:', error);
    }
  };

  return (
    <div className={`${className}`}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
  <div className="mb-4">
    
    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
      Username *
    </label>
    <textarea 
      id="username" 
      {...register("username")} 
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
      rows={3}
      placeholder="Username..."
    />
    
    {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username?.message}</p>}
  </div>

  <div className="mb-4">
    
    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
      Email *
    </label>
    <input 
      id="email" 
      type="email" 
      {...register("email")} 
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
      placeholder="Email..."
      disabled={mode === 'edit'}
      
    />
    
    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email?.message}</p>}
  </div>

  <div className="mb-4">
    
    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
      First name
    </label>
    <textarea 
      id="first_name" 
      {...register("first_name")} 
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
      rows={3}
      placeholder="First name..."
    />
    
    {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name?.message}</p>}
  </div>

  <div className="mb-4">
    
    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
      Last name
    </label>
    <textarea 
      id="last_name" 
      {...register("last_name")} 
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
      rows={3}
      placeholder="Last name..."
    />
    
    {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name?.message}</p>}
  </div>

  <div className="mb-4">
    <div className="flex items-center space-x-2">
    
      <input 
        id="is_active" 
        type="checkbox" 
        {...register("is_active")} 
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
      />
      <label htmlFor="is_active" className="block text-sm font-medium text-gray-700 mb-1">Is active</label>
    </div>
    {errors.is_active && <p className="text-red-500 text-sm mt-1">{errors.is_active?.message}</p>}
  </div>

  <div className="mb-4">
    <div className="flex items-center space-x-2">
    
      <input 
        id="is_staff" 
        type="checkbox" 
        {...register("is_staff")} 
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
      />
      <label htmlFor="is_staff" className="block text-sm font-medium text-gray-700 mb-1">Is staff</label>
    </div>
    {errors.is_staff && <p className="text-red-500 text-sm mt-1">{errors.is_staff?.message}</p>}
  </div>

  <div className="mb-4">
    <div className="flex items-center space-x-2">
    
      <input 
        id="is_superuser" 
        type="checkbox" 
        {...register("is_superuser")} 
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
      />
      <label htmlFor="is_superuser" className="block text-sm font-medium text-gray-700 mb-1">Is superuser</label>
    </div>
    {errors.is_superuser && <p className="text-red-500 text-sm mt-1">{errors.is_superuser?.message}</p>}
  </div>

  <div className="mb-4">
    
    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
      Role
    </label>
    <select 
      id="role" 
      {...register("role")} 
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
    
    {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role?.message}</p>}
  </div>

  <div className="mb-4">
    
    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
      Password *
    </label>
    <input 
      id="password" 
      type="password" 
      {...register("password")} 
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
      placeholder="Password..."
      disabled={mode === 'edit'}
    />
    
    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password?.message}</p>}
  </div>
        
        <div className="flex gap-3 pt-4">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? 'Saving...' : submitText}
          </button>
          
          
          
          {showCancelButton && (
            <button 
              type="button" 
              onClick={onCancel}
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

// components/forms/UserRequestForm.tsx
import React from 'react';
import { useUserRequestForm, UseUserRequestFormOptions } from '@/lib/hooks/useUserRequest';

export interface UserRequestFormProps extends UseUserRequestFormOptions {
  onSuccess?: (data?: any) => void;
  onCancel?: () => void;
  className?: string;
  submitText?: string;
  showCancelButton?: boolean;
}

export default function UserRequestForm({
  onSuccess,
  onCancel,
  className = "",
  submitText = "Save",
  showCancelButton = false,
  ...options
}: UserRequestFormProps) {
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting }, 
    submitForm,
    reset
  } = useUserRequestForm(options);

  const onSubmit = async (data: any) => {
    try {
      const result = await submitForm(data);
      onSuccess?.(result);
      if (options.mode === 'create') {
        reset();
      }
    } catch (error) {
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
    
    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
      Role
    </label>
    <select 
      id="role" 
      {...register("role")} 
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    >
      <option value="">اختر...</option>
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

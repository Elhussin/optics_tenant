// src/components/forms/LoginRequestForm.tsx
import React from 'react';
import { useLoginRequestForm, UseLoginRequestFormOptions } from '@/src/lib/hooks/useLoginRequest';

export interface LoginRequestFormProps extends UseLoginRequestFormOptions {
  onSuccess?: (data?: any) => void;
  onCancel?: () => void;
  className?: string;
  submitText?: string;
  showCancelButton?: boolean;
}

export default function LoginRequestForm({
  onSuccess,
  onCancel,
  className = "",
  submitText = "Save",
  showCancelButton = false,
  ...options
}: LoginRequestFormProps) {
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting }, 
    submitForm,
    reset
  } = useLoginRequestForm(options);

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
    <input 
      id="username" 
      type="text" 
      {...register("username")} 
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
      placeholder="Username..."
      
    />
    
    {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username?.message}</p>}
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

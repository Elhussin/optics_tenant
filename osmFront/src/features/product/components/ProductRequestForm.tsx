// components/forms/ProductRequestForm.tsx
import React from 'react';
import { schemas } from '@/lib/zod-client';
import { useFormRequest } from '@/lib/hooks/useFormRequest';
import { toast } from 'sonner';
import { handleErrorStatus } from '@/utils/error';
import { z } from 'zod';
import { CreateUserType } from '@/types';
const schema = schemas.ProductRequest;

export default function ProductRequestForm({
  onSuccess,
  onCancel,
  defaultValues,
  className = "",
  submitText = "Save",
  showCancelButton = false,
  mode = 'create',
  id,
  ...options
}: CreateUserType) {
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting }, 
    submitForm,
    reset
  } =useFormRequest(schema,{ mode, id, defaultValues, apiOptions: { endpoint: 'products/product', onSuccess: (res) => onSuccess?.(res), }});

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      const result = await submitForm(data);
      onSuccess?.(result);
      if (mode === 'create') {
        reset();
      }
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
        id="is_deleted" 
        type="checkbox" 
        {...register("is_deleted")} 
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
      />
      <label htmlFor="is_deleted" className="block text-sm font-medium text-gray-700 mb-1">Is deleted</label>
    </div>
    {errors.is_deleted && <p className="text-red-500 text-sm mt-1">{errors.is_deleted?.message}</p>}
  </div>

  <div className="mb-4">
    
    <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
      Model *
    </label>
    <input 
      id="model" 
      type="text" 
      {...register("model")} 
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
      placeholder="Model..."
      
    />
    
    {errors.model && <p className="text-red-500 text-sm mt-1">{errors.model?.message}</p>}
  </div>

  <div className="mb-4">
    
    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
      Type *
    </label>
    <select 
      id="type" 
      {...register("type")} 
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    >
      <option value="">اختر...</option>
      <option value="CL">CL</option>
      <option value="SL">SL</option>
      <option value="SG">SG</option>
      <option value="EW">EW</option>
      <option value="AX">AX</option>
      <option value="OT">OT</option>
      <option value="DV">DV</option>
    </select>
    
    {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type?.message}</p>}
  </div>

  <div className="mb-4">
    
    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
      Name
    </label>
    <input 
      id="name" 
      type="text" 
      {...register("name")} 
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
      placeholder="Name..."
      
    />
    
    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name?.message}</p>}
  </div>

  <div className="mb-4">
    
    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
      Description
    </label>
    <textarea 
      id="description" 
      {...register("description")} 
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
      rows={3}
      placeholder="Description..."
    />
    
    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description?.message}</p>}
  </div>

  <div className="mb-4">
    
    <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
      Category id *
    </label>
    <input 
      id="category_id" 
      type="number" 
      {...register("category_id")} 
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
      placeholder="Category id..."
      
    />
    
    {errors.category_id && <p className="text-red-500 text-sm mt-1">{errors.category_id?.message}</p>}
  </div>

  <div className="mb-4">
    
    <label htmlFor="supplier_id" className="block text-sm font-medium text-gray-700 mb-1">
      Supplier id *
    </label>
    <input 
      id="supplier_id" 
      type="number" 
      {...register("supplier_id")} 
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
      placeholder="Supplier id..."
      
    />
    
    {errors.supplier_id && <p className="text-red-500 text-sm mt-1">{errors.supplier_id?.message}</p>}
  </div>

  <div className="mb-4">
    
    <label htmlFor="manufacturer_id" className="block text-sm font-medium text-gray-700 mb-1">
      Manufacturer id *
    </label>
    <input 
      id="manufacturer_id" 
      type="number" 
      {...register("manufacturer_id")} 
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
      placeholder="Manufacturer id..."
      
    />
    
    {errors.manufacturer_id && <p className="text-red-500 text-sm mt-1">{errors.manufacturer_id?.message}</p>}
  </div>

  <div className="mb-4">
    
    <label htmlFor="brand_id" className="block text-sm font-medium text-gray-700 mb-1">
      Brand id *
    </label>
    <input 
      id="brand_id" 
      type="number" 
      {...register("brand_id")} 
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
      placeholder="Brand id..."
      
    />
    
    {errors.brand_id && <p className="text-red-500 text-sm mt-1">{errors.brand_id?.message}</p>}
  </div>
        
        <div className="flex gap-3 pt-4">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={mode === 'edit' && fieldName === 'email'||mode === 'edit' && fieldName === 'username'||mode === 'edit' && fieldName === 'password'}
            
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

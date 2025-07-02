// components/forms/LoginRequestForm.tsx
import React from 'react';
import { schemas } from '@/lib/zod-client';
import { useFormRequest } from '@/lib/hooks/useFormRequest';
import { toast } from 'sonner';
import { handleErrorStatus } from '@/utils/error';
import { z } from 'zod';
import { UseRequestFormProps } from '@/types';
const schema = schemas.LoginRequest;



export default function LoginRequestForm({ onSuccess, onCancel, className = '', submitText = 'Save', showCancelButton = false, mode = 'create', id,
}: UseRequestFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, submitForm, isLoading, reset,
  } = useFormRequest(schema, {
    mode, id, apiOptions: { endpoint: 'users/login', onSuccess: (res) => onSuccess?.(res), },
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      const result = await submitForm(data);
      if (result.success && mode === 'create') {
        reset(); // reset النموذج بعد إرسال ناجح
      }
    } catch (error) {
      toast.error(handleErrorStatus(error));
    }
  };

  return (
    <div className={className}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Username *
          </label>
          <input
            id="username"
            type="text"
            {...register('username')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Username..."
          />
          {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password *
          </label>
          <input
            id="password"
            type="password"
            {...register('password')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Password..."
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors ${isSubmitting || isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
          >
            {isSubmitting || isLoading ? 'Saving...' : submitText}
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

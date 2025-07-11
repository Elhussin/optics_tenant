import React, { useState } from 'react';
import { z } from 'zod';
import { schemas } from '@/lib/api/zodClient';
import DynamicFormGenerator from './DynamicFormGenerator';
import {useCrudFormRequest} from '@/lib/hooks/useCrudFormRequest';
import {GeneratedFormProps} from '@/types';

type UserFormData = z.infer<typeof schemas.User>;
type ProductFormData = z.infer<typeof schemas.Product>;

  // إعدادات مخصصة للنماذج
  const defaultConfig = {
    baseClasses: "w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors",
    labelClasses: "block text-sm font-semibold text-gray-800 mb-2",
    errorClasses: "text-red-600 text-sm mt-1 font-medium",
    submitButtonClasses: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl",
    submitButtonText: "إرسال البيانات",
    includeResetButton: true,
    spacing: "mb-6",
    containerClasses: "space-y-6 p-6 bg-white rounded-xl shadow-lg"
  };

const alias = "users_users_create";
// مكون المثال الرئيسي
export default function FormExample(props: GeneratedFormProps) {
  const { onSuccess,schemaName, alias, mode, className, submitText, showCancelButton, defaultValues ,customConfig=defaultConfig} = props;
  const { form, onSubmit } = useCrudFormRequest({alias: alias!,defaultValues,
    onSuccess: (res) => { onSuccess?.(res); console.log(res); }
  });
  const schema = (schemas as any)[schemaName] as z.ZodObject<any>;



  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Dynamic Form Generator
        </h1>
          <DynamicFormGenerator
            schema={schemaName}
            onSubmit={onSubmit}
            onCancel={handleCancel}
            showCancelButton={true}
            mode="create"
            config={customConfig}
            className="mb-8"
            defaultValues={{
              inStock: true,
              category: 'electronics' as const
            }}
          />
      </div>
    </div>
  );
}
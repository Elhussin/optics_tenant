// components/Search/SearchForm.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { SearchField } from '@/types/search';

interface SearchFormProps {
  fields: SearchField[];
  actionPath?: string; // مسار التوجيه عند البحث
}

export const SearchForm = ({ fields, actionPath = '/results' }: SearchFormProps) => {
  const router = useRouter();
  const params = useSearchParams();

  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams(formData).toString();
    router.push(`${actionPath}?${query}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map((field) => (
        <div key={field.name} className="flex flex-col">
          <label className="mb-1 text-sm font-semibold">{field.label}</label>
          {field.type === 'select' ? (
            <select
              className="p-2 border rounded"
              onChange={(e) => handleChange(field.name, e.target.value)}
            >
              <option value="">اختر...</option>
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={field.type || 'text'}
              placeholder={field.placeholder}
              className="p-2 border rounded"
              onChange={(e) => handleChange(field.name, e.target.value)}
            />
          )}
        </div>
      ))}
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        بحث
      </button>
    </form>
  );
};

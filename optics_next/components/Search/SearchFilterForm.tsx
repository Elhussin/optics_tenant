'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { SearchField } from '@/types/search';
import { useState } from 'react';
import Button from '@/components/ui/button/Button';

interface Props {
  fields: SearchField[];
  actionPath?: string; // يمكن تمرير مسار مخصص (افتراضي '')
}

export const SearchFilterForm = ({ fields, actionPath = '' }: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState<Record<string, string>>({});

  const handleChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    for (const key in form) {
      if (form[key]) params.set(key, form[key]);
    }
    router.push(`${actionPath}?${params.toString()}`);
  };

  return (
    <div       className={`fixed top-16 left-0 h-full w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-md z-40 
        transform transition-transform duration-300`}>
    <form className="grid grid-cols-1 gap-4 mb-6  mt-32 w-4/5 px-4">
      {fields.map((field) => (
        <div key={field.name} className="flex items-center">
          <label className="block text-sm font-medium mr-2 capitalize w-24">{field.label}</label>
          {field.type === 'select' && field.options ? (
            <select
              className="w-full border p-2 rounded"
              onChange={(e) => handleChange(field.name, e.target.value)}
              defaultValue={''}
            >
              <option value="">ALL</option>
              {field.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              className="w-full  border p-2 rounded"
              onChange={(e) => handleChange(field.name, e.target.value)}
            />
          )}
        </div>
      ))}
      <Button
        label="Search"
        type="submit"
        className="col-span-full bg-blue-600 text-white py-2 rounded"
        onClick={(e: React.FormEvent) => handleSubmit(e)}
      />
    </form>
    </div>
  );
};

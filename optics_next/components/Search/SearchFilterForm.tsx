'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { SearchField } from '@/types/search';
import { useState } from 'react';
import {ActionButton} from '@/components/ui/buttons';
interface Props {
  fields: SearchField[];
  actionPath?: string; // يمكن تمرير مسار مخصص (افتراضي '')
}


export const SearchFilterForm = ({ fields, actionPath = '' }: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState<Record<string, string>>({});
  const [resetKey, setResetKey] = useState<number>(0);

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

  const handleClear = () => {
    setForm({});
    setResetKey((k) => k + 1);
    router.replace(actionPath + '?'); 
  };

  return (
    <div>
    <form key={resetKey} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" onSubmit={handleSubmit}>

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
            <div className="flex flex-row ">
      
      <ActionButton
    label="Search"
    type="submit"
    className="col-span-full bg-blue-600 text-white py-2 rounded"
  />
  <ActionButton
    label="Clear"
    type="button"
    variant="secondary"
    className="ml-2 col-span-full"
    onClick={handleClear}
  />

      <div>

      </div>
      </div>

    </form>

    </div>
  );
};

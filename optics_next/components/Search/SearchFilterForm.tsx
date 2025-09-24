
"use client";

import { useState } from "react";
import { ActionButton } from "@/components/ui/buttons/";

interface Props {
  fields: any[];
  setFilters: (filters: Record<string, string>) => void;
}

export const SearchFilterForm = ({ fields, setFilters }: Props) => {
  const [form, setForm] = useState<Record<string, string>>({});
  const [resetKey, setResetKey] = useState<number>(0);

  const handleChange = (name: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ تجهيز الفلاتر مع مراعاة __icontains
    const filters: Record<string, string> = {};

    Object.entries(form).forEach(([key, value]) => {
      if (!value) return; // تجاهل الفارغ

      if (key.includes("id")) {
        filters[key] = value; // لو الحقل فيه id نرسله زي ما هو
      } else if (key === "search") {
        filters[key] = value; // الحقل الرئيسي للبحث
      } else {
        filters[`${key}__icontains`] = value; // باقي الحقول __icontains
      }
    });

    console.log("filters sent:", filters);
    setFilters(filters);
  };

  const handleClear = () => {
    setForm({});
    setResetKey((k) => k + 1);
    setFilters({});
  };

  return (
    <form
      key={resetKey}
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 m-5"
      onSubmit={handleSubmit}
    >
      <div className="flex items-center col-span-full">
        <label className="block text-sm font-medium mr-2 w-24">Search</label>
        <input
          type="text"
          className="w-full border p-2 rounded"
          onChange={(e) => handleChange("search", e.target.value)}
          value={form["search"] || ""}
        />
      </div>

      {fields.map((field) => (
        <div key={field.name} className="flex items-center">
          <label className="block text-sm font-medium mr-2 capitalize w-24">
            {field.label}
          </label>
          {field.type === "select" && field.options ? (
            <select
              className="w-full border p-2 rounded"
              onChange={(e) => handleChange(field.name, e.target.value)}
              value={form[field.name] || ""}
            >
              <option value="">ALL</option>
              {field.options.map((opt: any) => (
                <option key={`${opt.value}_`} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              className="w-full border p-2 rounded"
              onChange={(e) => handleChange(field.name, e.target.value)}
              value={form[field.name] || ""}
            />
          )}
        </div>
      ))}

      <div className="flex flex-row justify-end">
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
      </div>
    </form>
  );
};

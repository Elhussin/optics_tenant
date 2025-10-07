
"use client";

import { useState } from "react";
import { ActionButton } from "../ui/buttons";
import { useRouter } from "next/navigation";
import { useSearch } from "@/src/shared/contexts/SearchContext";
import {Search, SearchX} from "lucide-react";
interface Props {
  fields: any[];
  setFilters: (filters: Record<string, string>) => void;
}


export const SearchFilterForm = ({ fields, setFilters }: Props) => {
  const router = useRouter();
  const [form, setForm] = useState<Record<string, string>>({});
  const [resetKey, setResetKey] = useState<number>(0);
  const { isSearchVisible } = useSearch();

  // const handleChange = (name: string, value: string) => {
  //   setForm((prev) => ({
  //     ...prev,
  //     [name]: value,
  //   }));

  // };


  const handleChange = (name: string, value: string) => {
    setForm((prev) => {
      const newForm = {
        ...prev,
        [name]: value,
      };
  
      // تحديث الفلاتر مباشرة عند أي تغيير
      const filters: Record<string, string> = {};
      Object.entries(newForm).forEach(([key, val]) => {
        if (!val) return;
        if (key.includes("id")) {
          filters[key] = val;
        } else if (key === "search") {
          console.log(val);
          if (val.length < 3) return;
          filters[key] = val;
        } else {
          filters[`${key}`] = val;
        }
      });
  
      setFilters(filters);
  
      return newForm;
    });
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
        filters[`${key}`] = value; // باقي الحقول __icontains  //__icontains
      }
    });
    setFilters(filters);
  };

  const handleClear = () => {
    setForm({});
    setResetKey((k) => k + 1);
    setFilters({});
    router.push("?");
  };
  if (!isSearchVisible) return null;
  return (
    <form
      key={resetKey}
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 m-5"
      onSubmit={handleSubmit}
    >
      {/* <div className="md:flex items-center col-span-full">
        <label className="block text-sm font-medium mr-2 w-24">Search</label>
        <input
          type="text"
          className="w-full border p-2 rounded"
          onChange={(e) => handleChange("search", e.target.value)}
          value={form["search"] || ""}
        />

      <div className="flex flex-row justify-end">
        <ActionButton

          title="Search"
          icon={<Search />}
          type="submit"
          variant="outline"
      
        />
        <ActionButton

          title="Clear"
          icon={<SearchX />}
          type="button"
          variant="outline"
          onClick={handleClear}
        />
      </div>
      </div> */}
<div className="md:flex items-center col-span-full gap-1">

  {/* حاوية الحقل + الأزرار */}
  <div className="flex flex-1 border border-gray-200 rounded overflow-hidden">
    <input
      type="text"
      className="input-text"
      onChange={(e) => handleChange("search", e.target.value)}
      value={form["search"] || ""}
      placeholder="Search..."
    />
    <ActionButton
      title="Search"
      icon={<Search />}
      type="submit"
      variant="outline"
    />
    <ActionButton
      title="Clear"
      icon={<SearchX />}
      type="button"
      variant="outline"
      onClick={handleClear}

    />
  </div>
</div>

      {fields.map((field) => (
        <div key={field.name} className=" items-center">
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

    </form>
  );
};

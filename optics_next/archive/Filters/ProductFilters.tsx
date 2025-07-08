// components/Filters/ProductFilters.tsx

'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface FilterData {
  types?: string[];
  colors?: string[];
  materials?: string[];
}

interface Props {
  filters: FilterData;
}

export const ProductFilters = ({ filters }: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(name, value);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      {/* نوع المنتج */}
      {filters.types && (
        <div>
          <h4 className="font-semibold">النوع</h4>
          <select onChange={(e) => handleChange('type', e.target.value)} defaultValue={searchParams.get('type') || ''}>
            <option value="">الكل</option>
            {filters.types.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      )}

      {/* الألوان */}
      {filters.colors && (
        <div>
          <h4 className="font-semibold">اللون</h4>
          {filters.colors.map((color) => (
            <label key={color} className="block">
              <input
                type="checkbox"
                checked={searchParams.getAll('color').includes(color)}
                onChange={(e) => {
                  const params = new URLSearchParams(searchParams.toString());
                  const current = params.getAll('color');
                  if (e.target.checked) {
                    params.append('color', color);
                  } else {
                    params.delete('color');
                    current.filter((c) => c !== color).forEach((c) => params.append('color', c));
                  }
                  router.push(`?${params.toString()}`);
                }}
              />
              <span className="ml-2">{color}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

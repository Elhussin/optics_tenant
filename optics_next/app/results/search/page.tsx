// app/page.tsx

import { SearchForm } from '@/components/Search/SearchForm';
import { SearchField } from '@/types/search';

const searchFields: SearchField[] = [
  { name: 'keyword', label: 'كلمة البحث', placeholder: 'ادخل كلمة' },
  { name: 'category', label: 'الفئة', type: 'select', options: [
    { label: 'كل الأقسام', value: '' },
    { label: 'نظارات طبية', value: 'medical' },
    { label: 'نظارات شمسية', value: 'sun' },
  ] },
];

export default function SearchPage() {
  return (
    <main className="max-w-xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">ابحث في المنتجات</h1>
      <SearchForm fields={searchFields} actionPath="/results" />
    </main>
  );
}

// app/results/page.tsx
"use client";
import { useSearchParams } from 'next/navigation';

export default function ResultsPage() {

  const searchParams = useSearchParams();

  const keyword = searchParams.get('keyword');
  const category = searchParams.get('category');

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">نتائج البحث:</h2>
      <p><strong>الكلمة:</strong> {keyword || 'غير محددة'}</p>
      <p><strong>الفئة:</strong> {category || 'غير محددة'}</p>

      {/* هنا يمكن جلب بيانات من API باستخدام هذه المعلمات */}
    </div>
  );
}

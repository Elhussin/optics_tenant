'use client';
import { useRouter } from '@/app/i18n/navigation';

export default function DashboardButtons() {
  const router = useRouter();

  return (
    <div>
      <button className="btn " onClick={() => router.push('/dashboard/supplier?action=viewAll')}>
        View All Suppliers
      </button>
      <button className="btn " onClick={() => router.push('/dashboard/department?action=viewAll')}>
        View All Departments
      </button>
    </div>
  );
}

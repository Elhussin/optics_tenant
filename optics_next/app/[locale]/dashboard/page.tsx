'use client'
import { UsePermission,hasPermission } from '@/lib/utils/auth';
import { useUser } from '@/lib/context/userContext';


export default function DashboardPage() {
  const user = useUser();

  if (!user) return <p>Loading...</p>;
  if (!hasPermission(user, 'view_dashboard')) return <p>Unauthorized</p>;

  return <div>Welcome to the dashboard</div>;
}


'use client'
import { UsePermission } from '@/src/lib/hooks/usePermission';





const dashboardPage = () => {

  const stats = {
    users: 100,
    orders: 50,
    revenue: 5000,
  };
  const canViewDashboard = UsePermission('view_dashboard');
  if (!canViewDashboard) {
    return <p>🚫 ليس لديك صلاحية لعرض لوحة التحكم</p>;
  } 
  return (
 

    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-6">Welcome to the Admin Dashboard</h1>
      <ul>
        <li>Users: {stats.users}</li>
        <li>Orders: {stats.orders}</li>
        <li>Revenue: ${stats.revenue}</li>
      </ul>
    </div>

  );
};

export default dashboardPage;
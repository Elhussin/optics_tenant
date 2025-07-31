'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/lib/context/userContext';
import { getClientData } from './Client';
import PricingPlans from '@/components/PricingPlans';
import { Users, Store, CreditCard, Calendar, AlertTriangle } from 'lucide-react';

export default function UserProfile() {
  const { user } = useUser();
  const [clientData, setClientData] = useState<any>(null);

  useEffect(() => {
    if (user?.role === 'owner' && user?.client) {
      (async () => {
        const data = await getClientData(user.client);
        setClientData(data);
      })();
    }
  }, [user]);

  if (!user) return <p>Loading...</p>;

  const today = new Date();
  const paidUntil = clientData ? new Date(clientData.paid_until) : null;
  const daysLeft = paidUntil
    ? Math.ceil((paidUntil.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const statusColor =
    clientData?.plan === 'trial'
      ? 'bg-yellow-100 text-yellow-800'
      : daysLeft !== null && daysLeft <= 0
      ? 'bg-red-100 text-red-800'
      : 'bg-green-100 text-green-800';

  const progressWidth =
    daysLeft !== null && daysLeft > 0
      ? `${Math.min((daysLeft / 30) * 100, 100)}%`
      : '0%';

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* بطاقة بيانات المستخدم */}
      <section className="bg-surface p-6 rounded-xl shadow-md border">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-500" /> User Information
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
        </div>
      </section>

      {/* بطاقة بيانات العميل إذا كان Owner */}
      {user.role === 'owner' && clientData && (
        <section className="bg-surface p-6 rounded-xl shadow-md border">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Store className="w-5 h-5 text-purple-500" /> Client Information
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <p><strong>Name:</strong> {clientData.name}</p>
            <p className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> <strong>Plan:</strong>
              <span className={`px-2 py-0.5 rounded-full text-sm ${statusColor}`}>
                {clientData.plan}
              </span>
            </p>
            <p><strong>Max Users:</strong> {clientData.max_users}</p>
            <p><strong>Max Products:</strong> {clientData.max_products}</p>
            <p><strong>Max Branches:</strong> {clientData.max_branches}</p>
            <p className="flex items-center gap-2">
              <Calendar className="w-4 h-4" /> <strong>Paid Until:</strong> {clientData.paid_until}
            </p>
          </div>

          {/* شريط تقدم الاشتراك */}
          <div className="mb-4">
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${daysLeft <= 7 ? 'bg-red-500' : 'bg-green-500'}`}
                style={{ width: progressWidth }}
              />
            </div>
            {daysLeft !== null && (
              <p className="text-sm mt-1 text-gray-600">
                {daysLeft > 0
                  ? `Subscription will expire in ${daysLeft} day(s)`
                  : 'Subscription expired'}
              </p>
            )}
          </div>

          {/* تنبيه قرب انتهاء الاشتراك */}
          {daysLeft !== null && daysLeft <= 7 && (
            <div className="mt-2 p-2 bg-yellow-100 text-yellow-700 rounded flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Your subscription is about to expire
            </div>
          )}
          {daysLeft !== null && daysLeft <= 0 && (
            <div className="mt-2 p-2 bg-red-100 text-red-700 rounded flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Your subscription is expired
            </div>
          )}
          {daysLeft !== null && daysLeft > 7 && (
            <div className="mt-2 p-2 bg-green-100 text-green-700 rounded flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Your subscription is active

            </div>
          )}
        </section>
      )}

      {/* عرض خطط الترقية إذا كانت الخطة trial أو الاشتراك منتهي */}
      {user.role === 'owner' && clientData && (clientData.plan === 'trial' || daysLeft <= 0) && (
        <PricingPlans clientId={String(user.uuid)} />
      )}
    </div>
  );
}

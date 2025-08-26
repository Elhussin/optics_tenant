'use client';
import { useEffect, useState } from 'react';
import { useUser } from '@/lib/contexts/userContext';
import { FetchData } from '@/lib/api/api';
import PricingPlans from '@/components/layout/paymant/PricingPlans';
import { Users, Store, CreditCard, Calendar, AlertTriangle, Check } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
export default function Profile() {
    const { user } = useUser();
    const [clientData, setClientData] = useState<any>(null);
    const t = useTranslations("profilePage");

    // Add locale as dependency to force re-render
    useEffect(() => {
      if (user?.role.name.toLowerCase() === 'owner' && user?.client) {
        (async () => {
          const url = `/api/tenants/clients/${user.client}`;
          const data = await FetchData({url: url });
          setClientData(data);
        })();
      }
    }, [user]); // Add locale here

    
    const today = new Date();
    const paidUntil = clientData ? new Date(clientData.paid_until) : null;
    const daysLeft = paidUntil
      ? Math.ceil((paidUntil.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    const statusColor =
      clientData?.plans?.name === 'trial'
        ? 'bg-yellow-100 text-yellow-800'
        : daysLeft !== null && daysLeft <= 0
        ? 'bg-red-100 text-red-800'
        : 'bg-green-100 text-green-800';

    const progressWidth =
      daysLeft !== null && daysLeft > 0
        ? `${Math.min((daysLeft / 30) * 100, 100)}%`
        : '0%'; 

    return (
      <>
      {user && (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Add key prop to force re-render on locale change */}
        
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          {t('welcomeMessage')} : {user.username!}
        </h2>
        
        <section className="bg-surface p-6 rounded-xl shadow-md border">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" /> {t('userInformation')}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 capitalize">
            <p><strong>{t('username')}:</strong> {user?.username}</p>
            <p><strong>{t('email')}:</strong> {user?.email}</p>
            <p><strong>{t('role')}:</strong> {user?.role.name}</p>
            {user?.role.name.toLowerCase() === 'owner' && (
              <>
              <Link href={`/dashboard/tenant_settings?action=viewAll`} className="text-blue-600 hover:underline"> Setting</Link>
              <p><strong>Client ID:</strong> {user?.client}</p>
              </>
            )}
          </div>
        </section>

        {/* بطاقة بيانات العميل إذا كان OWNER */}
        {user.role.name.toLowerCase() === 'owner' && clientData && (
          <section className="bg-surface p-6 rounded-xl shadow-md border">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Store className="w-5 h-5 text-purple-500" /> {t('clientInformation')}
            </h2>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <p><strong>{t('clientName')}:</strong> {clientData?.name}</p>
              <p className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> <strong>{t('plan')}:</strong>
                <span className={`px-2 py-0.5 rounded-full text-sm ${statusColor}`}>
                  {clientData?.plans?.name}
                </span>
              </p>
              <p><strong>{t('maxUsers')}:</strong> {clientData?.max_users}</p>
              <p><strong>{t('maxProducts')}:</strong> {clientData?.max_products}</p>
              <p><strong>{t('maxBranches')}:</strong> {clientData?.max_branches}</p>
              <p className="flex items-center gap-2">
                <Calendar className="w-4 h-4" /> <strong>{t('paidUntil')}:</strong> {clientData?.paid_until}
              </p>
            </div>

            {/* شريط تقدم الاشتراك */}
            <div className="mb-4">
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${daysLeft !== null && daysLeft <= 7 ? 'bg-red-500' : 'bg-green-500'}`}
                  style={{ width: progressWidth }}
                />
              </div>
              {daysLeft !== null && (
                <p className="text-sm mt-1 text-gray-600">
                  {daysLeft > 0
                    ? t('subscriptionExpiresIn') + `: ${daysLeft}`
                    : t('subscriptionExpired')}
                </p>
              )}
            </div>

            {/* تنبيه قرب انتهاء الاشتراك */}
            {daysLeft !== null && daysLeft <= 7 && daysLeft > 0 && (
              <div className="mt-2 p-2 bg-yellow-100 text-yellow-700 rounded flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> {t('subscriptionAboutToExpire')}
              </div>
            )}
            {daysLeft !== null && daysLeft <= 0 && (
              <div className="mt-2 p-2 bg-red-100 text-red-700 rounded flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> {t('subscriptionExpired')}
              </div>
            )}
            {daysLeft !== null && daysLeft > 7 && (
              <div className="mt-2 p-2 bg-green-100 text-green-700 rounded flex items-center gap-2">
                <Check className="w-4 h-4" /> {t('subscriptionActive')}
              </div>
            )}
          </section>
        )}

        {/* عرض خطط الترقية إذا كانت الخطة trial أو الاشتراك منتهي */}
        {user.role.name?.toLowerCase() === 'owner' && clientData && (clientData.plans?.name === 'trial' || daysLeft !== null && daysLeft <= 0) && (
          <div id="pricingSectian">
          <PricingPlans clientId={String(clientData.uuid)} /> 
          </div>
        )}
      </div>
      )}
      </>
    );
}
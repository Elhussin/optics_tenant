
"use client";
import React, { Suspense } from 'react';
import {LoadingSpinner} from '@/src/shared/components/ui/loding';
import { Plus, ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ActionButton } from '@/src/shared/components/ui/buttons/';
const ViewEyeTest = React.lazy(() => import('@/src/features/prescription/components/ViewEyeTest'));
export default function ViewPrescriptionPage() {
const t = useTranslations("products");


  return (
        <Suspense fallback={<div><LoadingSpinner /></div>}>

          <h2 className="text-lg font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
            <span className="w-1 h-6 bg-primary rounded-full"></span>
            {t('products')}
          </h2>
           <div className="flex gap-2">
       
            <ActionButton
              variant="success"
              icon={<Plus size={18} />}
              navigateTo={`/dashboard/products/create`}
              title={`${t('createTitle')}`}
              className="px-4 py-2"
            />
          <ActionButton
            variant="ghost"
            className="bg-secondary hover:bg-secondary/80 dark:hover:bg-secondary/80 border-0"
            icon={<ArrowLeft size={18} />}
            navigateTo={`/dashboard/`}
            title={t('back')}
          />
        </div>
          
          </Suspense>


  );
}



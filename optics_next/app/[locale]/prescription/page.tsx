
"use client";
import React, { Suspense } from 'react';
import {LoadingSpinner} from '@/components/ui/loding';
const ViewEyeTest = React.lazy(() => import('@/components/eyeTest/View'));
export default function ViewPrescriptionPage() {

  return (
        <Suspense fallback={<div><LoadingSpinner /></div>}>

       <ViewEyeTest
            title="View Prescription"
          />
          </Suspense>


  );
}



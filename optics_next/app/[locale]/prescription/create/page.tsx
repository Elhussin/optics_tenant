

"use client";
import React, { Suspense } from 'react';
import {LoadingSpinner} from '@/components/ui/loding';
const EyeTest = React.lazy(() => import('@/components/eyeTest/EyeTest'));

export default function CreatePrescriptionPage() {

  return (
        <Suspense fallback={<div><LoadingSpinner /></div>}>

       <EyeTest
            alias="prescriptions_prescription_create"
            // className="container"
            title="create Prescription"
            message="Sucussfully created Prescription"
            submitText="Save Prescription"
          />
          </Suspense>


  );
}



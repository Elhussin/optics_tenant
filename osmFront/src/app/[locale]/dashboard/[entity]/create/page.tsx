'use client';
import { useParams } from 'next/navigation';
import { formsConfig } from '@/src/config/formsConfig';
import DynamicFormGenerator from '@/src/features/auth/components/components/generate/DynamicFormGenerator';
import {NotFound} from '@/src/features/auth/components/components/NotFound'

export default function EntityCreatePage() {
  const params = useParams();
  const entity = params.entity as string || '';
  const locale = params.locale as string || 'en';


  if (!(entity in formsConfig)) {
    return <NotFound error="Invalid entity" />;
  }

  return <DynamicFormGenerator entity={entity} />;
}

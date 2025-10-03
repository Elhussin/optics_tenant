'use client';
import { useParams } from 'next/navigation';
import { formsConfig } from '@/src/features/dashboard/api/entityConfig';
import DynamicFormGenerator from '@/src/shared/components/forms/DynamicFormGenerator';
import {NotFound} from '@/src/shared/components/views/NotFound'

export default function EntityCreatePage() {
  const params = useParams();
  const entity = params.entity as string || '';
  const locale = params.locale as string || 'en';


  if (!(entity in formsConfig)) {
    return <NotFound error="Invalid entity" />;
  }

  return <DynamicFormGenerator entity={entity} />;
}

// app/[entity]/[id]/edit/page.tsx
'use client';
import { formsConfig } from '@/src/features/dashboard/api/entityConfig';
import DynamicFormGenerator from '@/src/shared/components/forms/DynamicFormGenerator';
import { useParams } from 'next/navigation';
import {NotFound} from '@/src/shared/components/views/NotFound'
export default function EntityEditPage() {
    const params = useParams();
   const entity = params.entity as string || '';
  const id = params.id as string || '';

  if (!(entity in formsConfig)) {
    return <NotFound error="Invalid entity" />;
  }

  return <DynamicFormGenerator entity={entity} id={id} />;
}

// app/[entity]/[id]/edit/page.tsx
'use client';
import { formsConfig } from '@/config/formsConfig';
import DynamicFormGenerator from '@/components/generate/DynamicFormGenerator';
import { useParams } from 'next/navigation';
import {NotFound} from '@/components/NotFound'
export default function EntityEditPage() {
    const params = useParams();
   const entity = params.entity as string || '';
  const id = params.id as string || '';

 
  if (!(entity in formsConfig)) {
    return <NotFound error="Invalid entity" />;
  }

  return <DynamicFormGenerator entity={entity} id={id} />;
}

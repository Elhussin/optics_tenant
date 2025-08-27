// app/[entity]/page.tsx
'use client';
import { useParams } from 'next/navigation';
import { formsConfig } from '@/config/formsConfig';
import ViewCard from '@/components/view/ViewCard';
import {NotFound} from '@/components/NotFound';

export default function EntityPage() {
  const params = useParams();
  const entity = params.entity as string || '';
  if (!(entity in formsConfig)) {
    return <NotFound error="Invalid entity" />;
  }

  return <ViewCard entity={entity} />;
}

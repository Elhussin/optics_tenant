// app/[entity]/page.tsx
'use client';
import { useParams } from 'next/navigation';
import { formsConfig } from '@/src/config/formsConfig';
import ViewCard from '@/src/features/auth/components/components/view/ViewCard';
import {NotFound} from '@/src/features/auth/components/components/NotFound';

export default function EntityPage() {
  const params = useParams();
  const entity = params.entity as string || '';
  if (!(entity in formsConfig)) {
    return <NotFound error="Invalid entity" />;
  }

  return <ViewCard entity={entity} />;
}

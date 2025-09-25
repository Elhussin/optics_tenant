
'use client';
import { useParams} from 'next/navigation';
import { formsConfig } from '@/src/config/formsConfig';
import ViewDetailsCard from '@/src/features/auth/components/components/view/ViewDetailsCard';
import {NotFound} from '@/src/features/auth/components/components/NotFound'

export default function EntityDetailsPage() {
  const params = useParams();
  const entity = params.entity as string || '';
  const id = params.id as string || '';
  if (!(entity in formsConfig)) {
    return <NotFound error="Invalid entity" />;
  }
  return <ViewDetailsCard entity={entity} id={id} />;
}

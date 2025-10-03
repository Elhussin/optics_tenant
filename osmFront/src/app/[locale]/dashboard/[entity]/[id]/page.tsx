
'use client';
import { useParams} from 'next/navigation';
import { formsConfig } from '@/src/features/dashboard/api/entityConfig';
import ViewDetailsCard from '@/src/shared/components/views/ViewDetailsCard';
import {NotFound} from '@/src/shared/components/views/NotFound'

export default function EntityDetailsPage() {
  const params = useParams();
  const entity = params.entity as string || '';
  const id = params.id as string || '';
  if (!(entity in formsConfig)) {
    return <NotFound error="Invalid entity" />;
  }
  return <ViewDetailsCard entity={entity} id={id} />;
}

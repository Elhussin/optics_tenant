'use client';
import { useParams } from 'next/navigation';
import { formsConfig } from '@/config/formsConfig';
import DynamicFormGenerator from '@/components/generate/DynamicFormGenerator';

export default function EntityCreatePage() {
  const params = useParams();
  const entity = params.entity as string || '';

  if (!(entity in formsConfig)) {
    return <div>Invalid entity</div>;
  }

  return <DynamicFormGenerator entity={entity} />;
}

'use client';

import { useSearchParams } from 'next/navigation';
import DynamicFormGenerator from '@/components/generate/DynamicFormGenerator';

export default function DynamicFormPage() {
  const params = useSearchParams();

  // قراءة المتغيرات من الـ URL
  const schemaName = params.get('schemaName') || '';
  const alias = params.get('alias') || '';
  const submitText = params.get('submitText') || 'Submit';
  const successMessage = params.get('successMessage') || 'Success';
  const errorMessage = params.get('errorMessage') || 'Error';
  const title = params.get('title') || '';
  const id = params.get('id') || '';
  const fetchAlias = params.get('fetchAlias') || '';
  // if (id) {
  //   let mode = params.get('mode') || 'edit';
  // }

if (!schemaName || !alias) {
    return <div>Missing required parameters</div>;
  }

  return (
    <DynamicFormGenerator
      schemaName={schemaName}
      alias={alias}
      submitText={submitText}
      successMessage={successMessage}
      errorMessage={errorMessage}
      title={title}
      id={id}
      mode={id ? 'edit' : 'create'}
      fetchAlias={id && fetchAlias }
    />
  );
}

import { useParams, useSearchParams } from 'next/navigation';
import DynamicFormGenerator from '@/components/generate/DynamicFormGenerator';

export default function DynamicEditPage() {
    const { name,id } = useParams(); // ده اسم الـ dynamic route

  const params = useSearchParams();


  const schemaName = params.get('schemaName') || '';
  const alias = params.get('alias') || '';
  const submitText = params.get('submitText') || 'Submit';
  const successMessage = params.get('successMessage') || 'Success';
  const errorMessage = params.get('errorMessage') || 'Error';
  const title = params.get('title') || 'Create ' + alias;
  if (!schemaName || !alias || !id) {
    return <div>Missing required parameters</div>;
  }

  return (
    <DynamicFormGenerator
      schemaName={schemaName}
      id={id}
      alias={alias}
      submitText={submitText}
      successMessage={successMessage}
      errorMessage={errorMessage}
      title={title}
      mode="edit"
    />
  );
}
 
// 'use client';

// import { useSearchParams } from 'next/navigation';
// import DynamicFormGenerator from '@/components/generate/DynamicFormGenerator';
// import ViewDetailsCard from '@/components/view/ViewDetailsCard';

// export default function DynamicFormPage() {
//   const params = useSearchParams();

//   const schemaName = params.get('schemaName') || '';
//   const alias = params.get('alias') || '';
//   const submitText = params.get('submitText') || 'Submit';
//   const successMessage = params.get('successMessage') || 'Success';
//   const errorMessage = params.get('errorMessage') || 'Error';
//   const title = params.get('title') || '';
//   const id = params.get('id') || '';

//   const fields = params.get('fields') || '';
//   const restoreAlias = params.get('restoreAlias') || '';
//   const hardDeleteAlias = params.get('hardDeleteAlias') || '';
//   const fetchAlias = params.get('fetchAlias') || '';



//   if (params.get('mode') === 'view') {
//     return <ViewDetailsCard
//       id={id}
//       fields={fields.split(',').map((field) => ({ key: field, label: field, zodType: 'string' }))}
//       title={title}
//       alias={alias}
//       restoreAlias={restoreAlias}
//       hardDeleteAlias={hardDeleteAlias}
//     />
//   }

//   if (!schemaName || !alias) {
//     return <div>Missing required parameters</div>;
//   }


//   return (
//     <DynamicFormGenerator
//       schemaName={schemaName}
//       alias={alias}
//       submitText={submitText}
//       successMessage={successMessage}
//       errorMessage={errorMessage}
//       title={title}
//       id={id}
//       mode={id ? 'edit' : 'create'}
//       fetchAlias={id && fetchAlias }
//     />
//   );
// }
// src/app/dashboard/form/page.tsx
'use client';
import { useParams } from 'next/navigation';
import { formConfig } from '@/config/formConfig';
import DynamicFormGenerator from '@/components/forms/DynamicFormGenerator';

export default function DynamicFormPage() {
  const params = useParams();
  const formKey = params.formKey as string;

  if (!formKey || !(formKey in formConfig)) {
    return <div>Invalid form key</div>;
  }

  const config = formConfig[formKey as keyof typeof formConfig];

  return (
    <DynamicFormGenerator
      schemaName={config.schemaName}
      alias={config.alias}
      submitText={config.submitText}
      successMessage={config.successMessage}
      errorMessage={config.errorMessage}
      title={config.title}
    />
  );
}

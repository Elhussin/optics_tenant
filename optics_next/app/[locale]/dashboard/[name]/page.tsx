'use client';
import { useParams,useSearchParams } from 'next/navigation';
import { formsConfig } from '@/config/formsConfig';
import DynamicFormGenerator from '@/components/generate/DynamicFormGenerator';
import ViewDetailsCard from '@/components/view/ViewDetailsCard';
import ViewCard from '@/components/view/ViewCard';

export default function DynamicFormPage() {
  const params = useParams();
  const pagyName = params.name as string || '';
  const urlParams = useSearchParams();
  const action = urlParams.get('action') || '';
  const id = urlParams.get('id') || '';

  if (!pagyName ||  !(pagyName in formsConfig)) {
    return <div>Invalid page name</div>;
  }
  const form = formsConfig[pagyName];


  //   const {alias,viewFields,title = "View Items",createButton,updateButton,viewButton} = props;
  if (action==='viewAll') {
    return (
      <ViewCard entity={pagyName} />
    );
  }

    if (action === 'view' && id) {
    return (
      <ViewDetailsCard
        entity={pagyName}
        id={id}
      />
    );
  }

  if (action === 'edit' && id) {
    return (
    <DynamicFormGenerator

        schemaName={form.schemaName}
        alias={form.updateAlias}
        fetchAlias={form.retrieveAlias}
        submitText={form.title}
        successMessage={form.updateSuccessMessage}
        errorMessage={form.updateErrorMessage}
        title={form.updateTitle}
        id={id}
    />
    )
    
  }

  if (action === 'create') {
    return (
      <DynamicFormGenerator
          schemaName={form.schemaName}
          alias={form.createAlias}
          submitText={form.createTitle}
          successMessage={form.createSuccessMessage}
          errorMessage={form.createErrorMessage}
          title={form.createTitle}
      />
    )
  }
}

'use client';
import { useParams,useSearchParams } from 'next/navigation';
import { formsConfig } from '@/config/formsConfig';
import DynamicFormGenerator from '@/components/generate/DynamicFormGenerator';
import ViewDetailsCard from '@/components/view/ViewDetailsCard';
import ViewCard from '@/components/view/ViewCard';

/**
 * DynamicFormPage is a dynamic page component that renders different views based on URL parameters.
 * 
 * - Uses `useParams` to extract the page name from the route.
 * - Uses `useSearchParams` to determine the action (`viewAll`, `view`, `edit`, or default to create) and entity ID.
 * - Validates the page name against `formsConfig`.
 * - Renders:
 *   - `<ViewCard />` for viewing all entities.
 *   - `<ViewDetailsCard />` for viewing details of a specific entity.
 *   - `<DynamicFormGenerator />` for editing or creating an entity.
 * 
 * @returns {JSX.Element} The appropriate component based on the current action and parameters.
 */

export default function DynamicFormPage() {
  const params = useParams();
  const pagyName = params.name as string || '';
  const urlParams = useSearchParams();
  const action = urlParams.get('action') || '';
  const id = urlParams.get('id') || '';

  if (!pagyName ||  !(pagyName in formsConfig)) {
    return <div>Invalid page name</div>;
  }
  
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
        entity={pagyName}
        id={id}
        mode="edit"
    />
    )
    
  }else{
    return (
      <DynamicFormGenerator
          entity={pagyName}
          mode="create"
      />
    )
  }

}

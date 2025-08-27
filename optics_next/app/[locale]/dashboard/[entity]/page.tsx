// 'use client';
// import { useParams,useSearchParams } from 'next/navigation';
// import { formsConfig } from '@/config/formsConfig';
// import DynamicFormGenerator from '@/components/generate/DynamicFormGenerator';
// import ViewDetailsCard from '@/components/view/ViewDetailsCard';
// import ViewCard from '@/components/view/ViewCard';

// /**
//  * DynamicFormPage is a dynamic page component that renders different views based on URL parameters.
//  * 
//  * - Uses `useParams` to extract the page name from the route.
//  * - Uses `useSearchParams` to determine the action (`viewAll`, `view`, `edit`, or default to create) and entity ID.
//  * - Validates the page name against `formsConfig`.
//  * - Renders:
//  *   - `<ViewCard />` for viewing all entities.
//  *   - `<ViewDetailsCard />` for viewing details of a specific entity.
//  *   - `<DynamicFormGenerator />` for editing or creating an entity.
//  * 
//  * @returns {JSX.Element} The appropriate component based on the current action and parameters.
//  */

// export default function DynamicFormPage() {
//   const params = useParams();
//   const pagyName = params.name as string || '';
//   const urlParams = useSearchParams();
//   const action = urlParams.get('action') || '';
//   const id = urlParams.get('id') || '';

//   if (!pagyName ||  !(pagyName in formsConfig)) {
//     return <div>Invalid page name</div>;
//   }
//   if (!['view', 'edit', 'create'].includes(action)) {
//     return <ViewCard entity={pagyName} />;
//   } 
//   if (action==='create') {
//       return (
//       <DynamicFormGenerator
//           entity={pagyName}
//       />
//       );
//   }else if(action === 'view' && id){
//     return (
//       <ViewDetailsCard
//         entity={pagyName}
//         id={id}
//       />
//     );
//   }else if (action === 'edit' && id) {
//     return (
//     <DynamicFormGenerator
//         entity={pagyName}
//         id={id}
//         mode="edit"
//     />
//     )
//   }else{
//       <ViewCard entity={pagyName} />
//   }

// }


// app/[entity]/page.tsx
'use client';
import { useParams } from 'next/navigation';
import { formsConfig } from '@/config/formsConfig';
import ViewCard from '@/components/view/ViewCard';


export default function EntityPage() {
  const params = useParams();
  const entity = params.entity as string || '';
  if (!(entity in formsConfig)) {
    return <div>Invalid entity</div>;
  }

  return <ViewCard entity={entity} />;
}

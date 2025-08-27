
'use client';
import { useParams} from 'next/navigation';
import { formsConfig } from '@/config/formsConfig';
import ViewDetailsCard from '@/components/view/ViewDetailsCard';


export default function EntityDetailsPage() {
  const params = useParams();
  const entity = params.entity as string || '';
  const id = params.id as string || '';
  if (!(entity in formsConfig)) {
    return <div>Invalid entity</div>;
  } 
    return <ViewDetailsCard entity={entity} id={id} />;
}

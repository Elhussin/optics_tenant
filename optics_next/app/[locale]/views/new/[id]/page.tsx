
import PageEditor from '../PageEditor';

interface EditPagePageProps {
  params: {
    id: string;
  };
}

export default function EditPagePage({ params }: EditPagePageProps) {
  const tenant = 'store6'; // Get from context/auth
  
  return <PageEditor pageId={parseInt(params.id)} tenant={tenant} />;
}


'use client';
// import PageEditor from '@/components/pages/PageEditor';
// import { useParams } from "next/navigation";


// export default function EditPagePage() {
  
//   const params = useParams();
//   const slug = params?.id as string;

  
//   return <PageEditor pageSlug={slug}/>;
// }

import MultilingualPageEditor from '@/components/pages/MultilingualPageEditor';
import { useParams } from "next/navigation";
// interface EditPagePageProps {
//   params: {
//     id: string;
//   };
// }

export default function EditPagePage() {

    const params = useParams();
  const slug = params?.id as string;
  return <MultilingualPageEditor pageId={slug} />;
}

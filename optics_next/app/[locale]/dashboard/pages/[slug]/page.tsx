'use client';

import MultilingualPageEditor from '@/components/pages/MultilingualPageEditor';
import { useParams,useSearchParams } from "next/navigation";
export default function EditPagePage() {

  const params = useParams();
  const slug = params?.slug as string;
  const searchParams = useSearchParams();

  if(slug === 'create'){
    const defaultPage = searchParams.get("add");

    return <MultilingualPageEditor defaultPage={defaultPage} />;
  }
  return <MultilingualPageEditor pageId={slug} />;

}

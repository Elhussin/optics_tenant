'use client';

import MultilingualPageEditor from '@/components/pages/MultilingualPageEditor';
import { useParams } from "next/navigation";
export default function EditPagePage() {

  const params = useParams();
  const pageId = params?.id as string;
  return <MultilingualPageEditor pageId={pageId} />;

}

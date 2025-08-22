'use client';

import MultilingualPageEditor from '@/components/pages/MultilingualPageEditor';
import { useParams } from "next/navigation";
export default function EditPagePage() {

    const params = useParams();
  const slug = params?.id as string;
  return <MultilingualPageEditor pageId={slug} />;
}

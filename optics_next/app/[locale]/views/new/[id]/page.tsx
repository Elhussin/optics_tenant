'use client';
import PageEditor from '../PageEditor';
import { useParams } from "next/navigation";


export default function EditPagePage() {
  
  const params = useParams();
  const slug = params?.id as string;

  
  return <PageEditor pageSlug={slug}/>;
}


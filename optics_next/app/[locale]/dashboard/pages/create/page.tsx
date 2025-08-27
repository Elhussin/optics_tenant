'use client';

import MultilingualPageEditor from '@/components/pages/MultilingualPageEditor';
import {useSearchParams } from "next/navigation";
export default function EditPagePage() {
  const searchParams = useSearchParams();
    const defaultData = searchParams.get("default");
    if(!defaultData){
        return <MultilingualPageEditor />;
    }
    return <MultilingualPageEditor defaultPage={defaultData} />;
  }


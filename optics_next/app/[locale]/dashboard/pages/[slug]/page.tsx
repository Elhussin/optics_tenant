'use client';

import MultilingualPageEditor from '@/components/pages/MultilingualPageEditor';
import { useParams,useSearchParams } from "next/navigation";
export default function EditPagePage() {

  const params = useParams();
  const slug = params?.slug as string;
  const searchParams = useSearchParams();
  const  pageId = searchParams.get("id");
  if(slug === 'create'){
    const defaultData = searchParams.get("default");
    if(!defaultData){
        return <MultilingualPageEditor />;
    }
    return <MultilingualPageEditor defaultPage={defaultData} />;
  }

  if(!pageId){
    return <div>No Page Found</div>;
  }
  return <MultilingualPageEditor pageId={pageId} />;

}



// 'use client';

// import MultilingualPageEditor from '@/components/pages/MultilingualPageEditor';
// import { useParams,useSearchParams } from "next/navigation";
// export default function EditPagePage() {

//   const params = useParams();
//   const id = params?.id as string;
//   const searchParams = useSearchParams();
//     const defaultPage = searchParams.get("add");
//   if(!id &&  defaultPage){
//     return <MultilingualPageEditor defaultPage={defaultPage} />;
//   }
  
//   return <MultilingualPageEditor pageId={id} />;

// }

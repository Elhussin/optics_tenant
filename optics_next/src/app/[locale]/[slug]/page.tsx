"use client";
import {useParams } from 'next/navigation';
import MultilingualPageDisplay from '@/src/features/pages/components/MultilingualPageDisplay';
import { useEffect, useState } from 'react';
import { Language } from '@/src/features/pages/types';
import { useFormRequest } from '@/src/shared/hooks/useFormRequest';
import { Loading4 } from '@/src/shared/components/ui/loding';
import { NotFound} from '@/src/shared/components/views/NotFound';

export default  function MultilingualPublicPage() {
  const params = useParams();
  const locale = params?.locale as string;
  const slug = params?.slug as string;
  const pageRequest = useFormRequest({ alias: `users_public_pages_retrieve` });
  const [pageData, setPageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const result = await pageRequest.submitForm({ slug: slug });
        if (result?.success) {
          setPageData(result.data);
        } else {
          setError('Page not found');

         
        }
      } catch (err) {
        setError('Error loading page');
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, [slug]);
// pageRequest
  if (loading) return <Loading4/>;
  if (error) {
    return (
      <>

      <NotFound error={error} />;
      </>
    )
  }
  
  return <MultilingualPageDisplay page={pageData} defaultLanguage={locale as Language} />;
}

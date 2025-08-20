"use client";
import { notFound } from 'next/navigation';
import PageDisplay from '../../../components/pages/page/PageDisplay';
import { useFormRequest } from '@/lib/hooks/useFormRequest';
import { useEffect, useState } from 'react';
import { useParams } from "next/navigation";


export default function PublicPage() {
  const [pageData, setPageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const pageName = params?.slug as string;
  const pageRequest = useFormRequest({ alias: `users_pages_retrieve` });

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const result = await pageRequest.submitForm({ slug: pageName });
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
  }, [pageName]);

  if (loading) return <div>Loading...</div>;
  if (error) {
    // notFound(); // Uncomment if you want to use Next.js notFound
    return <div>{error}</div>;
  }
  return <PageDisplay page={pageData} />;
}

// # app/[slug]/page.tsx
import { notFound } from 'next/navigation';
import PageDisplay from '../new/PageDisplay';
import { apiService } from '../new/api';

interface PublicPageProps {
  params: {
    slug: string;
  };
}

export default async function PublicPage({ params }: PublicPageProps) {
  try {
    const page = await apiService.getPageBySlug(params.slug);
    return <PageDisplay page={page} />;
  } catch (error) {
    notFound();
  }
}
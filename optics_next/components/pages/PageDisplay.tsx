'use client';

import { PageData } from '../../types/pages';
import Head from 'next/head';

interface PageDisplayProps {
  page: PageData;
}

const PageDisplay: React.FC<PageDisplayProps> = ({ page }) => {
  return (
    <>
      <Head>
        <title>{page.seo_title || page.title}</title>
        <meta name="description" content={page.meta_description} />
        <meta name="keywords" content={page.meta_keywords} />
        <meta property="og:title" content={page.seo_title || page.title} />
        <meta property="og:description" content={page.meta_description} />
      </Head>

      <div className="max-w-4xl mx-auto p-6">
        <article className="bg-white rounded-lg shadow-lg p-8">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {page.title}
            </h1>
            <div className="text-sm text-gray-500">
              Last updated: {new Date(page.updated_at).toLocaleDateString()}
            </div>
          </header>

          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </article>
      </div>
    </>
  );
};

export default PageDisplay;

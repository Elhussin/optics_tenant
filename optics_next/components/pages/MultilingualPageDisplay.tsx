'use client';

import { PageData, Language, getCurrentTranslation, LANGUAGES } from '@/types/pages';
import Head from 'next/head';
import { useState } from 'react';

interface MultilingualPageDisplayProps {
  page: PageData;
  defaultLanguage?: Language;
}

const MultilingualPageDisplay: React.FC<MultilingualPageDisplayProps> = ({ 
  page, 
  defaultLanguage = 'en' 
}) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(defaultLanguage);
  const currentTranslation = getCurrentTranslation(page, currentLanguage);
  const currentLangInfo = LANGUAGES[currentLanguage];

  // Get available languages for this page
  const availableLanguages = page.translations.filter(t => 
    t.title.trim() && t.content.trim()
  );

  return (
    <>
      <Head>
        <title>{currentTranslation.seo_title || currentTranslation.title}</title>
        <meta name="description" content={currentTranslation.meta_description} />
        <meta name="keywords" content={currentTranslation.meta_keywords} />
        <meta property="og:title" content={currentTranslation.seo_title || currentTranslation.title} />
        <meta property="og:description" content={currentTranslation.meta_description} />
        <link rel="canonical" href={`/${currentLanguage}/${currentTranslation.slug}`} />
        
        {/* Language alternates for SEO */}
        {availableLanguages.map(translation => (
          <link
            key={translation.language}
            rel="alternate"
            hrefLang={translation.language}
            href={`/${translation.language}/${translation.slug}`}
          />
        ))}
      </Head>

      <div className="max-w-4xl mx-auto p-6" dir={currentLangInfo.dir}>
        {/* Language Switcher */}
        {/* {availableLanguages.length > 1 && (
          <div className={`mb-6 flex gap-2 ${currentLangInfo.dir === 'rtl' ? 'justify-start' : 'justify-end'}`}>
            <div className="flex bg-gray-100 rounded-lg p-1">
              {availableLanguages.map(translation => {
                const langInfo = LANGUAGES[translation.language];
                const isActive = currentLanguage === translation.language;
                
                return (
                  <button
                    key={translation.language}
                    onClick={() => setCurrentLanguage(translation.language)}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {langInfo.flag} {langInfo.name}
                  </button>
                );
              })}
            </div>
          </div>
        )} */}

        <article className="bg-white rounded-lg shadow-lg p-8">
          <header className="mb-8">
            <h1 className={`text-4xl font-bold text-gray-900 mb-4 ${
              currentLangInfo.dir === 'rtl' ? 'text-right font-arabic' : 'text-left'
            }`}>
              {currentTranslation.title}
            </h1>
            <div className={`text-sm text-gray-500 ${
              currentLangInfo.dir === 'rtl' ? 'text-right' : 'text-left'
            }`}>
              {currentLangInfo.dir === 'rtl' 
                ? `آخر تحديث: ${new Date(page.updated_at).toLocaleDateString('ar-SA')}`
                : `Last updated: ${new Date(page.updated_at).toLocaleDateString()}`
              }
            </div>
          </header>

          <div 
            className={`prose prose-lg max-w-none ${
              currentLangInfo.dir === 'rtl' 
                ? 'prose-rtl text-right [&>*]:text-right' 
                : 'prose-ltr text-left'
            }`}
            dir={currentLangInfo.dir}
            dangerouslySetInnerHTML={{ __html: currentTranslation.content }}
          />
        </article>
      </div>
    </>
  );
};

export default MultilingualPageDisplay;
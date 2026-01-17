"use client";

import { PageData, Language, LANGUAGES } from "@/src/features/pages/types";
import { getCurrentTranslation } from "@/src/shared/utils/getCurrentTranslation";
import Head from "next/head";
import { useState } from "react";
import { GlassCard } from "@/src/shared/components/ui/GlassCard";
import { Badge } from "@/src/shared/components/ui/Badge";
import { EmptyState } from "@/src/shared/components/ui/EmptyState";
import { cn } from "@/src/shared/utils/cn";
import { Calendar, Globe, Languages } from "lucide-react";

interface MultilingualPageDisplayProps {
  page: PageData;
  defaultLanguage?: Language;
}

const MultilingualPageDisplay: React.FC<MultilingualPageDisplayProps> = ({
  page,
  defaultLanguage = "en",
}) => {
  const [currentLanguage, setCurrentLanguage] =
    useState<Language>(defaultLanguage);

  // Error handling for missing page data
  if (!page || !page.translations) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <EmptyState
          type="error"
          title="Page content unavailable"
          description="We encountered an error loading this page."
        />
      </div>
    );
  }

  const currentTranslation = getCurrentTranslation(page, currentLanguage);

  // Error handling for missing translation
  if (!currentTranslation) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <EmptyState
          type="warning"
          title="Content not available"
          description="Content is not available in this language."
        />
      </div>
    );
  }

  const currentLangInfo = LANGUAGES[currentLanguage];

  // Get available languages for this page
  const availableLanguages = page.translations.filter(
    (t) => t && t.title && t.title.trim() && t.content && t.content.trim()
  );

  return (
    <>
      <Head>
        <title>
          {currentTranslation.seo_title || currentTranslation.title}
        </title>
        <meta
          name="description"
          content={currentTranslation.meta_description}
        />
        <meta name="keywords" content={currentTranslation.meta_keywords} />
        <meta
          property="og:title"
          content={currentTranslation.seo_title || currentTranslation.title}
        />
        <meta
          property="og:description"
          content={currentTranslation.meta_description}
        />
        <link rel="canonical" href={`/${currentLanguage}/${page.slug}`} />

        {/* Language alternates for SEO */}
        {availableLanguages.map((translation) => (
          <link
            key={translation.language}
            rel="alternate"
            hrefLang={translation.language}
            href={`/${translation.language}/${page.slug}`}
          />
        ))}
      </Head>

      <div
        className="max-w-4xl mx-auto p-6 animate-fade-in"
        dir={currentLangInfo.dir}
      >
        {/* Language Selector
        {availableLanguages.length > 1 && (
          <div className="mb-6 flex justify-end">
            <div className="glass px-4 py-2 rounded-xl border border-border-main shadow-soft flex items-center gap-2">
              <Languages size={16} className="text-primary" />
              <span className="text-sm text-secondary font-medium mr-2">
                {currentLangInfo.dir === "rtl" ? "اللغة:" : "Language:"}
              </span>
              <div className="flex gap-2">
                {availableLanguages.map((translation) => {
                  const langInfo = LANGUAGES[translation.language];
                  return (
                    <button
                      key={translation.language}
                      onClick={() => setCurrentLanguage(translation.language)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                        "hover:scale-105 active:scale-95",
                        translation.language === currentLanguage
                          ? "bg-primary text-white shadow-sm"
                          : "bg-elevated hover:bg-elevated/80 text-secondary"
                      )}
                    >
                      <span className="mr-1">{langInfo.flag}</span>
                      {langInfo.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )} */}

        {/* Main Content Card */}
        <div className="relative group">
          {/* Background Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

          <GlassCard
            className="overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300"
            padding="none"
          >
            {/* Gradient Header Strip */}
            <div className="h-1.5 bg-gradient-to-r from-primary via-secondary to-primary animate-shimmer bg-[length:200%_100%]" />

            {/* Article Content */}
            <article className="p-8 md:p-12">
              {/* Header */}
              <header className="mb-8 space-y-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <h1
                    className={cn(
                      "text-4xl md:text-5xl font-bold text-main leading-tight flex-1",
                      currentLangInfo.dir === "rtl" && "font-arabic"
                    )}
                  >
                    {currentTranslation.title}
                  </h1>

                  <Badge variant="info" size="md" className="shrink-0">
                    <Globe size={14} className="mr-1" />
                    {currentLangInfo.name}
                  </Badge>
                </div>

                {/* Meta Information */}
                <div className="flex items-center gap-4 text-sm text-secondary pt-4 border-t border-border-main/30">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-primary" />
                    <span>
                      {currentLangInfo.dir === "rtl"
                        ? `آخر تحديث: ${new Date(
                            page.updated_at
                          ).toLocaleDateString("ar-SA")}`
                        : `Last updated: ${new Date(
                            page.updated_at
                          ).toLocaleDateString()}`}
                    </span>
                  </div>
                </div>
              </header>

              {/* Content */}
              <div
                className={cn(
                  "prose prose-lg max-w-none",
                  "prose-headings:text-main prose-headings:font-bold",
                  "prose-p:text-main prose-p:leading-relaxed",
                  "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
                  "prose-strong:text-main",
                  "prose-code:text-primary prose-code:bg-primary/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded",
                  "prose-pre:bg-elevated prose-pre:border prose-pre:border-border-main",
                  "prose-blockquote:border-l-primary prose-blockquote:bg-primary/5 prose-blockquote:py-2",
                  "prose-img:rounded-xl prose-img:shadow-lg",
                  currentLangInfo.dir === "rtl"
                    ? "prose-rtl [&>*]:text-right prose-blockquote:border-r-primary prose-blockquote:border-l-0"
                    : "prose-ltr"
                )}
                dir={currentLangInfo.dir}
                dangerouslySetInnerHTML={{ __html: currentTranslation.content }}
              />
            </article>
          </GlassCard>
        </div>
      </div>
    </>
  );
};

export default MultilingualPageDisplay;

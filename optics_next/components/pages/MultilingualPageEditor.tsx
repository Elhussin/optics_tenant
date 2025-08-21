'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RichTextEditor from './page/RichTextEditor';
import { PageData, CreatePageData, Language, PageTranslation, LANGUAGES, getTranslation } from '@/types/pages';
import { useFormRequest } from '@/lib/hooks/useFormRequest';
import { toast } from 'sonner';
interface MultilingualPageEditorProps {
  pageId?: number | string;
}

const MultilingualPageEditor: React.FC<MultilingualPageEditorProps> = ({ pageId }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState<Language>('en');
  const [formData, setFormData] = useState<CreatePageData>({

    default_language: 'en',
    translations: [
      {
        language: 'en',
        title: '',
        content: '',
        seo_title: '',
        meta_description: '',
        meta_keywords: '',
      },
      {
        language: 'ar',
        title: '',
        content: '',
        seo_title: '',
        meta_description: '',
        meta_keywords: '',
      },
    ],
    is_published: false,
    slug: ''
  });

   const pageRequest = useFormRequest({ alias: `users_pages_retrieve` });
   const createRequest = useFormRequest({ alias: `users_pages_create` });
   const updateRequest = useFormRequest({ alias: `users_pages_update` });


  useEffect(() => {
    if (pageId) {
      loadPage();
    }
  }, [pageId]);

  const loadPage = async () => {
    try {
      setLoading(true);
    //   const page = await apiService.getPage(pageId!);
      const page = await pageRequest.submitForm({ slug: pageId });
      setFormData({
        default_language: page.default_language,

        translations: page.translations.length > 0 ? page.translations : [
          {
            language: 'en',
            title: '',

            content: '',
            seo_title: '',
            meta_description: '',
            meta_keywords: '',
          },
          {
            language: 'ar',
            title: '',
            content: '',
            seo_title: '',
            meta_description: '',
            meta_keywords: '',
          },
        ],
        slug: page.slug,
        is_published: page.is_published,
      });
      setActiveLanguage(page.default_language);
    } catch (error) {
      console.error('Error loading page:', error);
      toast('Error loading page');
    } finally {
      setLoading(false);
    }
  };



  const generateSlug = (title: string, language: Language) => {
    if (language === 'ar') {
      // For Arabic, create a transliterated slug or use English equivalent
      return title
        .replace(/[\u0600-\u06FF]/g, '') // Remove Arabic characters
        .replace(/\s+/g, '-')
        .toLowerCase()
        .trim();
    }
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const updateTranslation = (language: Language, field: keyof PageTranslation, value: string) => {
    setFormData(prev => ({
      ...prev,
      translations: prev.translations.map(t => {
        if (t.language === language) {
          const updated = { ...t, [field]: value };
          
          // Auto-generate slug and SEO title when title changes
          if (field === 'title') {
            // updated.slug = generateSlug(value, language);
            updated.seo_title = value;
          }
          
          return updated;
        }
        return t;
      }),
    }));
  };

  const getCurrentTranslation = () => {
    return formData.translations.find(t => t.language === activeLanguage) || formData.translations[0];
  };

  const getTranslationCompleteness = (language: Language) => {
    const translation = formData.translations.find(t => t.language === language);
    if (!translation) return 0;
    
    const fields = ['title', 'slug', 'content', 'seo_title'];
    const completedFields = fields.filter(field => translation[field as keyof PageTranslation]?.toString().trim());
    return Math.round((completedFields.length / fields.length) * 100);
  };

  const handleSave = async () => {
    console.log(formData)
    try {
      setSaving(true);
      
      // Validate that at least default language has required fields
      const defaultTranslation = formData.translations.find(t => t.language === formData.default_language);
      if (!defaultTranslation?.title.trim()) {
        toast(`Please provide a title for the default language (${LANGUAGES[formData.default_language].name})`);
        return;
      }
      
      if (pageId) {
        const result = await updateRequest.submitForm({ slug: pageId,formData,onSuccess: () => {          toast('Page updated successfully!');
        },onError: () => {
          toast('Error updating page');
        } });

      } else {
        const result = await createRequest.submitForm(formData );
        if (result?.success) {
          toast('Page created successfully!');
          router.push(`/admin/pages/${result.data.slug}`);
        }
      }
    } catch (error) {
      console.error('Error saving page:', error);
      toast('Error saving page');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  const currentTranslation = getCurrentTranslation();
  const currentLangInfo = LANGUAGES[activeLanguage];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header with language tabs */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">
              {pageId ? 'Edit Page' : 'Create New Page'}
            </h1>
            
            {/* Default Language Selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Default Language:</label>
              <select
                value={formData.default_language}
                onChange={(e) => setFormData(prev => ({ ...prev, default_language: e.target.value as Language }))}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                {Object.entries(LANGUAGES).map(([code, lang]) => (
                  <option key={code} value={code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Language Tabs */}
          <div className="flex space-x-1">
            {Object.entries(LANGUAGES).map(([code, lang]) => {
              const completeness = getTranslationCompleteness(code as Language);
              const isActive = activeLanguage === code;
              
              return (
                <button
                  key={code}
                  onClick={() => setActiveLanguage(code as Language)}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-blue-500'
                      : 'bg-gray-50 text-gray-700 border-transparent hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                    {formData.default_language === code && (
                      <span className="text-xs bg-green-100 text-green-800 px-1 rounded">DEFAULT</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {completeness}% complete
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content for active language */}
        <div className={`p-6 ${currentLangInfo.dir === 'rtl' ? 'text-right' : 'text-left'}`} dir={currentLangInfo.dir}>
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title ({currentLangInfo.name})
                </label>
                <input
                  type="text"
                  value={currentTranslation.title}
                  onChange={(e) => updateTranslation(activeLanguage, 'title', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={`Enter page title in ${currentLangInfo.name}`}
                  dir={currentLangInfo.dir}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug ({currentLangInfo.name})
                </label>
                  <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="page-url-slug"
                  dir="ltr"
                />
              </div>
                          </div>
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug ({currentLangInfo.name})
                </label>
                {activeLanguage === 'en' ?(
                <input
                  type="text"
                  value={currentTranslation.slug}
                  onChange={(e) => updateTranslation(activeLanguage, 'slug', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="page-url-slug"
                  dir="ltr"
                />
            ):
            (
                <input
                  type="text"
                  value={formData.translations.find(t => t.language === 'en')?.slug}
                  onChange={(e) => updateTranslation(activeLanguage, 'slug', e.target.value)}
                  disabled
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent opacity-50"
                  dir="ltr"
                />

              )}
              </div> */}
                {/* <label className="block mb-2 text-sm font-medium text-gray-700">
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="page-url-slug"
                  dir="ltr"
                />

 
                 </div> */}
            {/* Content Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content ({currentLangInfo.name})
              </label>
              
              <RichTextEditor
                content={currentTranslation.content}
                onChange={(content) => updateTranslation(activeLanguage, 'content', content)}
                language={activeLanguage}
                placeholder={`Start writing in ${currentLangInfo.name}...`}
              />
            </div>

            {/* SEO Fields */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">SEO Settings ({currentLangInfo.name})</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Title
                  </label>
                  <input
                    type="text"
                    value={currentTranslation.seo_title}
                    onChange={(e) => updateTranslation(activeLanguage, 'seo_title', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="SEO optimized title"
                    dir={currentLangInfo.dir}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    value={currentTranslation.meta_description}
                    onChange={(e) => updateTranslation(activeLanguage, 'meta_description', e.target.value)}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief description for search engines"
                    dir={currentLangInfo.dir}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Keywords
                  </label>
                  <input
                    type="text"
                    value={currentTranslation.meta_keywords}
                    onChange={(e) => updateTranslation(activeLanguage, 'meta_keywords', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="keyword1, keyword2, keyword3"
                    dir={currentLangInfo.dir}
                  />
                </div>
              </div>
            </div>

            {/* Publication Settings */}
            <div className="border-t pt-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={formData.is_published}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_published: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_published" className="ml-2 text-sm font-medium text-gray-700">
                  Publish this page
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-6 border-t">
              <button
                onClick={() => router.back()}
                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={saving || !currentTranslation.title.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {saving ? 'Saving...' : pageId ? 'Update Page' : 'Create Page'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultilingualPageEditor;
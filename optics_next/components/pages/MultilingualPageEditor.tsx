'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import RichTextEditor from './RichTextEditor';
import { CreatePageData, Language, PageTranslation, LANGUAGES } from '@/types/pages';
import { useFormRequest } from '@/lib/hooks/useFormRequest';
import { safeToast } from '@/lib/utils/toastService';
import { Loading4 } from '../ui/loding';
import { defaultPublicPages } from '@/constants/defaultPublicPages';

interface MultilingualPageEditorProps {
  pageId?: string;
  defaultPage?: string | null;
}
type FormError = {
  message: string;
};

const MultilingualPageEditor: React.FC<MultilingualPageEditorProps> = ({ pageId, defaultPage }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState<Language>('en');

  const [formErrors, setFormErrors] = useState<{ [key: string]: FormError }>({});

  const [formData, setFormData] = useState<CreatePageData | null>(null);
  
  const pageRequest = useFormRequest({ alias: `users_pages_retrieve` });
  const createRequest = useFormRequest({ alias: `users_pages_create` });
  const updateRequest = useFormRequest({ alias: `users_pages_partial_update` });

  // دالة لتوليد slug من العنوان
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // تحديث ترجمة محددة
  const updateTranslation = (language: Language, field: keyof PageTranslation, value: string) => {
    setFormData(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        translations: prev.translations.map(t => {
          if (t.language === language) {
            const updated = { ...t, [field]: value };
            if (field === 'title') {
              updated.seo_title = value;
            }
            return updated;
          }
          return t;
        }),
      };
    });
  };

  // الحصول على الترجمة الحالية للغة النشطة
  const getCurrentTranslation = () => {
    if (!formData) return null;
    return formData.translations.find(t => t.language === activeLanguage) || formData.translations[0];
  };

  // حساب نسبة اكتمال الترجمة للغة معينة
  const getTranslationCompleteness = (language: Language) => {
    if (!formData) return 0;
    
    const translation = formData.translations.find(t => t.language === language);
    if (!translation) return 0;

    const fields = ['title', 'content', 'seo_title'];
    const completedFields = fields.filter(field => translation[field as keyof PageTranslation]?.toString().trim());
    return Math.round((completedFields.length / fields.length) * 100);
  };

  // تحميل البيانات من الصفحة الافتراضية إذا تم توفيرها
  useEffect(() => {
    if (defaultPage) {
      const def = defaultPublicPages[defaultPage];
      if (def) {
        setFormData({
          default_language: def.default_language || 'en',
          translations: Object.entries(LANGUAGES).map(([code]) => {
            const existing = def.translations.find(t => t.language === code);
            return existing || {
              language: code as Language,
              title: '',
              content: '',
              seo_title: '',
              meta_description: '',
              meta_keywords: '',
            };
          }),
          is_published: def.is_published || false,
          slug: def.slug || '',
        });
      }
    } else if (!pageId) {
      // تهيئة بيانات جديدة فقط عندما لا يكون هناك pageId ولا defaultPage
      setFormData({
        default_language: 'en',
        translations: Object.entries(LANGUAGES).map(([code]) => ({
          language: code as Language,
          title: '',
          content: '',
          seo_title: '',
          meta_description: '',
          meta_keywords: '',
        })),
        is_published: false,
        slug: ''
      });
    }
  }, [pageId, defaultPage]);

  
  const loadPage = useCallback(async () => {
    try {
      setLoading(true);
      const res = await pageRequest.submitForm({ id: pageId });
      const page = res.data;
  
      // تأكد من وجود جميع اللغات المطلوبة
      const translations = Object.entries(LANGUAGES).map(([code]) => {
        const existing = page.translations.find((t: PageTranslation) => t.language === code);
        return existing || {
          language: code as Language,
          title: '',
          content: '',
          seo_title: '',
          meta_description: '',
          meta_keywords: '',
        };
      });
  
      setFormData({
        ...page,
        translations,
      });
      setActiveLanguage(page.default_language);
    } catch (error) {
      safeToast('Error loading page', { type: "error" });
    } finally {
      setLoading(false);
    }
  }, [pageId, pageRequest]); // ← ضيف كل الديبندنسيز اللي بتستخدمها

  
  
  useEffect(() => {
    if (pageId) {
      loadPage();
    }
  }, [pageId,loadPage]);



  const handleSave = async () => {
    try {
      setSaving(true);
      
      if (!formData) {
        safeToast('Form data is not initialized',{type:"error"});
        return;
      }

      // التحقق من وجود عنوان للغة الافتراضية
      const defaultTranslation = formData.translations.find(t => t.language === formData.default_language);
      if (!defaultTranslation?.title.trim()) {
        safeToast(`Please provide a title for the default language (${LANGUAGES[formData.default_language].name})`, { type: "error" });
        return;
      }

      // توليد slug للصفحات الجديدة فقط
      const finalFormData = { ...formData };
      if (!pageId && !finalFormData.slug.trim()) {
        finalFormData.slug = generateSlug(defaultTranslation.title);
      }

      let result;
      if (pageId) {
        console.log("Updating Page:", finalFormData);
        result = await updateRequest.submitForm({ id: pageId, formData: finalFormData });
        console.log('updateRequest result', result);
        if (result?.success) {
          safeToast('Page updated successfully!', { type: "success" });
          setFormData(result.data);
        } else {
          setFormErrors(updateRequest.errors || {});
          safeToast('Error updating page', { type: "error" });

        }
      } else {
        result = await createRequest.submitForm(finalFormData);
        if (result?.success) {
          safeToast('Page created successfully!', { type: "success" } );

        } else {
          setFormErrors(createRequest.errors || {});
          safeToast('Error creating page', { type: "error" });
        }
      }
    } catch (error) {
      safeToast('Error saving page', { type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !formData) {
    return <Loading4 />;
  }

  const currentTranslation = getCurrentTranslation();
  const currentLangInfo = LANGUAGES[activeLanguage];

  if (!currentTranslation) {
    return <div>Error: No translation found for active language</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-surface rounded-lg shadow-lg">
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
                onChange={(e) => setFormData(prev => prev ? { ...prev, default_language: e.target.value as Language } : prev)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                {Object.entries(LANGUAGES).map(([code, lang]) => (
                  <option className='bg-surface' key={code} value={code}>
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
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${isActive
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
          
          {/* Page URL Field */}
          <div className="mt-4">
            <label className="block font-medium">Page URL</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => {
                if (!pageId) {
                  setFormData(prev => prev ? { ...prev, slug: e.target.value } : prev);
                }
              }}
              disabled={!!pageId}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              placeholder="Page URL will be generated from title"
            />
              {formErrors?.slug?.message && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.slug.message}
                </p>
              )}

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
                {formErrors?.title && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.title.message as string}</p>
                )}
              </div>
            </div>

            {/* Content Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content ({currentLangInfo.name})
              </label>
              {activeLanguage==='en' && (
              <RichTextEditor
                content={currentTranslation.content}
                onChange={(content) => updateTranslation(activeLanguage, 'content', content)}
                language={activeLanguage}
                placeholder={`Start writing in ${currentLangInfo.name}...`}
              />
              )}
              {activeLanguage==='ar' && (
                <RichTextEditor
                  content={currentTranslation.content}
                  onChange={(content) => updateTranslation(activeLanguage, 'content', content)}
                  language={activeLanguage}
                  placeholder={`Start writing in ${currentLangInfo.name}...`}
                />
              )}
              {formErrors?.content && (
                <p className="text-red-500 text-sm mt-1">{formErrors.content.message as string}</p>
              )}

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
                  {formErrors?.seo_title && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.seo_title.message as string}</p>
                  )}
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
                  {formErrors?.meta_description && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.meta_description.message as string}</p>
                  )}
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
                  {formErrors.meta_keywords && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.meta_keywords.message as string}</p>
                  )}
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
                  onChange={(e) => setFormData(prev => prev ? { ...prev, is_published: e.target.checked } : prev)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_published" className="ml-2 text-sm font-medium text-gray-700">
                  Publish this page
                </label>
              </div>
              {formErrors.root && (
              <p className="error-text">{formErrors.root.message as string}</p>
            )}
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
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
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
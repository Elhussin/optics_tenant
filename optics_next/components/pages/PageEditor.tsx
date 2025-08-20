// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import RichTextEditor from './page/RichTextEditor0';
// import { CreatePageData } from '@types/pages';
// import { useFormRequest } from '@/lib/hooks/useFormRequest';
// import { toast } from 'sonner';
// interface PageEditorProps {
//   pageSlug?: string;
// }

// const PageEditor: React.FC<PageEditorProps> = ({ pageSlug }) => {
//   console.log(pageSlug)
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);

//   const [formData, setFormData] = useState<CreatePageData>({
//     title: '',
//     slug: '',
//     content: '',
//     seo_title: '',
//     meta_description: '',
//     meta_keywords: '',
//   });

//   const pageRequest = useFormRequest({ alias: `users_pages_retrieve` });
//   const createRequest = useFormRequest({ alias: `users_pages_create` });
//   const updateRequest = useFormRequest({ alias: `users_pages_update` });

//   useEffect(() => {
//     if (!pageSlug) return;

//     const loadPage = async () => {
//       try {
//         setLoading(true);
//         const result = await pageRequest.submitForm({ slug: pageSlug });
//         console.log(result)
//         if (result?.success) {
//           setFormData({
//             title: result.data.title,
//             slug: result.data.slug,
//             content: result.data.content,
//             seo_title: result.data.seo_title,
//             meta_description: result.data.meta_description,
//             meta_keywords: result.data.meta_keywords,
//           });
//         } else {
//           console.log('Page not found');
//         }
//       } catch (err) {
//         console.log('Error loading page');
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadPage();
//   }, [pageSlug]);

//   const generateSlug = (title: string) => {
//     return title
//       .toLowerCase()
//       .replace(/[^a-z0-9 -]/g, '')
//       .replace(/\s+/g, '-')
//       .replace(/-+/g, '-')
//       .trim();
//   };

//   const handleTitleChange = (title: string) => {
//     setFormData(prev => ({
//       ...prev,
//       title,
//       slug: generateSlug(title),
//       seo_title: title,
//     }));
//   };

//   const handleSave = async () => {
//     try {
//       setSaving(true);

//       if (pageSlug) {
//         console.log(formData)
//         const result = await updateRequest.submitForm({ slug: pageSlug,formData,onSuccess: () => {
//           toast('Page updated successfully!');
//         },onError: () => {
//           toast('Error updating page');
//         } });
//         console.log(result)
//       } else {

//         const result = await createRequest.submitForm(formData );
//         if (result?.success) {
//           toast('Page created successfully!');
//           router.push(`/admin/pages/${result.data.slug}`);
//         }
//       }
//     } catch (error) {
//       toast('Error saving page');
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) {
//     return <div className="flex justify-center p-8">Loading...</div>;
//   }


//   return (
//     <div className="max-w-4xl mx-auto p-6">
//       <div className="bg-white rounded-lg shadow-lg p-6">
//         <h1 className="text-2xl font-bold mb-6">
//           {pageSlug ? 'Edit Page' : 'Create New Page'}
//         </h1>

//         <div className="space-y-6">
//           {/* Basic Info */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Title
//               </label>
//               <input
//                 type="text"
//                 value={formData.title}
//                 onChange={(e) => handleTitleChange(e.target.value)}
//                 className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 placeholder="Enter page title"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Slug
//               </label>
//               <input
//                 type="text"
//                 value={formData.slug}
//                 onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
//                 className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 placeholder="page-url-slug"
//               />
//             </div>
//           </div>

//           {/* Content Editor */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Content
//             </label>
//             <RichTextEditor
//               content={formData.content}
//               onChange={(content) => setFormData(prev => ({ ...prev, content }))}
//             />
//           </div>

//           {/* SEO Fields */}
//           <div className="border-t pt-6">
//             <h3 className="text-lg font-semibold mb-4">SEO Settings</h3>

//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   SEO Title
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.seo_title}
//                   onChange={(e) => setFormData(prev => ({ ...prev, seo_title: e.target.value }))}
//                   className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="SEO optimized title"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Meta Description
//                 </label>
//                 <textarea
//                   value={formData.meta_description}
//                   onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
//                   rows={3}
//                   className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="Brief description for search engines"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Meta Keywords
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.meta_keywords}
//                   onChange={(e) => setFormData(prev => ({ ...prev, meta_keywords: e.target.value }))}
//                   className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="keyword1, keyword2, keyword3"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Actions */}
//           <div className="flex justify-between pt-6 border-t">
//             <button
//               onClick={() => router.back()}
//               className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
//             >
//               Cancel
//             </button>

//             <button
//               onClick={handleSave}
//               disabled={saving || !formData.title.trim()}
//               className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
//             >
//               {saving ? 'Saving...' : pageSlug ? 'Update Page' : 'Create Page'}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PageEditor;


'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RichTextEditor from './page/RichTextEditor0';
import { useFormRequest } from '@/lib/hooks/useFormRequest';
import { toast } from 'sonner';

interface PageEditorProps {
  pageSlug?: string;
}

const PageEditor: React.FC<PageEditorProps> = ({ pageSlug }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // اللغة الحالية
  const [currentLang, setCurrentLang] = useState<'en' | 'ar'>('en');

  // formData متعدد اللغات
  const [formData, setFormData] = useState({
    translations: {
      en: {
        title: '',
        slug: '',
        content: '',
        seo_title: '',
        meta_description: '',
        meta_keywords: '',
      },
      ar: {
        title: '',
        slug: '',
        content: '',
        seo_title: '',
        meta_description: '',
        meta_keywords: '',
      },
    },
  });

  const pageRequest = useFormRequest({ alias: `users_pages_retrieve` });
  const createRequest = useFormRequest({ alias: `users_pages_create` });
  const updateRequest = useFormRequest({ alias: `users_pages_update` });

  useEffect(() => {
    if (!pageSlug) return;

    const loadPage = async () => {
      try {
        setLoading(true);
        const result = await pageRequest.submitForm({ slug: pageSlug });
        if (result?.success) {
          setFormData(result.data); // لازم الـ API يرجع بنفس الشكل { translations: { en: {...}, ar: {...} } }
        } else {
          console.log('Page not found');
        }
      } catch (err) {
        console.log('Error loading page');
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [pageSlug]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      if (pageSlug) {
        const result = await updateRequest.submitForm({
          slug: pageSlug,
          formData,
        });
        if (result?.success) toast('Page updated successfully!');
      } else {
        const result = await createRequest.submitForm(formData);
        if (result?.success) {
          toast('Page created successfully!');
          router.push(`/admin/pages/${result.data.slug}`);
        }
      }
    } catch (error) {
      toast('Error saving page');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">
          {pageSlug ? 'Edit Page' : 'Create New Page'}
        </h1>

        {/* Language Switch */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setCurrentLang('en')}
            className={`px-4 py-2 rounded ${
              currentLang === 'en'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setCurrentLang('ar')}
            className={`px-4 py-2 rounded ${
              currentLang === 'ar'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            العربية
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title ({currentLang.toUpperCase()})
              </label>
              <input
                type="text"
                value={formData.translations[currentLang].title}
                onChange={(e) =>
                  setFormData((prev) => ({
                    translations: {
                      ...prev.translations,
                      [currentLang]: {
                        ...prev.translations[currentLang],
                        title: e.target.value,
                        slug: generateSlug(e.target.value),
                        seo_title: e.target.value,
                      },
                    },
                  }))
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter page title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug ({currentLang.toUpperCase()})
              </label>
              <input
                type="text"
                value={formData.translations[currentLang].slug}
                onChange={(e) =>
                  setFormData((prev) => ({
                    translations: {
                      ...prev.translations,
                      [currentLang]: {
                        ...prev.translations[currentLang],
                        slug: e.target.value,
                      },
                    },
                  }))
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="page-url-slug"
              />
            </div>
          </div>

          {/* Content Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content ({currentLang.toUpperCase()})
            </label>
            <RichTextEditor
              content={formData.translations[currentLang].content}
              onChange={(content) =>
                setFormData((prev) => ({
                  translations: {
                    ...prev.translations,
                    [currentLang]: {
                      ...prev.translations[currentLang],
                      content,
                    },
                  },
                }))
              }
            />
          </div>

          {/* SEO Fields */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">
              SEO Settings ({currentLang.toUpperCase()})
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO Title
                </label>
                <input
                  type="text"
                  value={formData.translations[currentLang].seo_title}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      translations: {
                        ...prev.translations,
                        [currentLang]: {
                          ...prev.translations[currentLang],
                          seo_title: e.target.value,
                        },
                      },
                    }))
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="SEO optimized title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description
                </label>
                <textarea
                  value={formData.translations[currentLang].meta_description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      translations: {
                        ...prev.translations,
                        [currentLang]: {
                          ...prev.translations[currentLang],
                          meta_description: e.target.value,
                        },
                      },
                    }))
                  }
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description for search engines"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Keywords
                </label>
                <input
                  type="text"
                  value={formData.translations[currentLang].meta_keywords}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      translations: {
                        ...prev.translations,
                        [currentLang]: {
                          ...prev.translations[currentLang],
                          meta_keywords: e.target.value,
                        },
                      },
                    }))
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>
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
              disabled={saving || !formData.translations[currentLang].title.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {saving ? 'Saving...' : pageSlug ? 'Update Page' : 'Create Page'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageEditor;

// "use client";
// import React, { useState } from "react";
// import dynamic from "next/dynamic";

// const TenantPageBuilder = dynamic(() => import("./TenantPageBuilder"), { ssr: false });

// interface PageEditorProps {
//   initialData?: {
//     title?: string;
//     slug?: string;
//     content_json?: { ar: any[]; en: any[] };
//     seo_title?: string;
//     meta_description?: string;
//     meta_keywords?: string;
//   };
//   onSave: (data: any) => void;
// }

// export default function PageEditor({ initialData, onSave }: PageEditorProps) {
//   const [title, setTitle] = useState(initialData?.title || "");
//   const [slug, setSlug] = useState(initialData?.slug || "");
//   const [seoTitle, setSeoTitle] = useState(initialData?.seo_title || "");
//   const [metaDescription, setMetaDescription] = useState(initialData?.meta_description || "");
//   const [metaKeywords, setMetaKeywords] = useState(initialData?.meta_keywords || "");
//   const [contentJson, setContentJson] = useState(initialData?.content_json || { ar: [], en: [] });

//   const save = () => {
//     onSave({
//       title,
//       slug,
//       seo_title: seoTitle,
//       meta_description: metaDescription,
//       meta_keywords: metaKeywords,
//       content_json: contentJson,
//     });
//   };

//   return (
//     <div className="space-y-4 p-4">
//       <input
//         type="text"
//         placeholder="Page Title"
//         value={title}
//         onChange={(e) => setTitle(e.target.value)}
//         className="border p-2 w-full"
//       />
//       <input
//         type="text"
//         placeholder="Slug"
//         value={slug}
//         onChange={(e) => setSlug(e.target.value)}
//         className="border p-2 w-full"
//       />
//       <input
//         type="text"
//         placeholder="SEO Title"
//         value={seoTitle}
//         onChange={(e) => setSeoTitle(e.target.value)}
//         className="border p-2 w-full"
//       />
//       <textarea
//         placeholder="Meta Description"
//         value={metaDescription}
//         onChange={(e) => setMetaDescription(e.target.value)}
//         className="border p-2 w-full"
//       />
//       <input
//         type="text"
//         placeholder="Meta Keywords"
//         value={metaKeywords}
//         onChange={(e) => setMetaKeywords(e.target.value)}
//         className="border p-2 w-full"
//       />

//       <TenantPageBuilder
//         initialContent={contentJson}
//         onSave={(json) => setContentJson(json)}
//       />

//       <button onClick={save} className="bg-blue-600 text-white px-4 py-2 rounded">
//         Save Page
//       </button>
//     </div>
//   );
// }
"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";

// Dynamic import to prevent hydration issues
const TenantPageBuilder = dynamic(() => import("./TenantPageBuilder"), { 
  ssr: false,
  loading: () => <div className="p-4">Loading page builder...</div>
});

interface PageEditorProps {
  initialData?: {
    title?: string;
    slug?: string;
    content_json?: { ar: any[]; en: any[] };
    seo_title?: string;
    meta_description?: string;
    meta_keywords?: string;
  };
  onSave: (data: any) => void;
}

export default function PageEditor({ initialData, onSave }: PageEditorProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [seoTitle, setSeoTitle] = useState(initialData?.seo_title || "");
  const [metaDescription, setMetaDescription] = useState(initialData?.meta_description || "");
  const [metaKeywords, setMetaKeywords] = useState(initialData?.meta_keywords || "");
  const [contentJson, setContentJson] = useState(initialData?.content_json || { ar: [], en: [] });
  const [isSaving, setIsSaving] = useState(false);

  // Auto-generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    
    // Auto-generate slug if it's empty or matches the previous title
    if (!slug || slug === title.toLowerCase().replace(/\s+/g, '-')) {
      setSlug(newTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
    }
  };

  const save = async () => {
    setIsSaving(true);
    try {
      const data = {
        title,
        slug,
        seo_title: seoTitle,
        meta_description: metaDescription,
        meta_keywords: metaKeywords,
        content_json: contentJson,
      };
      
      await onSave(data);
    } catch (error) {
      console.error('Error saving page:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-4 max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-2xl border shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Page Information</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Page Title</label>
            <input
              type="text"
              placeholder="Enter page title"
              value={title}
              onChange={handleTitleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <input
              type="text"
              placeholder="page-url-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border shadow-sm">
        <h2 className="text-xl font-semibold mb-4">SEO Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SEO Title</label>
            <input
              type="text"
              placeholder="SEO optimized title"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
            <textarea
              placeholder="Brief description for search engines"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              rows={3}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meta Keywords</label>
            <input
              type="text"
              placeholder="keyword1, keyword2, keyword3"
              value={metaKeywords}
              onChange={(e) => setMetaKeywords(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Page Content</h2>
        
        {/* <TenantPageBuilder
          initial={contentJson}
          onSave={(json) => setContentJson(json)}
        />*/}
      </div> 

      <div className="flex justify-end space-x-4">
        <button 
          onClick={save} 
          disabled={isSaving}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Saving...
            </>
          ) : (
            <>
              💾 Save Page
            </>
          )}
        </button>
      </div>
    </div>
  );
}
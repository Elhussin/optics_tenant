'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RichTextEditor from './RichTextEditor';
import { PageData, CreatePageData } from './types';
import { apiService } from './api';

interface PageEditorProps {
  pageId?: number;
  tenant: string;
}

const PageEditor: React.FC<PageEditorProps> = ({ pageId, tenant }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<CreatePageData>({
    tenant,
    title: '',
    slug: '',
    content: '',
    seo_title: '',
    meta_description: '',
    meta_keywords: '',
  });

  useEffect(() => {
    if (pageId) {
      loadPage();
    }
  }, [pageId]);

  const loadPage = async () => {
    try {
      setLoading(true);
      const page = await apiService.getPage(pageId!);
      setFormData({
        tenant: page.tenant,
        title: page.title,
        slug: page.slug,
        content: page.content,
        seo_title: page.seo_title,
        meta_description: page.meta_description,
        meta_keywords: page.meta_keywords,
      });
    } catch (error) {
      console.error('Error loading page:', error);
      alert('Error loading page');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title),
      seo_title: title,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      if (pageId) {
        await apiService.updatePage(pageId, formData);
        alert('Page updated successfully!');
      } else {
        console.l
        const newPage = await apiService.createPage(formData);
        alert('Page created successfully!');
        router.push(`/admin/pages/${newPage.id}`);
      }
    } catch (error) {
      console.error('Error saving page:', error);
      alert('Error saving page');
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
          {pageId ? 'Edit Page' : 'Create New Page'}
        </h1>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter page title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="page-url-slug"
              />
            </div>
          </div>

          {/* Content Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <RichTextEditor
              content={formData.content}
              onChange={(content) => setFormData(prev => ({ ...prev, content }))}
            />
          </div>

          {/* SEO Fields */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">SEO Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO Title
                </label>
                <input
                  type="text"
                  value={formData.seo_title}
                  onChange={(e) => setFormData(prev => ({ ...prev, seo_title: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="SEO optimized title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description
                </label>
                <textarea
                  value={formData.meta_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
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
                  value={formData.meta_keywords}
                  onChange={(e) => setFormData(prev => ({ ...prev, meta_keywords: e.target.value }))}
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
              disabled={saving || !formData.title.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {saving ? 'Saving...' : pageId ? 'Update Page' : 'Create Page'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageEditor;
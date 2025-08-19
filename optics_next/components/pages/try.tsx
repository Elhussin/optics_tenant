// # 9. Django Model Structure for Multilingual Pages

// ```python
// # models.py
// from django.db import models
// from django.utils.translation import gettext_lazy as _

// class Page(models.Model):
//     LANGUAGE_CHOICES = [
//         ('en', 'English'),
//         ('ar', 'Arabic'),
//     ]
    
//     tenant = models.CharField(max_length=100)
//     default_language = models.CharField(
//         max_length=2, 
//         choices=LANGUAGE_CHOICES, 
//         default='en'
//     )
//     is_published = models.BooleanField(default=False)
//     created_at = models.DateTimeField(auto_now_add=True)
//     updated_at = models.DateTimeField(auto_now=True)
    
//     class Meta:
//         db_table = 'pages'
//         ordering = ['-updated_at']

// class PageTranslation(models.Model):
//     page = models.ForeignKey(
//         Page, 
//         related_name='translations', 
//         on_delete=models.CASCADE
//     )
//     language = models.CharField(max_length=2, choices=Page.LANGUAGE_CHOICES)
//     title = models.CharField(max_length=200)
//     slug = models.SlugField(max_length=200)
//     content = models.TextField(blank=True)
//     seo_title = models.CharField(max_length=200, blank=True)
//     meta_description = models.TextField(max_length=500, blank=True)
//     meta_keywords = models.TextField(blank=True)
    
//     class Meta:
//         db_table = 'page_translations'
//         unique_together = ['page', 'language']
//         unique_together = ['slug', 'language']  # Unique slug per language

// # serializers.py
// from rest_framework import serializers
// from .models import Page, PageTranslation

// class PageTranslationSerializer(serializers.ModelSerializer):
//     class Meta:
//         model = PageTranslation
//         fields = [
//             'language', 'title', 'slug', 'content',
//             'seo_title', 'meta_description', 'meta_keywords'
//         ]

// class PageSerializer(serializers.ModelSerializer):
//     translations = PageTranslationSerializer(many=True)
    
//     class Meta:
//         model = Page
//         fields = [
//             'id', 'tenant', 'default_language', 'is_published',
//             'created_at', 'updated_at', 'translations'
//         ]
    
//     def create(self, validated_data):
//         translations_data = validated_data.pop('translations')
//         page = Page.objects.create(**validated_data)
        
//         for translation_data in translations_data:
//             PageTranslation.objects.create(page=page, **translation_data)
        
//         return page
    
//     def update(self, instance, validated_data):
//         translations_data = validated_data.pop('translations', [])
        
//         # Update page fields
//         for attr, value in validated_data.items():
//             setattr(instance, attr, value)
//         instance.save()
        
//         # Update translations
//         for translation_data in translations_data:
//             language = translation_data.get('language')
//             translation, created = PageTranslation.objects.get_or_create(
//                 page=instance,
//                 language=language,
//                 defaults=translation_data
//             )
//             if not created:
//                 for attr, value in translation_data.items():
//                     setattr(translation, attr, value)
//                 translation.save()
        
//         return instance

// # views.py
// from rest_framework import generics, status# Install dependencies first:
// # npm install @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-image @tiptap/extension-table @tiptap/extension-table-row @tiptap/extension-table-header @tiptap/extension-table-cell @tiptap/extension-text-align @tiptap/extension-color @tiptap/extension-highlight

// # 1. Types for your Django backend (Updated for multilingual)
// # types/page.ts

// Helper functions
import { PageData,Language,PageTranslation,CreatePageData} from '@types/pages'
export const getTranslation = (page: PageData, language: Language): PageTranslation | undefined => {
  return page.translations.find(t => t.language === language);
};

export const getCurrentTranslation = (page: PageData, language: Language): PageTranslation => {
  return getTranslation(page, language) || getTranslation(page, page.default_language) || page.translations[0];
};

export const LANGUAGES = {
  en: { name: 'English', dir: 'ltr', flag: '🇺🇸' },
  ar: { name: 'العربية', dir: 'rtl', flag: '🇸🇦' }
} as const;



// # 2. Rich Text Editor Component (Updated for multilingual)
// # components/RichTextEditor.tsx
'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TextStyle from '@tiptap/extension-text-style';
import { useCallback } from 'react';
import { Language, LANGUAGES } from '@/types/page';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
  language: Language;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = 'Start writing...',
  editable = true,
  language,
}) => {
  const currentLang = LANGUAGES[language];
  const isRTL = currentLang.dir === 'rtl';
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Color.configure({ types: [TextStyle.name] }),
      Highlight.configure({ multicolor: true }),
      TextStyle,
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        dir: currentLang.dir,
        class: `prose max-w-none focus:outline-none ${isRTL ? 'prose-rtl' : ''}`,
      },
    },
  });

  const addImage = useCallback(() => {
    const url = window.prompt('Enter image URL:');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const setLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Language indicator and direction info */}
      <div className="bg-blue-50 px-3 py-2 text-sm text-blue-700 border-b border-blue-200">
        {currentLang.flag} {currentLang.name} ({currentLang.dir.toUpperCase()})
      </div>
      
      {/* Toolbar */}
      <div className={`border-b border-gray-200 p-3 bg-gray-50 flex flex-wrap gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
        {/* Text Formatting */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-3 py-1 text-sm font-medium rounded ${
            editor.isActive('bold')
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Bold
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-3 py-1 text-sm font-medium rounded ${
            editor.isActive('italic')
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Italic
        </button>

        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`px-3 py-1 text-sm font-medium rounded ${
            editor.isActive('strike')
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Strike
        </button>

        {/* Headings */}
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-3 py-1 text-sm font-medium rounded ${
            editor.isActive('heading', { level: 1 })
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          H1
        </button>

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-3 py-1 text-sm font-medium rounded ${
            editor.isActive('heading', { level: 2 })
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          H2
        </button>

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-3 py-1 text-sm font-medium rounded ${
            editor.isActive('heading', { level: 3 })
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          H3
        </button>

        {/* Lists */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-3 py-1 text-sm font-medium rounded ${
            editor.isActive('bulletList')
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          • List
        </button>

        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-3 py-1 text-sm font-medium rounded ${
            editor.isActive('orderedList')
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          1. List
        </button>

        {/* Quote */}
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`px-3 py-1 text-sm font-medium rounded ${
            editor.isActive('blockquote')
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Quote
        </button>

        {/* Code */}
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`px-3 py-1 text-sm font-medium rounded ${
            editor.isActive('codeBlock')
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Code
        </button>

        {/* Link */}
        <button
          onClick={setLink}
          className={`px-3 py-1 text-sm font-medium rounded ${
            editor.isActive('link')
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Link
        </button>

        {/* Image */}
        <button
          onClick={addImage}
          className="px-3 py-1 text-sm font-medium rounded bg-white text-gray-700 hover:bg-gray-100"
        >
          Image
        </button>

        {/* Alignment */}
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`px-3 py-1 text-sm font-medium rounded ${
            editor.isActive({ textAlign: 'left' })
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          ←
        </button>

        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`px-3 py-1 text-sm font-medium rounded ${
            editor.isActive({ textAlign: 'center' })
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          ↔
        </button>

        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`px-3 py-1 text-sm font-medium rounded ${
            editor.isActive({ textAlign: 'right' })
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          →
        </button>
      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        className={`min-h-[300px] focus:outline-none ${isRTL ? 'text-right' : 'text-left'}`}
        style={{ direction: currentLang.dir }}
      />
      <div className="p-4">
        <div 
          className={`prose max-w-none ${isRTL ? 'prose-rtl' : ''}`}
          dir={currentLang.dir}
        />
      </div>
    </div>
  );
};

export default RichTextEditor;

# 3. API Service for Django Backend (Updated for multilingual)
# lib/api.ts
import { PageData, CreatePageData, Language } from '@/types/page';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Get all pages
  async getPages(tenant?: string, language?: Language): Promise<PageData[]> {
    const params = new URLSearchParams();
    if (tenant) params.append('tenant', tenant);
    if (language) params.append('language', language);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return this.request<PageData[]>(`/pages/${queryString}`);
  }

  // Get single page
  async getPage(id: number): Promise<PageData> {
    return this.request<PageData>(`/pages/${id}/`);
  }

  // Get page by slug
  async getPageBySlug(slug: string, language: Language, tenant?: string): Promise<PageData> {
    const params = new URLSearchParams();
    params.append('language', language);
    if (tenant) params.append('tenant', tenant);
    const queryString = `?${params.toString()}`;
    return this.request<PageData>(`/pages/slug/${slug}/${queryString}`);
  }

  // Create page
  async createPage(data: CreatePageData): Promise<PageData> {
    return this.request<PageData>('/pages/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Update page
  async updatePage(id: number, data: Partial<CreatePageData>): Promise<PageData> {
    return this.request<PageData>(`/pages/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Delete page
  async deletePage(id: number): Promise<void> {
    return this.request<void>(`/pages/${id}/`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();

# 4. Multilingual Page Editor Component
# components/MultilingualPageEditor.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RichTextEditor from './RichTextEditor';
import { PageData, CreatePageData, Language, PageTranslation, LANGUAGES, getTranslation } from '@/types/page';
import { apiService } from '@/lib/api';

interface MultilingualPageEditorProps {
  pageId?: number;
  tenant: string;
}

const MultilingualPageEditor: React.FC<MultilingualPageEditorProps> = ({ pageId, tenant }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState<Language>('en');
  const [formData, setFormData] = useState<CreatePageData>({
    tenant,
    default_language: 'en',
    translations: [
      {
        language: 'en',
        title: '',
        slug: '',
        content: '',
        seo_title: '',
        meta_description: '',
        meta_keywords: '',
      },
      {
        language: 'ar',
        title: '',
        slug: '',
        content: '',
        seo_title: '',
        meta_description: '',
        meta_keywords: '',
      },
    ],
    is_published: false,
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
        default_language: page.default_language,
        translations: page.translations.length > 0 ? page.translations : [
          {
            language: 'en',
            title: '',
            slug: '',
            content: '',
            seo_title: '',
            meta_description: '',
            meta_keywords: '',
          },
          {
            language: 'ar',
            title: '',
            slug: '',
            content: '',
            seo_title: '',
            meta_description: '',
            meta_keywords: '',
          },
        ],
        is_published: page.is_published,
      });
      setActiveLanguage(page.default_language);
    } catch (error) {
      console.error('Error loading page:', error);
      alert('Error loading page');
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
            updated.slug = generateSlug(value, language);
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
    try {
      setSaving(true);
      
      // Validate that at least default language has required fields
      const defaultTranslation = formData.translations.find(t => t.language === formData.default_language);
      if (!defaultTranslation?.title.trim()) {
        alert(`Please provide a title for the default language (${LANGUAGES[formData.default_language].name})`);
        return;
      }
      
      if (pageId) {
        await apiService.updatePage(pageId, formData);
        alert('Page updated successfully!');
      } else {
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
                  value={currentTranslation.slug}
                  onChange={(e) => updateTranslation(activeLanguage, 'slug', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="page-url-slug"
                  dir="ltr"
                />
              </div>
            </div>

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

export default MultilingualPageEditor;# 5. Multilingual Public Page Display Component
# components/MultilingualPageDisplay.tsx
'use client';

import { PageData, Language, getCurrentTranslation, LANGUAGES } from '@/types/page';
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
        {availableLanguages.length > 1 && (
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
        )}

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

# 6. Language Context Provider
# contexts/LanguageContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, LANGUAGES } from '@/types/page';

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  direction: 'ltr' | 'rtl';
  availableLanguages: Language[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
  defaultLanguage?: Language;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ 
  children, 
  defaultLanguage = 'en' 
}) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(defaultLanguage);

  useEffect(() => {
    // Load language from localStorage or browser preference
    const savedLanguage = localStorage.getItem('language') as Language;
    const browserLanguage = navigator.language.startsWith('ar') ? 'ar' : 'en';
    
    if (savedLanguage && Object.keys(LANGUAGES).includes(savedLanguage)) {
      setCurrentLanguage(savedLanguage);
    } else {
      setCurrentLanguage(browserLanguage);
    }
  }, []);

  const setLanguage = (language: Language) => {
    setCurrentLanguage(language);
    localStorage.setItem('language', language);
    
    // Update HTML direction
    document.documentElement.dir = LANGUAGES[language].dir;
    document.documentElement.lang = language;
  };

  const value: LanguageContextType = {
    currentLanguage,
    setLanguage,
    direction: LANGUAGES[currentLanguage].dir,
    availableLanguages: Object.keys(LANGUAGES) as Language[],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

# 7. Updated Usage in App Router Pages

# app/admin/pages/new/page.tsx
import MultilingualPageEditor from '@/components/MultilingualPageEditor';

export default function NewPagePage() {
  const tenant = 'your-tenant'; // Get from context/auth
  
  return <MultilingualPageEditor tenant={tenant} />;
}

# app/admin/pages/[id]/page.tsx
import MultilingualPageEditor from '@/components/MultilingualPageEditor';

interface EditPagePageProps {
  params: {
    id: string;
  };
}

export default function EditPagePage({ params }: EditPagePageProps) {
  const tenant = 'your-tenant'; // Get from context/auth
  
  return <MultilingualPageEditor pageId={parseInt(params.id)} tenant={tenant} />;
}

# app/[lang]/[slug]/page.tsx
import { notFound } from 'next/navigation';
import MultilingualPageDisplay from '@/components/MultilingualPageDisplay';
import { apiService } from '@/lib/api';
import { Language, LANGUAGES } from '@/types/page';

interface MultilingualPublicPageProps {
  params: {
    lang: string;
    slug: string;
  };
}

export default async function MultilingualPublicPage({ params }: MultilingualPublicPageProps) {
  // Validate language
  if (!Object.keys(LANGUAGES).includes(params.lang)) {
    notFound();
  }

  try {
    const page = await apiService.getPageBySlug(params.slug, params.lang as Language);
    return <MultilingualPageDisplay page={page} defaultLanguage={params.lang as Language} />;
  } catch (error) {
    notFound();
  }
}

# Generate static params for all language/slug combinations
export async function generateStaticParams() {
  // This would typically fetch all pages from your API
  // For now, returning empty array to avoid build errors
  return [];
}

# app/[slug]/page.tsx (Fallback for default language)
import { redirect } from 'next/navigation';

interface FallbackPageProps {
  params: {
    slug: string;
  };
}

export default function FallbackPage({ params }: FallbackPageProps) {
  // Redirect to default language version
  redirect(`/en/${params.slug}`);
}

# app/layout.tsx (Updated root layout)
import { LanguageProvider } from '@/contexts/LanguageContext';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}

# 8. Updated CSS for RTL and multilingual support
# Add to your globals.css

/* Base RTL Support */
[dir="rtl"] {
  text-align: right;
}

[dir="ltr"] {
  text-align: left;
}

/* Arabic Font Support */
.font-arabic {
  font-family: 'Noto Sans Arabic', 'Tajawal', 'Cairo', 'Amiri', Arial, sans-serif;
}

/* Prose RTL Styles */
.prose-rtl {
  direction: rtl;
}

.prose-rtl h1,
.prose-rtl h2,
.prose-rtl h3,
.prose-rtl h4,
.prose-rtl h5,
.prose-rtl h6 {
  text-align: right;
}

.prose-rtl p,
.prose-rtl div,
.prose-rtl span {
  text-align: right;
}

.prose-rtl ul,
.prose-rtl ol {
  padding-right: 2em;
  padding-left: 0;
}

.prose-rtl blockquote {
  border-right: 4px solid #ddd;
  border-left: none;
  padding-right: 1em;
  padding-left: 0;
}

.prose-rtl [data-text-align="left"] {
  text-align: left;
}

.prose-rtl [data-text-align="center"] {
  text-align: center;
}

.prose-rtl [data-text-align="right"] {
  text-align: right;
}

/* Tiptap Editor RTL Styles */
.ProseMirror[dir="rtl"] {
  text-align: right;
}

.ProseMirror[dir="rtl"] h1,
.ProseMirror[dir="rtl"] h2,
.ProseMirror[dir="rtl"] h3,
.ProseMirror[dir="rtl"] h4,
.ProseMirror[dir="rtl"] h5,
.ProseMirror[dir="rtl"] h6 {
  text-align: right;
}

.ProseMirror[dir="rtl"] p {
  text-align: right;
}

.ProseMirror[dir="rtl"] ul,
.ProseMirror[dir="rtl"] ol {
  padding-right: 2em;
  padding-left: 0;
}

.ProseMirror[dir="rtl"] blockquote {
  border-right: 4px solid #ddd;
  border-left: none;
  padding-right: 1em;
  padding-left: 0;
}

/* Language-specific typography */
.ProseMirror[dir="rtl"] {
  font-family: 'Noto Sans Arabic', 'Tajawal', 'Cairo', 'Amiri', Arial, sans-serif;
  line-height: 1.8;
}

.ProseMirror[dir="ltr"] {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
}

/* Enhanced prose styles */
.ProseMirror {
  outline: none;
  padding: 1rem;
}

.ProseMirror h1 {
  font-size: 2em;
  font-weight: bold;
  margin: 0.67em 0;
}

.ProseMirror h2 {
  font-size: 1.5em;
  font-weight: bold;
  margin: 0.83em 0;
}

.ProseMirror h3 {
  font-size: 1.17em;
  font-weight: bold;
  margin: 1em 0;
}

.ProseMirror p {
  margin: 1em 0;
}

.ProseMirror ul, .ProseMirror ol {
  margin: 1em 0;
}

.ProseMirror li {
  margin: 0.5em 0;
}

.ProseMirror blockquote {
  margin: 1em 0;
  color: #666;
  font-style: italic;
}

.ProseMirror code {
  background-color: #f4f4f4;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

.ProseMirror pre {
  background-color: #f4f4f4;
  padding: 1em;
  border-radius: 5px;
  overflow-x: auto;
  font-family: 'Courier New', monospace;
}

.ProseMirror pre code {
  background: none;
  padding: 0;
}

.ProseMirror img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 1em 0;
}

/* Table styles */
.ProseMirror table {
  border-collapse: collapse;
  margin: 1em 0;
  overflow: hidden;
  width: 100%;
}

.ProseMirror table td,
.ProseMirror table th {
  border: 2px solid #ced4da;
  box-sizing: border-box;
  min-width: 1em;
  padding: 3px 5px;
  position: relative;
  vertical-align: top;
}

.ProseMirror table th {
  background-color: #f1f3f4;
  font-weight: bold;
  text-align: left;
}

.ProseMirror[dir="rtl"] table th {
  text-align: right;
}

/* Highlight styles */
.ProseMirror mark {
  background-color: #fef08a;
  border-radius: 2px;
  padding: 0.1em 0.2em;
}

/* Link styles */
.ProseMirror a {
  color: #3b82f6;
  text-decoration: underline;
  cursor: pointer;
}

.ProseMirror a:hover {
  color: #1d4ed8;
}

/* Selection styles for better UX */
.ProseMirror-selectednode {
  outline: 2px solid #3b82f6;
}

.ProseMirror-gapcursor {
  display: none;
  pointer-events: none;
  position: absolute;
}

.ProseMirror-gapcursor:after {
  content: "";
  display: block;
  position: absolute;
  top: -2px;
  width: 20px;
  border-top: 1px solid black;
  animation: ProseMirror-cursor-blink 1.1s steps(2, start) infinite;
}

@keyframes ProseMirror-cursor-blink {
  to {
    visibility: hidden;
  }
}
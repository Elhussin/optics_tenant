// # 9. Django Model Structure for Multilingual Pages

// ```python
// # models.py
from django.db import models
from django.utils.translation import gettext_lazy as _

class Page(models.Model):

    
    // tenant = models.CharField(max_length=100)
    // default_language = models.CharField(
    //     max_length=2, 
    //     choices=LANGUAGE_CHOICES, 
    //     default='en'
    // )
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'pages'
        ordering = ['-updated_at']

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
from rest_framework import serializers
from .models import Page, PageTranslation

class PageTranslationSerializer(serializers.ModelSerializer):
    class Meta:
        model = PageTranslation
        fields = [
            'language', 'title', 'slug', 'content',
            'seo_title', 'meta_description', 'meta_keywords'
        ]


# views.py
from rest_framework import generics, status# Install dependencies first:
# npm install @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-image @tiptap/extension-table @tiptap/extension-table-row @tiptap/extension-table-header @tiptap/extension-table-cell @tiptap/extension-text-align @tiptap/extension-color @tiptap/extension-highlight

# 1. Types for your Django backend (Updated for multilingual)
# types/page.ts

Helper functions
import { PageData,Language,PageTranslation,CreatePageData} from '@types/pages'


// # 2. Rich Text Editor Component (Updated for multilingual)
// # components/RichTextEditor.tsx


// # 3. API Service for Django Backend (Updated for multilingual)
// # lib/api.ts
// import { PageData, CreatePageData, Language } from '@/types/page';

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// class ApiService {
//   private async request<T>(
//     endpoint: string,
//     options: RequestInit = {}
//   ): Promise<T> {
//     const url = `${API_BASE_URL}${endpoint}`;
//     const config: RequestInit = {
//       headers: {
//         'Content-Type': 'application/json',
//         ...options.headers,
//       },
//       ...options,
//     };

//     const response = await fetch(url, config);

//     if (!response.ok) {
//       throw new Error(`API Error: ${response.status} ${response.statusText}`);
//     }

//     return response.json();
//   }

//   // Get all pages
//   async getPages(tenant?: string, language?: Language): Promise<PageData[]> {
//     const params = new URLSearchParams();
//     if (tenant) params.append('tenant', tenant);
//     if (language) params.append('language', language);
//     const queryString = params.toString() ? `?${params.toString()}` : '';
//     return this.request<PageData[]>(`/pages/${queryString}`);
//   }

//   // Get single page
//   async getPage(id: number): Promise<PageData> {
//     return this.request<PageData>(`/pages/${id}/`);
//   }

//   // Get page by slug
//   async getPageBySlug(slug: string, language: Language, tenant?: string): Promise<PageData> {
//     const params = new URLSearchParams();
//     params.append('language', language);
//     if (tenant) params.append('tenant', tenant);
//     const queryString = `?${params.toString()}`;
//     return this.request<PageData>(`/pages/slug/${slug}/${queryString}`);
//   }

//   // Create page
//   async createPage(data: CreatePageData): Promise<PageData> {
//     return this.request<PageData>('/pages/', {
//       method: 'POST',
//       body: JSON.stringify(data),
//     });
//   }

//   // Update page
//   async updatePage(id: number, data: Partial<CreatePageData>): Promise<PageData> {
//     return this.request<PageData>(`/pages/${id}/`, {
//       method: 'PATCH',
//       body: JSON.stringify(data),
//     });
//   }

//   // Delete page
//   async deletePage(id: number): Promise<void> {
//     return this.request<void>(`/pages/${id}/`, {
//       method: 'DELETE',
//     });
//   }
// }

// export const apiService = new ApiService();

// # 4. Multilingual Page Editor Component
// # components/MultilingualPageEditor.tsx
// # 5. Multilingual Public Page Display Component
// # components/MultilingualPageDisplay.tsx


// # 6. Language Context Provider
// # contexts/LanguageContext.tsx


// # 7. Updated Usage in App Router Pages

// # app/admin/pages/new/page.tsx
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

// # app/layout.tsx (Updated root layout)
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

// # 8. Updated CSS for RTL and multilingual support
// # Add to your globals.css

/* Base RTL Support */

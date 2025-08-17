const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
import { PageData, CreatePageData } from './types';
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
  async getPages(tenant?: string): Promise<PageData[]> {
    const params = tenant ? `?tenant=${tenant}` : '';
    return this.request<PageData[]>(`/pages/${params}`);
  }

  // Get single page
  async getPage(id: number): Promise<PageData> {
    return this.request<PageData>(`/pages/${id}/`);
  }

  // Get page by slug
  async getPageBySlug(slug: string, tenant?: string): Promise<PageData> {
    const params = tenant ? `?tenant=${tenant}` : '';
    return this.request<PageData>(`/pages/slug/${slug}/${params}`);
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
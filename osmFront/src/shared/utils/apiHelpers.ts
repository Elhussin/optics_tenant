/**
 * Helper to normalize API responses
 * DRF may return paginated results ({results: [], count: N}) or plain arrays
 */

// Type for paginated response
export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

/**
 * Extracts array data from API response
 * Handles both paginated and non-paginated responses
 */
export function extractArrayData<T>(data: T[] | PaginatedResponse<T> | any): T[] {
    if (!data) return [];

    // Already an array
    if (Array.isArray(data)) {
        return data;
    }

    // Paginated response
    if (data.results && Array.isArray(data.results)) {
        return data.results;
    }

    // Object with data property (some APIs use this)
    if (data.data && Array.isArray(data.data)) {
        return data.data;
    }

    // Single object - wrap in array
    if (typeof data === 'object') {
        return [data];
    }

    return [];
}

/**
 * Type-safe SWR fetcher that normalizes responses
 */
export function createArrayFetcher<T>(
    fetcher: () => Promise<T[] | PaginatedResponse<T> | any>
): () => Promise<T[]> {
    return async () => {
        const data = await fetcher();
        return extractArrayData<T>(data);
    };
}

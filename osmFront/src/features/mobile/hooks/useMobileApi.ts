import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/src/shared/api/axios';
import { toast } from 'sonner';

export const useMobileDashboard = (branchId?: number) => {
    return useQuery({
        queryKey: ['mobile', 'dashboard', branchId],
        queryFn: () => api.mobile_dashboard_retrieve({ queries: { branch_id: branchId } }),
    });
};

export const useMobileProductSearch = (query: string, branchId?: number) => {
    return useQuery({
        queryKey: ['mobile', 'products', query, branchId],
        queryFn: () => api.mobile_products_search_retrieve({ queries: { q: query, limit: 20, branch_id: branchId } }),
        enabled: query.length >= 2,
    });
};

export const useMobileCustomerSearch = (query: string) => {
    return useQuery({
        queryKey: ['mobile', 'customers', query],
        queryFn: () => api.mobile_customers_search_retrieve({ queries: { q: query, limit: 10 } }),
        enabled: query.length >= 2,
    });
};

export const useMobileSync = (since?: string, branchId?: number) => {
    return useQuery({
        queryKey: ['mobile', 'sync', since],
        queryFn: () => api.mobile_sync_retrieve({ queries: { since, branch_id: branchId } }),
        enabled: true, // Sync can be triggered manually or periodically
    });
}

export const useQuickSale = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Parameters<typeof api.mobile_quick_sale_create>[0]) =>
            api.mobile_quick_sale_create(data),
        onSuccess: (data) => {
            toast.success(`Sale #${data.order_number} created successfully`);
            queryClient.invalidateQueries({ queryKey: ['mobile', 'dashboard'] });
        },
        onError: (error: any) => {
            // Axios interceptor handles the toast, but we can do local handling if needed
            console.error("Quick Sale Error", error);
        }
    });
};

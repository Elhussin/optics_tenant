// features/wholesale/hooks/useWholesale.ts
/**
 * Wholesale API Hooks
 */
"use client"
import { useState, useCallback } from 'react';
import { api } from '@/src/shared/api/axios';
import type {
    WholesaleCustomer,
    WholesalePricingResponse,
    WholesaleValidationResponse,
    CustomerStatement,
    WholesaleDashboard,
    CreditUpdateRequest,
} from '../types/wholesale.types';

/**
 * Hook for fetching wholesale customers
 */
export function useWholesaleCustomers() {
    const [customers, setCustomers] = useState<WholesaleCustomer[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.customRequest('sales_wholesale_customers_retrieve');
            setCustomers(data);
        } catch (err: any) {
            setError(err?.message || 'فشل في جلب عملاء الجملة');
        } finally {
            setLoading(false);
        }
    }, []);

    return { customers, loading, error, fetchCustomers };
}

/**
 * Hook for wholesale pricing calculation
 */
export function useWholesalePricing() {
    const [pricing, setPricing] = useState<WholesalePricingResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const calculatePricing = useCallback(async (
        customerId: number,
        items: { variant_id: number; quantity: number }[],
        branchId?: number
    ) => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.customRequest('sales_wholesale_pricing_create', {
                customer_id: customerId,
                items,
                branch_id: branchId,
            });
            setPricing(data);
            return data;
        } catch (err: any) {
            setError(err?.message || 'فشل في حساب التسعير');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const reset = useCallback(() => {
        setPricing(null);
        setError(null);
    }, []);

    return { pricing, loading, error, calculatePricing, reset };
}

/**
 * Hook for validating wholesale orders
 */
export function useWholesaleValidation() {
    const [validation, setValidation] = useState<WholesaleValidationResponse | null>(null);
    const [loading, setLoading] = useState(false);

    const validateOrder = useCallback(async (
        customerId: number,
        items: { variant_id: number; quantity: number }[],
        useCredit: boolean = false
    ) => {
        setLoading(true);
        try {
            const data = await api.customRequest('sales_wholesale_validate_create', {
                customer_id: customerId,
                items,
                use_credit: useCredit,
            });
            setValidation(data);
            return data;
        } catch (err: any) {
            setValidation({
                is_valid: false,
                errors: [err?.message || 'فشل في التحقق من الطلب'],
            });
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return { validation, loading, validateOrder };
}

/**
 * Hook for creating wholesale orders
 */
export function useCreateWholesaleOrder() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createOrder = useCallback(async (
        customerId: number,
        branchId: number,
        items: { variant_id: number; quantity: number }[],
        paymentMethod: string = 'credit',
        notes: string = ''
    ) => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.customRequest('sales_wholesale_create_order_create', {
                customer_id: customerId,
                branch_id: branchId,
                items,
                payment_method: paymentMethod,
                notes,
            });
            return data;
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || 'فشل في إنشاء الطلب');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { loading, error, createOrder };
}

/**
 * Hook for customer statement
 */
export function useCustomerStatement(customerId: number) {
    const [statement, setStatement] = useState<CustomerStatement | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStatement = useCallback(async (startDate?: string, endDate?: string) => {
        if (!customerId) return;

        setLoading(true);
        setError(null);
        try {
            const params: Record<string, string> = { customer_id: String(customerId) };
            if (startDate) params.start_date = startDate;
            if (endDate) params.end_date = endDate;

            const data = await api.customRequest('sales_wholesale_customer_statement_retrieve', params);
            setStatement(data);
            return data;
        } catch (err: any) {
            setError(err?.message || 'فشل في جلب كشف الحساب');
            return null;
        } finally {
            setLoading(false);
        }
    }, [customerId]);

    return { statement, loading, error, fetchStatement };
}

/**
 * Hook for wholesale dashboard
 */
export function useWholesaleDashboard() {
    const [dashboard, setDashboard] = useState<WholesaleDashboard | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboard = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.customRequest('sales_wholesale_dashboard_retrieve');
            setDashboard(data);
        } catch (err: any) {
            setError(err?.message || 'فشل في جلب لوحة التحكم');
        } finally {
            setLoading(false);
        }
    }, []);

    return { dashboard, loading, error, fetchDashboard };
}

/**
 * Hook for updating customer credit
 */
export function useUpdateCustomerCredit() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateCredit = useCallback(async (customerId: number, data: CreditUpdateRequest) => {
        setLoading(true);
        setError(null);
        try {
            const result = await api.customRequest('sales_wholesale_customer_credit_create', {
                customer_id: customerId,
                ...data,
            });
            return result;
        } catch (err: any) {
            setError(err?.message || 'فشل في تحديث الائتمان');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { loading, error, updateCredit };
}

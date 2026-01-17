// features/reports/hooks/useReports.ts
/**
 * Reports API Hooks
 */

import { useState, useCallback } from 'react';
import { api } from '@/src/shared/api/axios';
import type {
    DateRange,
    SalesReport,
    WholesaleReport,
    InsuranceReport,
    ReceivablesAgingReport,
    InventoryReport,
    DashboardMetrics,
} from '../types/reports.types';

/**
 * Hook for Sales Report
 */
export function useSalesReport() {
    const [report, setReport] = useState<SalesReport | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchReport = useCallback(async (dateRange: DateRange, branchId?: number) => {
        setLoading(true);
        setError(null);
        try {
            const params: Record<string, any> = {
                start_date: dateRange.start_date,
                end_date: dateRange.end_date,
            };
            if (branchId) params.branch_id = branchId;

            const data = await api.customRequest('sales_reports_sales_summary_retrieve', params);
            setReport(data);
            return data;
        } catch (err: any) {
            setError(err?.message || 'فشل في جلب تقرير المبيعات');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return { report, loading, error, fetchReport };
}

/**
 * Hook for Wholesale Report
 */
export function useWholesaleReport() {
    const [report, setReport] = useState<WholesaleReport | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchReport = useCallback(async (dateRange: DateRange) => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                start_date: dateRange.start_date,
                end_date: dateRange.end_date,
            };

            const data = await api.customRequest('reports_wholesale_report_retrieve', params);
            setReport(data);
            return data;
        } catch (err: any) {
            setError(err?.message || 'فشل في جلب تقرير الجملة');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return { report, loading, error, fetchReport };
}

/**
 * Hook for Insurance Report
 */
export function useInsuranceReport() {
    const [report, setReport] = useState<InsuranceReport | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchReport = useCallback(async (dateRange: DateRange, partnerId?: number) => {
        setLoading(true);
        setError(null);
        try {
            const params: Record<string, any> = {
                start_date: dateRange.start_date,
                end_date: dateRange.end_date,
            };
            if (partnerId) params.partner_id = partnerId;

            const data = await api.customRequest('reports_insurance_report_retrieve', params);
            setReport(data);
            return data;
        } catch (err: any) {
            setError(err?.message || 'فشل في جلب تقرير التأمين');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return { report, loading, error, fetchReport };
}

/**
 * Hook for Receivables Aging Report
 */
export function useReceivablesReport() {
    const [report, setReport] = useState<ReceivablesAgingReport | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchReport = useCallback(async (asOfDate?: string, customerType?: string) => {
        setLoading(true);
        setError(null);
        try {
            const params: Record<string, any> = {};
            if (asOfDate) params.as_of_date = asOfDate;
            if (customerType && customerType !== 'all') params.customer_type = customerType;

            const data = await api.customRequest('reports_receivables_aging_retrieve', params);
            setReport(data);
            return data;
        } catch (err: any) {
            setError(err?.message || 'فشل في جلب تقرير الذمم المدينة');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return { report, loading, error, fetchReport };
}

/**
 * Hook for Inventory Report
 */
export function useInventoryReport() {
    const [report, setReport] = useState<InventoryReport | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchReport = useCallback(async (categoryId?: number, stockStatus?: string) => {
        setLoading(true);
        setError(null);
        try {
            const params: Record<string, any> = {};
            if (categoryId) params.category_id = categoryId;
            if (stockStatus && stockStatus !== 'all') params.stock_status = stockStatus;

            const data = await api.customRequest('reports_inventory_report_retrieve', params);
            setReport(data);
            return data;
        } catch (err: any) {
            setError(err?.message || 'فشل في جلب تقرير المخزون');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return { report, loading, error, fetchReport };
}

/**
 * Hook for Dashboard Metrics
 */
export function useDashboardMetrics() {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMetrics = useCallback(async (branchId?: number) => {
        setLoading(true);
        setError(null);
        try {
            const params: Record<string, any> = {};
            if (branchId) params.branch_id = branchId;

            const data = await api.customRequest('reports_dashboard_metrics_retrieve', params);
            setMetrics(data);
            return data;
        } catch (err: any) {
            setError(err?.message || 'فشل في جلب الإحصائيات');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return { metrics, loading, error, fetchMetrics };
}

/**
 * Hook for Exporting Reports
 */
export function useReportExport() {
    const [loading, setLoading] = useState(false);

    const exportToPDF = useCallback(async (reportType: string, params: Record<string, any>) => {
        setLoading(true);
        try {
            const response = await api.customRequest(`reports_${reportType}_export_pdf`, params);
            // Handle download
            const blob = new Blob([response], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${reportType}_${new Date().toISOString().split('T')[0]}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Export failed:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const exportToExcel = useCallback(async (reportType: string, params: Record<string, any>) => {
        setLoading(true);
        try {
            const response = await api.customRequest(`reports_${reportType}_export_excel`, params);
            // Handle download
            const blob = new Blob([response], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${reportType}_${new Date().toISOString().split('T')[0]}.xlsx`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Export failed:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    return { loading, exportToPDF, exportToExcel };
}

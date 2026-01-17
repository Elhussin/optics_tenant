// features/reports/types/reports.types.ts
/**
 * Types for Reports Module
 */

export type ReportPeriod = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

export interface DateRange {
    start_date: string;
    end_date: string;
}

// Sales Report Types
export interface SalesReportSummary {
    period: DateRange;
    total_orders: number;
    total_amount: string;
    total_cost: string;
    gross_profit: string;
    profit_margin: string;
    average_order_value: string;
    orders_by_status: {
        status: string;
        count: number;
        amount: string;
    }[];
    payment_methods: {
        method: string;
        count: number;
        amount: string;
    }[];
}

export interface DailySales {
    date: string;
    orders_count: number;
    total_amount: string;
    profit: string;
}

export interface TopProduct {
    product_id: number;
    product_name: string;
    sku: string;
    quantity_sold: number;
    total_amount: string;
    profit: string;
}

export interface TopCustomer {
    customer_id: number;
    customer_name: string;
    phone?: string;
    orders_count: number;
    total_amount: string;
}

export interface SalesReport {
    summary: SalesReportSummary;
    daily_sales: DailySales[];
    top_products: TopProduct[];
    top_customers: TopCustomer[];
}

// Wholesale Report Types
export interface WholesaleReportSummary {
    period: DateRange;
    total_orders: number;
    total_amount: string;
    total_receivables: string;
    collections: string;
    active_customers: number;
}

export interface WholesaleCustomerReport {
    customer_id: number;
    customer_name: string;
    tier: string;
    orders_count: number;
    total_amount: string;
    balance: string;
    last_order_date: string;
}

export interface WholesaleReport {
    summary: WholesaleReportSummary;
    customers: WholesaleCustomerReport[];
    aging: {
        current: string;
        days_30: string;
        days_60: string;
        days_90: string;
        over_90: string;
    };
}

// Insurance Report Types
export interface InsuranceReportSummary {
    period: DateRange;
    total_claims: number;
    total_claimed: string;
    approved_claims: number;
    approved_amount: string;
    rejected_claims: number;
    pending_claims: number;
    pending_amount: string;
    collected_amount: string;
}

export interface PartnerClaimsReport {
    partner_id: number;
    partner_name: string;
    partner_type: string;
    claims_count: number;
    claimed_amount: string;
    approved_amount: string;
    collected_amount: string;
    pending_amount: string;
}

export interface InsuranceReport {
    summary: InsuranceReportSummary;
    by_partner: PartnerClaimsReport[];
    claims_trend: {
        month: string;
        claims_count: number;
        claimed_amount: string;
        collected_amount: string;
    }[];
}

// Receivables Aging Report
export interface ReceivableItem {
    customer_id: number;
    customer_name: string;
    customer_type: 'retail' | 'wholesale' | 'partner';
    phone?: string;
    current: string;
    days_1_30: string;
    days_31_60: string;
    days_61_90: string;
    over_90: string;
    total: string;
}

export interface ReceivablesAgingReport {
    as_of_date: string;
    items: ReceivableItem[];
    totals: {
        current: string;
        days_1_30: string;
        days_31_60: string;
        days_61_90: string;
        over_90: string;
        total: string;
    };
}

// Inventory Report Types
export interface InventorySummary {
    total_products: number;
    total_value: string;
    low_stock_count: number;
    out_of_stock_count: number;
    categories: {
        category_name: string;
        products_count: number;
        total_value: string;
    }[];
}

export interface InventoryItem {
    product_id: number;
    product_name: string;
    sku: string;
    category: string;
    quantity: number;
    unit_cost: string;
    total_value: string;
    reorder_level: number;
    status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface InventoryReport {
    summary: InventorySummary;
    items: InventoryItem[];
}

// Dashboard Metrics
export interface DashboardMetrics {
    today: {
        orders: number;
        revenue: string;
        customers: number;
    };
    month: {
        orders: number;
        revenue: string;
        growth_percent: string;
    };
    year: {
        orders: number;
        revenue: string;
        growth_percent: string;
    };
    recent_orders: {
        id: number;
        order_number: string;
        customer_name: string;
        total: string;
        status: string;
        created_at: string;
    }[];
    revenue_chart: {
        labels: string[];
        data: number[];
    };
}

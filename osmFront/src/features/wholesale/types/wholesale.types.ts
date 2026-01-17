// features/wholesale/types/wholesale.types.ts
/**
 * Types for Wholesale Module
 */

export interface WholesaleCustomer {
    id: number;
    first_name: string;
    last_name: string;
    customer_type: string;
    pricing_tier: PricingTier;
    credit_limit: string;
    current_balance: string;
    credit_status: CreditStatus;
    payment_terms_days: number;
    minimum_order_amount: string;
    available_credit?: string;
    phone?: string;
    email?: string;
}

export type PricingTier =
    | 'retail'
    | 'wholesale_1'
    | 'wholesale_2'
    | 'wholesale_3'
    | 'distributor'
    | 'special';

export type CreditStatus =
    | 'none'
    | 'pending'
    | 'approved'
    | 'suspended';

export interface WholesalePricingItem {
    variant_id: number;
    variant_name: string;
    quantity: number;
    original_price: string;
    unit_price: string;
    discount_type: string;
    discount_source: string;
    line_discount: string;
    line_total: string;
}

export interface WholesalePricingResponse {
    customer: {
        id: number;
        name: string;
        pricing_tier: string;
        pricing_tier_display: string;
        default_discount: string;
    };
    items: WholesalePricingItem[];
    subtotal: string;
    line_discounts: string;
    customer_discount: string;
    total_discount: string;
    final_total: string;
}

export interface WholesaleOrderRequest {
    customer_id: number;
    branch_id: number;
    items: { variant_id: number; quantity: number }[];
    payment_method: string;
    notes?: string;
}

export interface WholesaleValidationResponse {
    is_valid: boolean;
    errors: string[];
    customer_credit?: {
        credit_limit: string;
        current_balance: string;
        available_credit: string;
        credit_status: string;
    };
}

export interface CustomerStatementTransaction {
    date: string;
    type: 'invoice' | 'payment';
    reference: string;
    debit: string;
    credit: string;
    balance: string;
}

export interface CustomerStatement {
    customer: {
        id: number;
        name: string;
        credit_limit: string;
        current_balance: string;
    };
    period: {
        start_date: string | null;
        end_date: string | null;
    };
    opening_balance: string;
    transactions: CustomerStatementTransaction[];
    closing_balance: string;
    summary: {
        total_invoices: string;
        total_payments: string;
    };
}

export interface WholesaleDashboard {
    month_stats: {
        orders_count: number;
        total_sales: string;
        total_discount: string;
    };
    top_customers: {
        customer_id: number;
        name: string;
        total: string;
        orders_count: number;
    }[];
    receivables: {
        total: string;
        customers_count: number;
    };
    overdue_count: number;
}

export interface CreditUpdateRequest {
    credit_limit?: number;
    credit_status?: CreditStatus;
    payment_terms_days?: number;
    pricing_tier?: PricingTier;
    default_discount_percentage?: number;
}

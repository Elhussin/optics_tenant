// features/payment/types/payment.types.ts
/**
 * Types for Payment Module
 */

export type PaymentMethod =
    | 'cash'
    | 'card'
    | 'bank_transfer'
    | 'credit'
    | 'tabby'
    | 'tamara'
    | 'other';

export type PaymentStatus =
    | 'pending'
    | 'processing'
    | 'completed'
    | 'failed'
    | 'refunded'
    | 'cancelled';

export type BNPLProvider = 'tabby' | 'tamara';

export type InstallmentStatus =
    | 'upcoming'
    | 'due'
    | 'paid'
    | 'overdue'
    | 'cancelled';

export interface Payment {
    id: number;
    payment_number: string;
    order: number;
    order_number: string;
    customer: number;
    customer_name: string;
    amount: string;
    payment_method: PaymentMethod;
    payment_status: PaymentStatus;
    reference_number?: string;
    transaction_id?: string;
    payment_date: string;
    notes?: string;
    created_at: string;
}

export interface PaymentCreate {
    order_id: number;
    amount: string;
    payment_method: PaymentMethod;
    reference_number?: string;
    notes?: string;
}

export interface Installment {
    id: number;
    payment: number;
    installment_number: number;
    amount: string;
    due_date: string;
    paid_date?: string;
    status: InstallmentStatus;
    notes?: string;
}

export interface BNPLSession {
    id: string;
    provider: BNPLProvider;
    order_id: number;
    amount: string;
    currency: string;
    checkout_url: string;
    status: 'created' | 'approved' | 'rejected' | 'expired';
    expires_at: string;
    customer_info: {
        name: string;
        phone: string;
        email?: string;
    };
    installments_count?: number;
    first_payment?: string;
    created_at: string;
}

export interface BNPLSessionCreate {
    provider: BNPLProvider;
    order_id: number;
    success_url: string;
    cancel_url: string;
    failure_url: string;
}

export interface BNPLCallback {
    provider: BNPLProvider;
    session_id: string;
    status: 'success' | 'cancel' | 'failure';
    payment_id?: string;
    error_message?: string;
}

export interface TabbyConfig {
    public_key: string;
    merchant_code: string;
    currency: string;
    max_amount: number;
    min_amount: number;
    installments: number[];
}

export interface TamaraConfig {
    public_key: string;
    merchant_id: string;
    currency: string;
    max_amount: number;
    min_amount: number;
    available_plans: {
        name: string;
        installments: number;
        description: string;
    }[];
}

export interface InstallmentPlan {
    provider: BNPLProvider;
    installments_count: number;
    first_payment: number;
    subsequent_payments: number;
    total_amount: number;
    fee?: number;
}

export interface PaymentSummary {
    order_id: number;
    order_total: string;
    paid_amount: string;
    remaining_amount: string;
    payments: Payment[];
    installments?: Installment[];
}

export interface RefundRequest {
    payment_id: number;
    amount: string;
    reason: string;
}

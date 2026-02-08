
export type PaymentMethod = string; // Using string as it comes from API as ID or display name can serve as label

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled' | 'processing';

export interface Payment {
    id: number;
    payment_number?: string;
    invoice: number;
    invoice_number: string;
    amount: string;
    currency: string;
    payment_method: number;
    payment_method_display: string;
    status: PaymentStatus;
    transaction_id?: string;
    notes?: string;
    paid_at?: string;
    created_at: string;
    created_by?: string;
}

export interface Installment {
    id: number;
    payment: number;
    installment_number: number;
    amount: string;
    due_date: string;
    paid_date?: string;
    status: string;
    notes?: string;
}

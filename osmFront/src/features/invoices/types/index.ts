
export type InvoiceStatus = "draft" | "issued" | "paid" | "partially_paid" | "overdue" | "cancelled";

export interface InvoiceItem {
    id?: number;
    product_variant: number;
    product_variant_name?: string;
    quantity: number;
    unit_price: number;
    tax_amount?: number;
    total_price?: number;
    product_name?: string;
}

export interface Invoice {
    id: number;
    invoice_number: string;
    customer: number;
    customer_name?: string;
    invoice_date: string;
    due_date?: string | null;
    status: InvoiceStatus;

    items: InvoiceItem[];

    // Financials
    subtotal: number;
    tax_amount: number;
    total_amount: number;
    paid_amount: number;
    remaining_amount: number;

    // Meta
    notes: string;
    created_at: string;
    updated_at: string;
    confirmed_at?: string | null;
    created_by?: number;
    created_by_name?: string;

    // Relations
    invoice_type?: number;
    invoice_type_details?: {
        id: number;
        name: string;
        code: string;
    };
    insurance_details?: {
        policy_number: string;
        membership_number: string;
        provider_name: string;
        provider_name_en: string;
        patient_share_percentage: number;
        max_patient_share: number;
        coverage_limit: number;
        remaining_limit: number;
    } | null;
}

export const INVOICE_STATUS_OPTIONS = [
    { value: "draft", label: "مسودة" },
    { value: "issued", label: "صدرت" },
    { value: "paid", label: "مدفوعة" },
    { value: "partially_paid", label: "مدفوعة جزئياً" },
    { value: "overdue", label: "متأخرة" },
    { value: "cancelled", label: "ملغاة" },
];

// Order Types matching Backend

export interface PaymentMethod {
    id: number;
    name_ar: string;
    name_en: string;
    code: string;
    is_active: boolean;
    icon?: string | null;
    is_installment: boolean;
    provider_fees_percent: number;
}

export type OrderType = "cash" | "credit" | "insurance" | "bnpl" | "corporate" | "wholesale";
export type PaymentStatus = "pending" | "partial" | "paid" | "refunded" | "disputed";
export type OrderStatus = "pending" | "confirmed" | "ready" | "delivered" | "cancelled";
export type InvoiceStatus = "draft" | "paid" | "partially_paid" | "overdue" | "confirmed";

export interface OrderItem {
    id?: number;
    product_variant: number;
    product_variant_name?: string; // For display
    quantity: number;
    unit_price: number;
    total_price?: number;
    prescription?: number | null;
    product_name?: string;
}

export interface Order {
    id: number;
    order_number: string;
    customer: number;
    customer_name?: string; // For display
    branch?: number | null;
    branch_name?: string; // For display
    sales_person?: number | null;
    sales_person_name?: string; // For display

    order_type: OrderType;
    status: OrderStatus;
    payment_status: PaymentStatus;
    payment_method?: number | null; // ID
    payment_method_details?: PaymentMethod; // Expanded

    items: OrderItem[];

    // Financials
    subtotal: number;
    tax_rate: number;
    tax_amount: number;
    discount_amount: number;
    total_amount: number;
    paid_amount: number;
    remaining_amount?: number;

    // Partner/Insurance
    partner?: number | null;
    partner_name?: string;
    partner_share: number;
    customer_share: number;

    // Meta
    notes: string;
    created_at: string;
    confirmed_at?: string | null;
    delivered_at?: string | null;
    expected_delivery?: string | null;
}

export interface Invoice {
    id: number;
    invoice_number: string;
    invoice_type: string;
    status: InvoiceStatus;
    order?: number;
    total_amount: number;
    paid_amount: number;
    created_at: string;
    due_date?: string | null;
}

export const ORDER_TYPE_OPTIONS = [
    { value: "cash", label: "نقدي" },
    { value: "credit", label: "آجل" },
    { value: "insurance", label: "تأمين" },
    { value: "bnpl", label: "تقسيط (BNPL)" },
    { value: "corporate", label: "شركات" },
    { value: "wholesale", label: "جملة" },
];

export const ORDER_STATUS_OPTIONS = [
    { value: "pending", label: "قيد الانتظار" },
    { value: "confirmed", label: "مؤكد" },
    { value: "ready", label: "جاهز" },
    { value: "delivered", label: "تم التسليم" },
    { value: "cancelled", label: "ملغي" },
];

export const PAYMENT_STATUS_OPTIONS = [
    { value: "pending", label: "قيد الانتظار" },
    { value: "partial", label: "مدفوع جزئياً" },
    { value: "paid", label: "مدفوع" },
    { value: "refunded", label: "مسترد" },
    { value: "disputed", label: "متنازع عليه" },
];

export const INVOICE_STATUS_OPTIONS = [
    { value: "draft", label: "مسودة" },
    { value: "paid", label: "مدفوع" },
    { value: "partially_paid", label: "مدفوع جزئياً" },
    { value: "overdue", label: "متأخر" },
    { value: "confirmed", label: "مؤكد" },
];

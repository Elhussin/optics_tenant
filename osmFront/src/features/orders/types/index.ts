// Order Types
export interface OrderItem {
    id?: number;
    product_variant: number | null;
    product_name?: string;
    quantity: number;
    unit_price: number;
    total_price?: number;
    prescription?: number | null;
}

export type OrderType = "cash" | "credit" | "insurance" | "bnpl" | "corporate" | "wholesale";
export type PaymentType = "cash" | "card" | "bank_transfer" | "mada" | "visa" | "master" |
    "apple_pay" | "stc_pay" | "tabby" | "tamara" | "insurance" | "credit" | "mixed";
export type PaymentStatus = "pending" | "partial" | "paid" | "refunded" | "disputed";
export type OrderStatus = "pending" | "confirmed" | "ready" | "delivered" | "cancelled";

export interface Order {
    id?: number;
    order_number?: string;
    customer: number;
    branch?: number | null;
    sales_person?: number | null;
    order_type: OrderType;
    payment_type: PaymentType;
    payment_status: PaymentStatus;
    status: OrderStatus;
    items: OrderItem[];
    subtotal?: number;
    tax_rate?: number;
    tax_amount?: number;
    discount_amount?: number;
    total_amount?: number;
    paid_amount?: number;
    notes?: string;
    internal_notes?: string;
    expected_delivery?: string | null;
}

export const ORDER_TYPE_OPTIONS = [
    { value: "cash", label: "نقدي" },
    { value: "credit", label: "آجل" },
    { value: "insurance", label: "تأمين" },
    { value: "bnpl", label: "تقسيط (BNPL)" },
    { value: "corporate", label: "شركات" },
    { value: "wholesale", label: "جملة" },
];

export const PAYMENT_TYPE_OPTIONS = [
    { value: "cash", label: "نقدي" },
    { value: "card", label: "بطاقة" },
    { value: "bank_transfer", label: "تحويل بنكي" },
    { value: "mada", label: "مدى" },
    { value: "visa", label: "فيزا" },
    { value: "master", label: "ماستر كارد" },
    { value: "apple_pay", label: "Apple Pay" },
    { value: "stc_pay", label: "STC Pay" },
    { value: "tabby", label: "تابي" },
    { value: "tamara", label: "تمارا" },
    { value: "insurance", label: "تأمين" },
    { value: "credit", label: "آجل" },
    { value: "mixed", label: "مختلط" },
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

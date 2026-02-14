export type PaymentMethod = string;

export type PaymentStatus =
  | "pending"
  | "completed"
  | "failed"
  | "refunded"
  | "cancelled"
  | "processing"
  | "partial"
  | "disputed";

export interface PaymentCreate {
  invoice?: number | null;
  order?: number | null;
  amount: string;
  currency?: string;
  payment_method?: number | null;
  partner?: number | null;
  is_installment?: boolean;
  installments_count?: number;
  card_last_four?: string;
  card_brand?: string;
  cheque_number?: string;
  cheque_bank?: string;
  cheque_date?: string | null;
  transfer_reference?: string;
  transfer_bank?: string;
  notes?: string;
}

export interface Payment {
  id: number;
  invoice?: number | null;
  invoice_number: string;
  order?: number | null;
  order_number: string;
  amount: string;
  amount_base?: string;
  amount_foreign?: string;
  currency?: string;
  exchange_rate?: string;
  payment_method?: number | null;
  payment_method_display: string;
  payment_method_name_en?: string;
  payment_method_code?: string;
  status?: PaymentStatus;
  status_display: string;
  payer_content_type?: number | null;
  payer_object_id?: number | null;
  partner?: number | null;
  partner_name?: string;
  gateway_transaction_id?: string;
  gateway_reference?: string;
  is_installment?: boolean;
  installments_count?: number;
  installment_amount?: string | null;
  bnpl_order_id?: string;
  card_last_four?: string;
  card_brand?: string;
  cheque_number?: string;
  cheque_bank?: string;
  cheque_date?: string | null;
  transfer_reference?: string;
  transfer_bank?: string;
  paid_at?: string | null;
  refunded_at?: string | null;
  refund_amount?: string;
  notes?: string;
  created_by?: number | null;
  created_at: string;
  updated_at: string;
}

export interface InstallmentStatusDetails {
  id: number;
  name: string;
  color: string;
  icon: string;
  status: string;
}

export type InstallmentStatus =
  | "pending"
  | "due"
  | "paid"
  | "overdue"
  | "cancelled";

export interface Installment {
  id: number;
  payment: number;
  installment_number: number;
  amount: string;
  due_date: string;
  status?: InstallmentStatus;
  status_display: string;
  paid_at?: string | null;
  paid_amount?: string;
}

export type BNPLProvider = "tabby" | "tamara";

export interface BNPLSession {
  success: boolean;
  checkout_url: string;
  session_id: string;
  payment_id: number;
  gateway: string;
  installments?: unknown[];
}

export interface BNPLSessionCreate {
  order_id: number;
  gateway: BNPLProvider;
  installments_count?: number;
  success_url: string;
  cancel_url: string;
  failure_url: string;
  webhook_url?: string;
}

export interface PaymentSummary {
  period: string;
  total: {
    amount: string;
    count: number;
  };
  by_method: unknown[];
  installments: {
    amount: string;
    count: number;
  };
}

export interface RefundRequest {
  amount?: string;
  reason?: string;
}

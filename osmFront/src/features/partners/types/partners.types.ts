// features/partners/types/partners.types.ts
/**
 * Types for Partners & Insurance Module
 * Synced with Backend Serializers
 */

export type PartnerType =
  | "insurance"
  | "bnpl"
  | "corporate"
  | "wholesaler"
  | "agent"
  | "healthcare"
  | "insurance_company"
  | "government"
  | "other";

export interface ClaimCreate {
  customer: number;
  partner: number;
  customer_partner_link: number;
  order: number;
  order_number: string;
  claim_date: string;
  submission_date?: string;
  response_date?: string;
  payment_date?: string;
  total_amount: string;
  claim_amount: string;
  approved_amount: string;
  paid_amount: string;
  patient_share: string;
  status: ClaimStatus;
  status_display: string;
  rejection_reason?: string;
  partial_reason?: string;
  notes?: string;
  internal_notes?: string;
  items: ClaimItem[];
  attached_documents: ClaimDocument[];
}

export interface PartnerStatement {
  id: number;
  partner: Partner;
  partner_name: string;
  statement_number: string;
  statement_date: string;
  period_start: string;
  period_end: string;
  total_claims: number;
  total_amount: string;
  adjustments: string;
  net_amount: string;
  status: string;
  status_display: string;
  payment_date?: string;
  payment_reference?: string;
  notes?: string;
  closing_balance: string;
  opening_balance: string;
  summary: PartnerStatementSummary;
  transactions: PartnerTransaction[];
}

export interface PartnerTransaction {
  date: string;
  type: "claim" | "payment";
  reference: string;
  debit: string;
  credit: string;
  balance: string;
  description?: string;
}
export interface PartnerStatementSummary {
  total_claims: string;
  total_payments: string;
  count: number;
  total_amount: string;
}
export interface PaymentSplit {
  partner_share: number;
  patient_share_percentage: number;
  customer_share: number;
  total_amount: number;
}
export type PaymentTerms =
  | "immediate"
  | "7_days"
  | "15_days"
  | "30_days"
  | "60_days"
  | "90_days";

export type ClaimStatus =
  | "draft"
  | "pending"
  | "submitted"
  | "under_review"
  | "approved"
  | "partial"
  | "partially_paid"
  | "rejected"
  | "paid"
  | "cancelled";

export interface Partner {
  id: number;
  name: string;
  name_en?: string;
  partner_type: PartnerType;
  partner_type_display?: string;
  code: string;
  logo?: string | null;
  contact_person?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  // Contract
  contract_number?: string;
  contract_start?: string;
  contract_end?: string;
  is_contract_active?: boolean;
  // Financial
  payment_terms: PaymentTerms;
  default_discount: string;
  credit_limit: string;
  current_balance: string;
  available_credit: string;
  patient_share_percentage: string;
  tax_number?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  contract_start_date?: string;
  contract_end_date?: string;
  credit_limit_used?: string;
  discount_percentage: string;
  payment_terms_days: number;
}

export interface PartnerBranch {
  id: number;
  partner: number;
  partner_name: string;
  branch: number;
  branch_name: string;
  special_discount?: string;
  is_active: boolean;
}

export interface CustomerPartnerLink {
  id: number;
  customer: number;
  customer_name: string;
  partner: number;
  partner_name: string;
  partner_type: string;
  membership_number?: string;
  policy_number?: string;
  coverage_start?: string;
  coverage_end?: string;
  annual_limit?: string;
  remaining_limit?: string;
  patient_share_percentage?: string;
  max_patient_share?: string;
  insurance_class?: string;
  is_active: boolean;
  is_coverage_active: boolean;
  notes?: string;
  member_id?: string;
  coverage_class?: string;
}

export interface ClaimItem {
  id: number;
  claim: number;
  order_item: number;
  description: string;
  quantity: number;
  unit_price: string;
  total_price: string;
  claim_amount: string;
  approved_amount: string;
  insurance_code?: string;
}

export interface ClaimDocument {
  id: number;
  claim: number;
  document_type: string;
  document_type_display: string;
  title: string;
  file: string;
  notes?: string;
  created_at: string;
}

export interface InsuranceClaim {
  id: number;
  claim_number: string;
  external_claim_number?: string;
  order: number;
  order_number: string;
  partner: number;
  partner_name: string;
  customer_partner_link?: number;
  customer_name: string;
  partner_share: string;
  // customer_share: string;

  // Dates
  claim_date: string;
  submission_date?: string;
  response_date?: string;
  payment_date?: string;

  // Amounts
  total_amount: string;
  claim_amount: string;
  approved_amount: string;
  paid_amount: string;
  patient_share: string;

  status: ClaimStatus;
  status_display: string;

  rejection_reason?: string;
  partial_reason?: string;
  notes?: string;
  internal_notes?: string;

  items: ClaimItem[];
  attached_documents: ClaimDocument[];

  created_at: string;
  updated_at: string;
}

export interface PartnerSettlement {
  id: number;
  settlement_number: string;
  partner: number;
  partner_name: string;
  settlement_date: string;
  period_start: string;
  period_end: string;
  total_claims: number;
  total_amount: string;
  adjustments: string;
  net_amount: string;
  status: string;
  status_display: string;
  payment_date?: string;
  payment_reference?: string;
  notes?: string;
}

export interface FlexiblePrice {
  id: number;
  variant: number;
  variant_name?: string; // Hypothetical, usually handled by API expansion
  customer?: number;
  customer_name?: string;
  customer_group?: number;
  customer_group_name?: string;
  branch?: number;
  branch_name?: string;
  pricing_tier?: string;
  partner?: number;
  partner_name?: string;
  special_price: string;
  discount_percentage?: string;
  start_date?: string;
  end_date?: string;
  min_quantity: number;
  max_quantity?: number;
  currency: string;
  priority: number;
  active: boolean; // Computed from dates helper?
}

// Dashboard Stats Interface (Keep existing or update as needed)
export interface PartnerDashboard {
  total_partners: number;
  active_claims: number;
  pending_amount: string;
  month_stats: {
    claims_count: number;
    total_claimed: string;
    total_paid: string;
  };
  claims_by_status: {
    status: ClaimStatus;
    count: number;
    amount: string;
  }[];
}

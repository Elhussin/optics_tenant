// features/partners/types/partners.types.ts
/**
 * Types for Partners & Insurance Module
 */

export type PartnerType =
    | 'insurance_company'
    | 'corporate'
    | 'government'
    | 'healthcare'
    | 'other';

export type ClaimStatus =
    | 'pending'
    | 'submitted'
    | 'approved'
    | 'rejected'
    | 'paid'
    | 'partially_paid';

export interface Partner {
    id: number;
    name: string;
    name_en?: string;
    partner_type: PartnerType;
    contact_person?: string;
    phone?: string;
    email?: string;
    address?: string;
    tax_number?: string;
    discount_percentage: string;
    payment_terms_days: number;
    credit_limit: string;
    current_balance: string;
    is_active: boolean;
    notes?: string;
    contract_start_date?: string;
    contract_end_date?: string;
    created_at: string;
    website?:string;
}

export interface PartnerCustomer {
    id: number;
    customer: number;
    customer_name: string;
    partner: number;
    partner_name: string;
    membership_number?: string;
    coverage_percentage: string;
    coverage_limit?: string;
    is_active: boolean;
    start_date?: string;
    end_date?: string;
}

export interface InsuranceClaim {
    id: number;
    claim_number: string;
    order: number;
    order_number: string;
    partner: number;
    partner_name: string;
    customer: number;
    customer_name: string;
    claim_date: string;
    total_amount: string;
    partner_share: string;
    customer_share: string;
    approved_amount?: string;
    status: ClaimStatus;
    submission_date?: string;
    approval_date?: string;
    payment_date?: string;
    rejection_reason?: string;
    notes?: string;
    created_at: string;
}

export interface ClaimCreate {
    order_id: number;
    partner_id: number;
    customer_id: number;
    total_amount: string;
    partner_share: string;
    customer_share: string;
    notes?: string;
}

export interface PartnerStatement {
    partner: {
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
    transactions: {
        date: string;
        type: 'claim' | 'payment';
        reference: string;
        debit: string;
        credit: string;
        balance: string;
    }[];
    closing_balance: string;
    summary: {
        total_claims: string;
        total_payments: string;
        pending_claims: number;
    };
}

export interface PartnerDashboard {
    total_partners: number;
    active_claims: number;
    pending_amount: string;
    month_stats: {
        claims_count: number;
        total_claimed: string;
        total_paid: string;
    };
    top_partners: {
        partner_id: number;
        name: string;
        claims_count: number;
        total_amount: string;
    }[];
    claims_by_status: {
        status: ClaimStatus;
        count: number;
        amount: string;
    }[];
}

export interface PaymentSplit {
    total_amount: number;
    partner_share: number;
    customer_share: number;
    coverage_percentage: number;
}

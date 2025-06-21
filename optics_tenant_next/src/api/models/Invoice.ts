/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { InvoiceItem } from './InvoiceItem';
import type { InvoiceStatusEnum } from './InvoiceStatusEnum';
import type { InvoiceTypeEnum } from './InvoiceTypeEnum';
export type Invoice = {
    readonly id: number;
    items: Array<InvoiceItem>;
    readonly created_at: string;
    readonly updated_at: string;
    is_active?: boolean;
    is_deleted?: boolean;
    readonly subtotal: string;
    tax_rate?: string;
    readonly tax_amount: string;
    discount_amount?: string;
    readonly total_amount: string;
    paid_amount?: string;
    readonly invoice_number: string;
    invoice_type?: InvoiceTypeEnum;
    due_date?: string | null;
    readonly status: InvoiceStatusEnum;
    notes?: string | null;
    branch?: number | null;
    customer: number;
    readonly created_by: number | null;
    order?: number | null;
};


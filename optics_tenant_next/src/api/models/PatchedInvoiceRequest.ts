/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { InvoiceItemRequest } from './InvoiceItemRequest';
import type { InvoiceTypeEnum } from './InvoiceTypeEnum';
export type PatchedInvoiceRequest = {
    items?: Array<InvoiceItemRequest>;
    is_active?: boolean;
    is_deleted?: boolean;
    tax_rate?: string;
    discount_amount?: string;
    paid_amount?: string;
    invoice_type?: InvoiceTypeEnum;
    due_date?: string | null;
    notes?: string | null;
    branch?: number | null;
    customer?: number;
    order?: number | null;
};


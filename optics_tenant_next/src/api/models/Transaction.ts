/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TransactionTypeEnum } from './TransactionTypeEnum';
export type Transaction = {
    readonly id: number;
    date: string;
    readonly amount_currency: string;
    amount: string;
    transaction_type: TransactionTypeEnum;
    description?: string | null;
    readonly created_at: string;
    readonly updated_at: string;
    account: number;
    period: number;
    category?: number | null;
    tax_rate?: number | null;
};


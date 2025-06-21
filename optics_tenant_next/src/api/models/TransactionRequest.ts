/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TransactionTypeEnum } from './TransactionTypeEnum';
export type TransactionRequest = {
    date: string;
    amount: string;
    transaction_type: TransactionTypeEnum;
    description?: string | null;
    account: number;
    period: number;
    category?: number | null;
    tax_rate?: number | null;
};


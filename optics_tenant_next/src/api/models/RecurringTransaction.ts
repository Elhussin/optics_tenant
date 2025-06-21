/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { IntervalEnum } from './IntervalEnum';
import type { TransactionTypeEnum } from './TransactionTypeEnum';
export type RecurringTransaction = {
    readonly id: number;
    readonly amount_currency: string;
    amount: string;
    transaction_types: TransactionTypeEnum;
    interval: IntervalEnum;
    next_execution: string;
    account: number;
};


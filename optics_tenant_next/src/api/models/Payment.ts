/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PaymentMethodEnum } from './PaymentMethodEnum';
export type Payment = {
    readonly id: number;
    readonly created_at: string;
    readonly updated_at: string;
    is_active?: boolean;
    is_deleted?: boolean;
    amount: string;
    payment_method: PaymentMethodEnum;
    invoice: number;
};


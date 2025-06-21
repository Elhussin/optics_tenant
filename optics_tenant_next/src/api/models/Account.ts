/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CurrencyEnum } from './CurrencyEnum';
export type Account = {
    readonly id: number;
    name: string;
    readonly created_at: string;
    readonly updated_at: string;
    currency?: CurrencyEnum;
    user: number;
};


/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TransactionTypeEnum } from './TransactionTypeEnum';
export type Category = {
    readonly id: number;
    name: string;
    category_type: TransactionTypeEnum;
    description?: string | null;
    parent?: number | null;
};


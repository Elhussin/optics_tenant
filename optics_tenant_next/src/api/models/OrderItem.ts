/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type OrderItem = {
    readonly id: number;
    readonly created_at: string;
    readonly updated_at: string;
    is_active?: boolean;
    is_deleted?: boolean;
    quantity?: number;
    unit_price: string;
    readonly total_price: string;
    product_variant?: number | null;
    order: number;
    prescription?: number | null;
};


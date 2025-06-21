/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type OrderItemRequest = {
    is_active?: boolean;
    is_deleted?: boolean;
    quantity?: number;
    unit_price: string;
    product_variant?: number | null;
    order: number;
    prescription?: number | null;
};


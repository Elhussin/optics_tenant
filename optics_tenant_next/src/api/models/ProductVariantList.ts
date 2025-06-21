/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AttributeValue } from './AttributeValue';
export type ProductVariantList = {
    readonly id: number;
    /**
     * SKU (Stock Keeping Unit)
     */
    sku: string;
    /**
     * Unique USKU
     */
    readonly usku: string;
    readonly frame_color: AttributeValue;
    readonly lens_color: AttributeValue;
    selling_price: string;
    discount_percentage?: string;
    /**
     * Calculate the discount price for the product variant.
     *
     * Args:
     * obj: ProductVariant instance
     *
     * Returns:
     * float: Discounted price or None if no discount
     */
    readonly discount_price: number;
    is_active?: boolean;
};


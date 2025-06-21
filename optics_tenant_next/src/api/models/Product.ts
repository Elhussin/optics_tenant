/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Brand } from './Brand';
import type { Category } from './Category';
import type { Manufacturer } from './Manufacturer';
import type { ProductVariantList } from './ProductVariantList';
import type { Supplier } from './Supplier';
import type { TypeEnum } from './TypeEnum';
export type Product = {
    readonly id: number;
    readonly category: Category;
    readonly supplier: Supplier;
    readonly manufacturer: Manufacturer;
    readonly brand: Brand;
    model: string;
    type: TypeEnum;
    name?: string | null;
    description?: string;
    main_image?: string | null;
    readonly variants: Array<ProductVariantList>;
    is_active?: boolean;
    readonly created_at: string;
    readonly updated_at: string;
};


/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TypeEnum } from './TypeEnum';
export type ProductRequest = {
    category_id: number;
    supplier_id: number;
    manufacturer_id: number;
    brand_id: number;
    model: string;
    type: TypeEnum;
    name?: string | null;
    description?: string;
    main_image?: Blob | null;
    is_active?: boolean;
};


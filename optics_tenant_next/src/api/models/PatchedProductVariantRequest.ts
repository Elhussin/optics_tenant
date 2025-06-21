/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AdditionEnum } from './AdditionEnum';
import type { BlankEnum } from './BlankEnum';
import type { CylinderEnum } from './CylinderEnum';
import type { NullEnum } from './NullEnum';
import type { SphericalEnum } from './SphericalEnum';
export type PatchedProductVariantRequest = {
    product_id?: number;
    /**
     * SKU (Stock Keeping Unit)
     */
    sku?: string;
    frame_shape_id?: number | null;
    frame_material_id?: number | null;
    frame_color_id?: number | null;
    temple_length?: number | null;
    bridge_width?: number | null;
    lens_diameter?: number | null;
    lens_color?: number | null;
    lens_material?: number | null;
    lens_base_curve?: number | null;
    lens_water_content?: number | null;
    replacement_schedule?: number | null;
    expiration_date?: string | null;
    lens_coating_ids?: Array<number>;
    lens_type_id?: number | null;
    spherical?: (SphericalEnum | BlankEnum | NullEnum) | null;
    cylinder?: (CylinderEnum | BlankEnum | NullEnum) | null;
    axis?: number | null;
    addition?: (AdditionEnum | BlankEnum | NullEnum) | null;
    /**
     * Unit of measurement box piesces
     */
    unit?: number | null;
    warranty?: number | null;
    weight?: number | null;
    dimensions?: number | null;
    last_purchase_price?: string | null;
    selling_price?: string;
    discount_percentage?: string;
    is_active?: boolean;
};


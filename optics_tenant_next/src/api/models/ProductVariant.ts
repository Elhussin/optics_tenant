/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AdditionEnum } from './AdditionEnum';
import type { AttributeValue } from './AttributeValue';
import type { BlankEnum } from './BlankEnum';
import type { CylinderEnum } from './CylinderEnum';
import type { LensCoating } from './LensCoating';
import type { NullEnum } from './NullEnum';
import type { Product } from './Product';
import type { ProductImage } from './ProductImage';
import type { SphericalEnum } from './SphericalEnum';
export type ProductVariant = {
    readonly id: number;
    readonly product: Product;
    /**
     * SKU (Stock Keeping Unit)
     */
    sku: string;
    /**
     * Unique USKU
     */
    readonly usku: string;
    readonly frame_shape: AttributeValue;
    readonly frame_material: AttributeValue;
    readonly frame_color: AttributeValue;
    temple_length?: number | null;
    readonly temple_length_id: number | null;
    bridge_width?: number | null;
    readonly bridge_width_id: number | null;
    lens_diameter?: number | null;
    readonly lens_diameter_id: number | null;
    lens_color?: number | null;
    readonly lens_color_id: number | null;
    lens_material?: number | null;
    readonly lens_material_id: number | null;
    lens_base_curve?: number | null;
    readonly lens_base_curve_id: number | null;
    lens_water_content?: number | null;
    readonly lens_water_content_id: number | null;
    replacement_schedule?: number | null;
    readonly replacement_schedule_id: number | null;
    expiration_date?: string | null;
    readonly lens_coatings: Array<LensCoating>;
    readonly lens_type: AttributeValue;
    spherical?: (SphericalEnum | BlankEnum | NullEnum) | null;
    cylinder?: (CylinderEnum | BlankEnum | NullEnum) | null;
    axis?: number | null;
    addition?: (AdditionEnum | BlankEnum | NullEnum) | null;
    /**
     * Unit of measurement box piesces
     */
    unit?: number | null;
    /**
     * Unit of measurement box piesces
     */
    readonly unit_id: number | null;
    warranty?: number | null;
    readonly warranty_id: number | null;
    weight?: number | null;
    readonly weight_id: number | null;
    dimensions?: number | null;
    readonly dimensions_id: number | null;
    last_purchase_price?: string | null;
    selling_price: string;
    discount_percentage?: string;
    readonly discount_price: string;
    readonly images: Array<ProductImage>;
    is_active?: boolean;
    readonly created_at: string;
    readonly updated_at: string;
};


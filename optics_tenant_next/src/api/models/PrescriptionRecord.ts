/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AdditionEnum } from './AdditionEnum';
import type { BlankEnum } from './BlankEnum';
import type { CylinderEnum } from './CylinderEnum';
import type { NullEnum } from './NullEnum';
import type { SphericalEnum } from './SphericalEnum';
export type PrescriptionRecord = {
    readonly id: number;
    readonly created_at: string;
    readonly updated_at: string;
    is_active?: boolean;
    is_deleted?: boolean;
    right_sphere?: (SphericalEnum | BlankEnum | NullEnum) | null;
    right_cylinder?: (CylinderEnum | BlankEnum | NullEnum) | null;
    right_axis?: number | null;
    left_sphere?: (SphericalEnum | BlankEnum | NullEnum) | null;
    left_cylinder?: (CylinderEnum | BlankEnum | NullEnum) | null;
    left_axis?: number | null;
    right_reading_add?: (AdditionEnum | BlankEnum | NullEnum) | null;
    left_reading_add?: (AdditionEnum | BlankEnum | NullEnum) | null;
    right_pupillary_distance?: number | null;
    left_pupillary_distance?: number | null;
    sigmant_right?: string;
    sigmant_left?: string;
    a_v_right?: string;
    a_v_left?: string;
    doctor_name?: string;
    prescription_date: string;
    notes?: string;
    customer: number;
};


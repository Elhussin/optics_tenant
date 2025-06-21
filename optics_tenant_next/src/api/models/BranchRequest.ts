/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BranchTypeEnum } from './BranchTypeEnum';
export type BranchRequest = {
    is_active?: boolean;
    is_deleted?: boolean;
    name: string;
    branch_code: string;
    branch_type: BranchTypeEnum;
    country?: string;
    city?: string;
    address?: string;
    phone?: string;
    email?: string;
    is_main_branch?: boolean;
    allows_online_orders?: boolean;
    /**
     * Store operating hours for each day
     */
    operating_hours?: any;
};


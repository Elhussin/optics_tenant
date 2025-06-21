/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BranchUsersRoleEnum } from './BranchUsersRoleEnum';
export type PatchedBranchUsersRequest = {
    is_active?: boolean;
    is_deleted?: boolean;
    role?: BranchUsersRoleEnum;
    status?: boolean;
    notes?: string | null;
    branch?: number;
    employee?: number;
};


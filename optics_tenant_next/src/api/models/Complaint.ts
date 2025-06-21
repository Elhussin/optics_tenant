/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ComplaintStatusEnum } from './ComplaintStatusEnum';
export type Complaint = {
    readonly id: number;
    readonly created_at: string;
    readonly updated_at: string;
    is_active?: boolean;
    is_deleted?: boolean;
    description: string;
    status?: ComplaintStatusEnum;
    customer: number;
};


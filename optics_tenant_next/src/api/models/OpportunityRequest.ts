/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { StageEnum } from './StageEnum';
export type OpportunityRequest = {
    is_active?: boolean;
    is_deleted?: boolean;
    title: string;
    stage?: StageEnum;
    amount?: string | null;
    customer: number;
};


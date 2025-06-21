/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SubscriptionTypeEnum } from './SubscriptionTypeEnum';
export type PatchedSubscriptionRequest = {
    is_active?: boolean;
    is_deleted?: boolean;
    subscription_type?: SubscriptionTypeEnum;
    end_date?: string;
    customer?: number;
};


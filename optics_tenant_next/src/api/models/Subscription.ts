/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SubscriptionTypeEnum } from './SubscriptionTypeEnum';
export type Subscription = {
    readonly id: number;
    readonly created_at: string;
    readonly updated_at: string;
    is_active?: boolean;
    is_deleted?: boolean;
    subscription_type: SubscriptionTypeEnum;
    readonly start_date: string;
    end_date: string;
    customer: number;
};


/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OrderItemRequest } from './OrderItemRequest';
import type { OrderStatusEnum } from './OrderStatusEnum';
import type { OrderTypeEnum } from './OrderTypeEnum';
import type { PaymentStatusEnum } from './PaymentStatusEnum';
import type { PaymentTypeEnum } from './PaymentTypeEnum';
export type PatchedOrderRequest = {
    items?: Array<OrderItemRequest>;
    is_active?: boolean;
    is_deleted?: boolean;
    tax_rate?: string;
    discount_amount?: string;
    paid_amount?: string;
    order_type?: OrderTypeEnum;
    status?: OrderStatusEnum;
    payment_status?: PaymentStatusEnum;
    payment_type?: PaymentTypeEnum;
    notes?: string;
    internal_notes?: string;
    expected_delivery?: string | null;
    branch?: number | null;
    customer?: number;
    sales_person?: number | null;
};


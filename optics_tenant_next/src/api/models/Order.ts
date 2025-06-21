/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OrderItem } from './OrderItem';
import type { OrderStatusEnum } from './OrderStatusEnum';
import type { OrderTypeEnum } from './OrderTypeEnum';
import type { PaymentStatusEnum } from './PaymentStatusEnum';
import type { PaymentTypeEnum } from './PaymentTypeEnum';
export type Order = {
    readonly id: number;
    items: Array<OrderItem>;
    readonly created_at: string;
    readonly updated_at: string;
    is_active?: boolean;
    is_deleted?: boolean;
    readonly subtotal: string;
    tax_rate?: string;
    readonly tax_amount: string;
    discount_amount?: string;
    readonly total_amount: string;
    paid_amount?: string;
    order_type?: OrderTypeEnum;
    readonly order_number: string;
    status?: OrderStatusEnum;
    payment_status?: PaymentStatusEnum;
    payment_type?: PaymentTypeEnum;
    notes?: string;
    internal_notes?: string;
    readonly confirmed_at: string | null;
    readonly delivered_at: string | null;
    expected_delivery?: string | null;
    branch?: number | null;
    customer: number;
    sales_person?: number | null;
};


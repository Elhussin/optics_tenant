/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NotificationTypeEnum } from './NotificationTypeEnum';
export type Notification = {
    readonly id: number;
    notification_type: NotificationTypeEnum;
    message?: string | null;
    is_read?: boolean;
    readonly created_at: string;
    employee: number;
};


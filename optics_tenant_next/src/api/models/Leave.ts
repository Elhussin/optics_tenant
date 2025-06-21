/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LeaveStatusEnum } from './LeaveStatusEnum';
import type { LeaveTypeEnum } from './LeaveTypeEnum';
export type Leave = {
    readonly id: number;
    leave_type: LeaveTypeEnum;
    readonly start_date: string;
    end_date?: string | null;
    status?: LeaveStatusEnum;
    employee: number;
};


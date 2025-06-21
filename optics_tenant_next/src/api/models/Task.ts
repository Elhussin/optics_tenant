/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PriorityEnum } from './PriorityEnum';
export type Task = {
    readonly id: number;
    readonly created_at: string;
    readonly updated_at: string;
    is_active?: boolean;
    is_deleted?: boolean;
    title: string;
    description?: string | null;
    priority?: PriorityEnum;
    due_date?: string | null;
    completed?: boolean;
    customer?: number | null;
    opportunity?: number | null;
};


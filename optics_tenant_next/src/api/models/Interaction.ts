/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { InteractionTypeEnum } from './InteractionTypeEnum';
export type Interaction = {
    readonly id: number;
    readonly created_at: string;
    readonly updated_at: string;
    is_active?: boolean;
    is_deleted?: boolean;
    interaction_type: InteractionTypeEnum;
    notes?: string | null;
    customer: number;
};


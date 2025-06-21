/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Document = {
    readonly id: number;
    readonly created_at: string;
    readonly updated_at: string;
    is_active?: boolean;
    is_deleted?: boolean;
    title: string;
    file: string;
    customer?: number | null;
};


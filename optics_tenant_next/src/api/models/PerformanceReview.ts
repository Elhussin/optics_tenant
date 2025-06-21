/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RatingEnum } from './RatingEnum';
export type PerformanceReview = {
    readonly id: number;
    readonly review_date: string;
    rating: RatingEnum;
    comments?: string | null;
    employee: number;
};


/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CustomerTypeEnum } from './CustomerTypeEnum';
import type { PreferredContactEnum } from './PreferredContactEnum';
export type CustomerRequest = {
    is_active?: boolean;
    is_deleted?: boolean;
    first_name?: string;
    last_name?: string;
    /**
     * Enter a valid identification number 10 digits.
     */
    identification_number: string;
    email?: string;
    phone?: string;
    date_of_birth?: string | null;
    customer_type?: CustomerTypeEnum;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    postal_code?: string;
    is_vip?: boolean;
    loyalty_points?: number;
    accepts_marketing?: boolean;
    registration_number?: string | null;
    tax_number?: string | null;
    preferred_contact?: PreferredContactEnum;
    website?: string | null;
    logo?: Blob | null;
    description?: string | null;
    user: number;
};


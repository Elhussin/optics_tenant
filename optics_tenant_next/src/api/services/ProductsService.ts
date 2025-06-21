/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PatchedProductVariantRequest } from '../models/PatchedProductVariantRequest';
import type { ProductVariant } from '../models/ProductVariant';
import type { ProductVariantRequest } from '../models/ProductVariantRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ProductsService {
    /**
     * @returns ProductVariant
     * @throws ApiError
     */
    public static productsVariantsList(): CancelablePromise<Array<ProductVariant>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/products/variants/',
        });
    }
    /**
     * @param requestBody
     * @returns ProductVariant
     * @throws ApiError
     */
    public static productsVariantsCreate(
        requestBody: ProductVariantRequest,
    ): CancelablePromise<ProductVariant> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/products/variants/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this Product Variant.
     * @returns ProductVariant
     * @throws ApiError
     */
    public static productsVariantsRetrieve(
        id: number,
    ): CancelablePromise<ProductVariant> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/products/variants/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id A unique integer value identifying this Product Variant.
     * @param requestBody
     * @returns ProductVariant
     * @throws ApiError
     */
    public static productsVariantsUpdate(
        id: number,
        requestBody: ProductVariantRequest,
    ): CancelablePromise<ProductVariant> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/products/variants/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this Product Variant.
     * @param requestBody
     * @returns ProductVariant
     * @throws ApiError
     */
    public static productsVariantsPartialUpdate(
        id: number,
        requestBody?: PatchedProductVariantRequest,
    ): CancelablePromise<ProductVariant> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/products/variants/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this Product Variant.
     * @returns void
     * @throws ApiError
     */
    public static productsVariantsDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/products/variants/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id A unique integer value identifying this Product Variant.
     * @param requestBody
     * @returns ProductVariant
     * @throws ApiError
     */
    public static productsVariantsCalculatePriceCreate(
        id: number,
        requestBody: ProductVariantRequest,
    ): CancelablePromise<ProductVariant> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/products/variants/{id}/calculate-price/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns ProductVariant
     * @throws ApiError
     */
    public static productsVariantsSearchRetrieve(): CancelablePromise<ProductVariant> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/products/variants/search/',
        });
    }
}

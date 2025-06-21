/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PatchedPrescriptionRecordRequest } from '../models/PatchedPrescriptionRecordRequest';
import type { PrescriptionRecord } from '../models/PrescriptionRecord';
import type { PrescriptionRecordRequest } from '../models/PrescriptionRecordRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PrescriptionsService {
    /**
     * @returns PrescriptionRecord
     * @throws ApiError
     */
    public static prescriptionsPrescriptionList(): CancelablePromise<Array<PrescriptionRecord>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/prescriptions/prescription/',
        });
    }
    /**
     * @param requestBody
     * @returns PrescriptionRecord
     * @throws ApiError
     */
    public static prescriptionsPrescriptionCreate(
        requestBody: PrescriptionRecordRequest,
    ): CancelablePromise<PrescriptionRecord> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/prescriptions/prescription/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this prescription record.
     * @returns PrescriptionRecord
     * @throws ApiError
     */
    public static prescriptionsPrescriptionRetrieve(
        id: number,
    ): CancelablePromise<PrescriptionRecord> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/prescriptions/prescription/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id A unique integer value identifying this prescription record.
     * @param requestBody
     * @returns PrescriptionRecord
     * @throws ApiError
     */
    public static prescriptionsPrescriptionUpdate(
        id: number,
        requestBody: PrescriptionRecordRequest,
    ): CancelablePromise<PrescriptionRecord> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/prescriptions/prescription/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this prescription record.
     * @param requestBody
     * @returns PrescriptionRecord
     * @throws ApiError
     */
    public static prescriptionsPrescriptionPartialUpdate(
        id: number,
        requestBody?: PatchedPrescriptionRecordRequest,
    ): CancelablePromise<PrescriptionRecord> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/prescriptions/prescription/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this prescription record.
     * @returns void
     * @throws ApiError
     */
    public static prescriptionsPrescriptionDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/prescriptions/prescription/{id}/',
            path: {
                'id': id,
            },
        });
    }
}

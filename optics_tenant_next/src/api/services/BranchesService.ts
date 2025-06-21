/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Branch } from '../models/Branch';
import type { BranchRequest } from '../models/BranchRequest';
import type { BranchUsers } from '../models/BranchUsers';
import type { BranchUsersRequest } from '../models/BranchUsersRequest';
import type { PatchedBranchRequest } from '../models/PatchedBranchRequest';
import type { PatchedBranchUsersRequest } from '../models/PatchedBranchUsersRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class BranchesService {
    /**
     * @returns BranchUsers
     * @throws ApiError
     */
    public static branchesBranchUsersList(): CancelablePromise<Array<BranchUsers>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/branches/branch-users/',
        });
    }
    /**
     * @param requestBody
     * @returns BranchUsers
     * @throws ApiError
     */
    public static branchesBranchUsersCreate(
        requestBody: BranchUsersRequest,
    ): CancelablePromise<BranchUsers> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/branches/branch-users/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this branch users.
     * @returns BranchUsers
     * @throws ApiError
     */
    public static branchesBranchUsersRetrieve(
        id: number,
    ): CancelablePromise<BranchUsers> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/branches/branch-users/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id A unique integer value identifying this branch users.
     * @param requestBody
     * @returns BranchUsers
     * @throws ApiError
     */
    public static branchesBranchUsersUpdate(
        id: number,
        requestBody: BranchUsersRequest,
    ): CancelablePromise<BranchUsers> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/branches/branch-users/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this branch users.
     * @param requestBody
     * @returns BranchUsers
     * @throws ApiError
     */
    public static branchesBranchUsersPartialUpdate(
        id: number,
        requestBody?: PatchedBranchUsersRequest,
    ): CancelablePromise<BranchUsers> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/branches/branch-users/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this branch users.
     * @returns void
     * @throws ApiError
     */
    public static branchesBranchUsersDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/branches/branch-users/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns Branch
     * @throws ApiError
     */
    public static branchesBranchesList(): CancelablePromise<Array<Branch>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/branches/branches/',
        });
    }
    /**
     * @param requestBody
     * @returns Branch
     * @throws ApiError
     */
    public static branchesBranchesCreate(
        requestBody: BranchRequest,
    ): CancelablePromise<Branch> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/branches/branches/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this branch.
     * @returns Branch
     * @throws ApiError
     */
    public static branchesBranchesRetrieve(
        id: number,
    ): CancelablePromise<Branch> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/branches/branches/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id A unique integer value identifying this branch.
     * @param requestBody
     * @returns Branch
     * @throws ApiError
     */
    public static branchesBranchesUpdate(
        id: number,
        requestBody: BranchRequest,
    ): CancelablePromise<Branch> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/branches/branches/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this branch.
     * @param requestBody
     * @returns Branch
     * @throws ApiError
     */
    public static branchesBranchesPartialUpdate(
        id: number,
        requestBody?: PatchedBranchRequest,
    ): CancelablePromise<Branch> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/branches/branches/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this branch.
     * @returns void
     * @throws ApiError
     */
    public static branchesBranchesDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/branches/branches/{id}/',
            path: {
                'id': id,
            },
        });
    }
}

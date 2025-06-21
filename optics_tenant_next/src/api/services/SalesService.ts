/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Invoice } from '../models/Invoice';
import type { InvoiceRequest } from '../models/InvoiceRequest';
import type { Order } from '../models/Order';
import type { OrderRequest } from '../models/OrderRequest';
import type { PatchedInvoiceRequest } from '../models/PatchedInvoiceRequest';
import type { PatchedOrderRequest } from '../models/PatchedOrderRequest';
import type { PatchedPaymentRequest } from '../models/PatchedPaymentRequest';
import type { Payment } from '../models/Payment';
import type { PaymentRequest } from '../models/PaymentRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SalesService {
    /**
     * @returns Invoice
     * @throws ApiError
     */
    public static salesInvoicesList(): CancelablePromise<Array<Invoice>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/sales/invoices/',
        });
    }
    /**
     * @param requestBody
     * @returns Invoice
     * @throws ApiError
     */
    public static salesInvoicesCreate(
        requestBody: InvoiceRequest,
    ): CancelablePromise<Invoice> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/sales/invoices/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this invoice.
     * @returns Invoice
     * @throws ApiError
     */
    public static salesInvoicesRetrieve(
        id: number,
    ): CancelablePromise<Invoice> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/sales/invoices/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id A unique integer value identifying this invoice.
     * @param requestBody
     * @returns Invoice
     * @throws ApiError
     */
    public static salesInvoicesUpdate(
        id: number,
        requestBody: InvoiceRequest,
    ): CancelablePromise<Invoice> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/sales/invoices/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this invoice.
     * @param requestBody
     * @returns Invoice
     * @throws ApiError
     */
    public static salesInvoicesPartialUpdate(
        id: number,
        requestBody?: PatchedInvoiceRequest,
    ): CancelablePromise<Invoice> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/sales/invoices/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this invoice.
     * @returns void
     * @throws ApiError
     */
    public static salesInvoicesDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/sales/invoices/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id A unique integer value identifying this invoice.
     * @param requestBody
     * @returns Invoice
     * @throws ApiError
     */
    public static salesInvoicesCalculateTotalsCreate(
        id: number,
        requestBody: InvoiceRequest,
    ): CancelablePromise<Invoice> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/sales/invoices/{id}/calculate_totals/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this invoice.
     * @param requestBody
     * @returns Invoice
     * @throws ApiError
     */
    public static salesInvoicesConfirmCreate(
        id: number,
        requestBody: InvoiceRequest,
    ): CancelablePromise<Invoice> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/sales/invoices/{id}/confirm/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns any No response body
     * @throws ApiError
     */
    public static salesInvoicesChoicesRetrieve(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/sales/invoices/choices/',
        });
    }
    /**
     * @returns Order
     * @throws ApiError
     */
    public static salesOrdersList(): CancelablePromise<Array<Order>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/sales/orders/',
        });
    }
    /**
     * @param requestBody
     * @returns Order
     * @throws ApiError
     */
    public static salesOrdersCreate(
        requestBody: OrderRequest,
    ): CancelablePromise<Order> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/sales/orders/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this order.
     * @returns Order
     * @throws ApiError
     */
    public static salesOrdersRetrieve(
        id: number,
    ): CancelablePromise<Order> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/sales/orders/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id A unique integer value identifying this order.
     * @param requestBody
     * @returns Order
     * @throws ApiError
     */
    public static salesOrdersUpdate(
        id: number,
        requestBody: OrderRequest,
    ): CancelablePromise<Order> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/sales/orders/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this order.
     * @param requestBody
     * @returns Order
     * @throws ApiError
     */
    public static salesOrdersPartialUpdate(
        id: number,
        requestBody?: PatchedOrderRequest,
    ): CancelablePromise<Order> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/sales/orders/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this order.
     * @returns void
     * @throws ApiError
     */
    public static salesOrdersDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/sales/orders/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id A unique integer value identifying this order.
     * @param requestBody
     * @returns Order
     * @throws ApiError
     */
    public static salesOrdersCalculateTotalsCreate(
        id: number,
        requestBody: OrderRequest,
    ): CancelablePromise<Order> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/sales/orders/{id}/calculate_totals/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this order.
     * @param requestBody
     * @returns Order
     * @throws ApiError
     */
    public static salesOrdersCancelCreate(
        id: number,
        requestBody: OrderRequest,
    ): CancelablePromise<Order> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/sales/orders/{id}/cancel/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this order.
     * @param requestBody
     * @returns Order
     * @throws ApiError
     */
    public static salesOrdersConfirmCreate(
        id: number,
        requestBody: OrderRequest,
    ): CancelablePromise<Order> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/sales/orders/{id}/confirm/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns any No response body
     * @throws ApiError
     */
    public static salesOrdersChoicesRetrieve(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/sales/orders/choices/',
        });
    }
    /**
     * @returns Payment
     * @throws ApiError
     */
    public static salesPaymentsList(): CancelablePromise<Array<Payment>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/sales/payments/',
        });
    }
    /**
     * @param requestBody
     * @returns Payment
     * @throws ApiError
     */
    public static salesPaymentsCreate(
        requestBody: PaymentRequest,
    ): CancelablePromise<Payment> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/sales/payments/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this payment.
     * @returns Payment
     * @throws ApiError
     */
    public static salesPaymentsRetrieve(
        id: number,
    ): CancelablePromise<Payment> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/sales/payments/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id A unique integer value identifying this payment.
     * @param requestBody
     * @returns Payment
     * @throws ApiError
     */
    public static salesPaymentsUpdate(
        id: number,
        requestBody: PaymentRequest,
    ): CancelablePromise<Payment> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/sales/payments/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this payment.
     * @param requestBody
     * @returns Payment
     * @throws ApiError
     */
    public static salesPaymentsPartialUpdate(
        id: number,
        requestBody?: PatchedPaymentRequest,
    ): CancelablePromise<Payment> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/sales/payments/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this payment.
     * @returns void
     * @throws ApiError
     */
    public static salesPaymentsDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/sales/payments/{id}/',
            path: {
                'id': id,
            },
        });
    }
}

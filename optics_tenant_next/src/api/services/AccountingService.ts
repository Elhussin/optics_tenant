/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Account } from '../models/Account';
import type { AccountRequest } from '../models/AccountRequest';
import type { Category } from '../models/Category';
import type { CategoryRequest } from '../models/CategoryRequest';
import type { FinancialPeriod } from '../models/FinancialPeriod';
import type { FinancialPeriodRequest } from '../models/FinancialPeriodRequest';
import type { JournalEntry } from '../models/JournalEntry';
import type { JournalEntryRequest } from '../models/JournalEntryRequest';
import type { PatchedAccountRequest } from '../models/PatchedAccountRequest';
import type { PatchedCategoryRequest } from '../models/PatchedCategoryRequest';
import type { PatchedFinancialPeriodRequest } from '../models/PatchedFinancialPeriodRequest';
import type { PatchedJournalEntryRequest } from '../models/PatchedJournalEntryRequest';
import type { PatchedRecurringTransactionRequest } from '../models/PatchedRecurringTransactionRequest';
import type { PatchedTaxRequest } from '../models/PatchedTaxRequest';
import type { PatchedTransactionRequest } from '../models/PatchedTransactionRequest';
import type { RecurringTransaction } from '../models/RecurringTransaction';
import type { RecurringTransactionRequest } from '../models/RecurringTransactionRequest';
import type { Tax } from '../models/Tax';
import type { TaxRequest } from '../models/TaxRequest';
import type { Transaction } from '../models/Transaction';
import type { TransactionRequest } from '../models/TransactionRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AccountingService {
    /**
     * @returns Account
     * @throws ApiError
     */
    public static accountingAccountsList(): CancelablePromise<Array<Account>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/accounting/accounts/',
        });
    }
    /**
     * @param requestBody
     * @returns Account
     * @throws ApiError
     */
    public static accountingAccountsCreate(
        requestBody: AccountRequest,
    ): CancelablePromise<Account> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/accounting/accounts/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this account.
     * @returns Account
     * @throws ApiError
     */
    public static accountingAccountsRetrieve(
        id: number,
    ): CancelablePromise<Account> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/accounting/accounts/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id A unique integer value identifying this account.
     * @param requestBody
     * @returns Account
     * @throws ApiError
     */
    public static accountingAccountsUpdate(
        id: number,
        requestBody: AccountRequest,
    ): CancelablePromise<Account> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/accounting/accounts/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this account.
     * @param requestBody
     * @returns Account
     * @throws ApiError
     */
    public static accountingAccountsPartialUpdate(
        id: number,
        requestBody?: PatchedAccountRequest,
    ): CancelablePromise<Account> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/accounting/accounts/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this account.
     * @returns void
     * @throws ApiError
     */
    public static accountingAccountsDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/accounting/accounts/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns Category
     * @throws ApiError
     */
    public static accountingCategoriesList(): CancelablePromise<Array<Category>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/accounting/categories/',
        });
    }
    /**
     * @param requestBody
     * @returns Category
     * @throws ApiError
     */
    public static accountingCategoriesCreate(
        requestBody: CategoryRequest,
    ): CancelablePromise<Category> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/accounting/categories/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this category.
     * @returns Category
     * @throws ApiError
     */
    public static accountingCategoriesRetrieve(
        id: number,
    ): CancelablePromise<Category> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/accounting/categories/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id A unique integer value identifying this category.
     * @param requestBody
     * @returns Category
     * @throws ApiError
     */
    public static accountingCategoriesUpdate(
        id: number,
        requestBody: CategoryRequest,
    ): CancelablePromise<Category> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/accounting/categories/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this category.
     * @param requestBody
     * @returns Category
     * @throws ApiError
     */
    public static accountingCategoriesPartialUpdate(
        id: number,
        requestBody?: PatchedCategoryRequest,
    ): CancelablePromise<Category> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/accounting/categories/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this category.
     * @returns void
     * @throws ApiError
     */
    public static accountingCategoriesDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/accounting/categories/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns FinancialPeriod
     * @throws ApiError
     */
    public static accountingFinancialPeriodsList(): CancelablePromise<Array<FinancialPeriod>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/accounting/financial-periods/',
        });
    }
    /**
     * @param requestBody
     * @returns FinancialPeriod
     * @throws ApiError
     */
    public static accountingFinancialPeriodsCreate(
        requestBody: FinancialPeriodRequest,
    ): CancelablePromise<FinancialPeriod> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/accounting/financial-periods/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this financial period.
     * @returns FinancialPeriod
     * @throws ApiError
     */
    public static accountingFinancialPeriodsRetrieve(
        id: number,
    ): CancelablePromise<FinancialPeriod> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/accounting/financial-periods/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id A unique integer value identifying this financial period.
     * @param requestBody
     * @returns FinancialPeriod
     * @throws ApiError
     */
    public static accountingFinancialPeriodsUpdate(
        id: number,
        requestBody: FinancialPeriodRequest,
    ): CancelablePromise<FinancialPeriod> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/accounting/financial-periods/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this financial period.
     * @param requestBody
     * @returns FinancialPeriod
     * @throws ApiError
     */
    public static accountingFinancialPeriodsPartialUpdate(
        id: number,
        requestBody?: PatchedFinancialPeriodRequest,
    ): CancelablePromise<FinancialPeriod> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/accounting/financial-periods/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this financial period.
     * @returns void
     * @throws ApiError
     */
    public static accountingFinancialPeriodsDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/accounting/financial-periods/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns JournalEntry
     * @throws ApiError
     */
    public static accountingJournalEntriesList(): CancelablePromise<Array<JournalEntry>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/accounting/journal-entries/',
        });
    }
    /**
     * @param requestBody
     * @returns JournalEntry
     * @throws ApiError
     */
    public static accountingJournalEntriesCreate(
        requestBody: JournalEntryRequest,
    ): CancelablePromise<JournalEntry> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/accounting/journal-entries/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this journal entry.
     * @returns JournalEntry
     * @throws ApiError
     */
    public static accountingJournalEntriesRetrieve(
        id: number,
    ): CancelablePromise<JournalEntry> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/accounting/journal-entries/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id A unique integer value identifying this journal entry.
     * @param requestBody
     * @returns JournalEntry
     * @throws ApiError
     */
    public static accountingJournalEntriesUpdate(
        id: number,
        requestBody: JournalEntryRequest,
    ): CancelablePromise<JournalEntry> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/accounting/journal-entries/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this journal entry.
     * @param requestBody
     * @returns JournalEntry
     * @throws ApiError
     */
    public static accountingJournalEntriesPartialUpdate(
        id: number,
        requestBody?: PatchedJournalEntryRequest,
    ): CancelablePromise<JournalEntry> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/accounting/journal-entries/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this journal entry.
     * @returns void
     * @throws ApiError
     */
    public static accountingJournalEntriesDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/accounting/journal-entries/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns RecurringTransaction
     * @throws ApiError
     */
    public static accountingRecurringTransactionsList(): CancelablePromise<Array<RecurringTransaction>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/accounting/recurring-transactions/',
        });
    }
    /**
     * @param requestBody
     * @returns RecurringTransaction
     * @throws ApiError
     */
    public static accountingRecurringTransactionsCreate(
        requestBody: RecurringTransactionRequest,
    ): CancelablePromise<RecurringTransaction> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/accounting/recurring-transactions/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this recurring transaction.
     * @returns RecurringTransaction
     * @throws ApiError
     */
    public static accountingRecurringTransactionsRetrieve(
        id: number,
    ): CancelablePromise<RecurringTransaction> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/accounting/recurring-transactions/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id A unique integer value identifying this recurring transaction.
     * @param requestBody
     * @returns RecurringTransaction
     * @throws ApiError
     */
    public static accountingRecurringTransactionsUpdate(
        id: number,
        requestBody: RecurringTransactionRequest,
    ): CancelablePromise<RecurringTransaction> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/accounting/recurring-transactions/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this recurring transaction.
     * @param requestBody
     * @returns RecurringTransaction
     * @throws ApiError
     */
    public static accountingRecurringTransactionsPartialUpdate(
        id: number,
        requestBody?: PatchedRecurringTransactionRequest,
    ): CancelablePromise<RecurringTransaction> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/accounting/recurring-transactions/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this recurring transaction.
     * @returns void
     * @throws ApiError
     */
    public static accountingRecurringTransactionsDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/accounting/recurring-transactions/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns Tax
     * @throws ApiError
     */
    public static accountingTaxesList(): CancelablePromise<Array<Tax>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/accounting/taxes/',
        });
    }
    /**
     * @param requestBody
     * @returns Tax
     * @throws ApiError
     */
    public static accountingTaxesCreate(
        requestBody: TaxRequest,
    ): CancelablePromise<Tax> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/accounting/taxes/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this tax.
     * @returns Tax
     * @throws ApiError
     */
    public static accountingTaxesRetrieve(
        id: number,
    ): CancelablePromise<Tax> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/accounting/taxes/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id A unique integer value identifying this tax.
     * @param requestBody
     * @returns Tax
     * @throws ApiError
     */
    public static accountingTaxesUpdate(
        id: number,
        requestBody: TaxRequest,
    ): CancelablePromise<Tax> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/accounting/taxes/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this tax.
     * @param requestBody
     * @returns Tax
     * @throws ApiError
     */
    public static accountingTaxesPartialUpdate(
        id: number,
        requestBody?: PatchedTaxRequest,
    ): CancelablePromise<Tax> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/accounting/taxes/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this tax.
     * @returns void
     * @throws ApiError
     */
    public static accountingTaxesDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/accounting/taxes/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns Transaction
     * @throws ApiError
     */
    public static accountingTransactionsList(): CancelablePromise<Array<Transaction>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/accounting/transactions/',
        });
    }
    /**
     * @param requestBody
     * @returns Transaction
     * @throws ApiError
     */
    public static accountingTransactionsCreate(
        requestBody: TransactionRequest,
    ): CancelablePromise<Transaction> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/accounting/transactions/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this transaction.
     * @returns Transaction
     * @throws ApiError
     */
    public static accountingTransactionsRetrieve(
        id: number,
    ): CancelablePromise<Transaction> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/accounting/transactions/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id A unique integer value identifying this transaction.
     * @param requestBody
     * @returns Transaction
     * @throws ApiError
     */
    public static accountingTransactionsUpdate(
        id: number,
        requestBody: TransactionRequest,
    ): CancelablePromise<Transaction> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/accounting/transactions/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this transaction.
     * @param requestBody
     * @returns Transaction
     * @throws ApiError
     */
    public static accountingTransactionsPartialUpdate(
        id: number,
        requestBody?: PatchedTransactionRequest,
    ): CancelablePromise<Transaction> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/accounting/transactions/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id A unique integer value identifying this transaction.
     * @returns void
     * @throws ApiError
     */
    public static accountingTransactionsDestroy(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/accounting/transactions/{id}/',
            path: {
                'id': id,
            },
        });
    }
}

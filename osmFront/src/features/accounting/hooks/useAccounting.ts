// features/accounting/hooks/useAccounting.ts
/**
 * Accounting API Hooks
 */
"use client";
import { useState, useCallback } from 'react';
import { api } from '@/src/shared/api/axios';
import type {
    ChartOfAccount,
    AccountTreeNode,
    JournalEntry,
    JournalEntryCreate,
    TrialBalance,
    IncomeStatement,
    BalanceSheet,
    AccountLedger,
} from '../types/accounting.types';

/**
 * Hook for Chart of Accounts
 */
export function useChartOfAccounts() {
    const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
    const [tree, setTree] = useState<AccountTreeNode[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAccounts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.customRequest('accounting_chart_of_accounts_list');
            setAccounts(data.results || data);
        } catch (err: any) {
            setError(err?.message || 'فشل في جلب دليل الحسابات');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchTree = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.customRequest('accounting_chart_of_accounts_tree_retrieve');
            setTree(data);
        } catch (err: any) {
            setError(err?.message || 'فشل في جلب شجرة الحسابات');
        } finally {
            setLoading(false);
        }
    }, []);

    const setupDefaults = useCallback(async () => {
        setLoading(true);
        try {
            await api.customRequest('accounting_chart_of_accounts_setup_defaults_create');
            await fetchAccounts();
            return true;
        } catch (err: any) {
            setError(err?.message || 'فشل في إنشاء الحسابات الافتراضية');
            return false;
        } finally {
            setLoading(false);
        }
    }, [fetchAccounts]);

    const getAccountsByType = useCallback(async (accountType: string) => {
        try {
            const data = await api.customRequest('accounting_chart_of_accounts_by_type_retrieve', {
                account_type: accountType,
            });
            return data;
        } catch (err) {
            return [];
        }
    }, []);

    return {
        accounts,
        tree,
        loading,
        error,
        fetchAccounts,
        fetchTree,
        setupDefaults,
        getAccountsByType,
    };
}

/**
 * Hook for Journal Entries
 */
export function useJournalEntries() {
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchEntries = useCallback(async (params?: Record<string, any>) => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.customRequest('accounting_journal_entries_list', params);
            setEntries(data.results || data);
        } catch (err: any) {
            setError(err?.message || 'فشل في جلب قيود اليومية');
        } finally {
            setLoading(false);
        }
    }, []);

    const getEntry = useCallback(async (id: number) => {
        try {
            const data = await api.customRequest('accounting_journal_entries_retrieve', { id });
            return data;
        } catch (err) {
            return null;
        }
    }, []);

    const createEntry = useCallback(async (entry: JournalEntryCreate) => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.customRequest('accounting_journal_entries_create', entry);
            await fetchEntries();
            return data;
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || 'فشل في إنشاء القيد');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchEntries]);

    const postEntry = useCallback(async (id: number) => {
        setLoading(true);
        try {
            await api.customRequest('accounting_journal_entries_post_entry_create', { id });
            await fetchEntries();
            return true;
        } catch (err: any) {
            setError(err?.message || 'فشل في ترحيل القيد');
            return false;
        } finally {
            setLoading(false);
        }
    }, [fetchEntries]);

    const reverseEntry = useCallback(async (id: number) => {
        setLoading(true);
        try {
            const data = await api.customRequest('accounting_journal_entries_reverse_entry_create', { id });
            await fetchEntries();
            return data;
        } catch (err: any) {
            setError(err?.message || 'فشل في عكس القيد');
            return null;
        } finally {
            setLoading(false);
        }
    }, [fetchEntries]);

    const getUnposted = useCallback(async () => {
        try {
            const data = await api.customRequest('accounting_journal_entries_unposted_retrieve');
            return data;
        } catch (err) {
            return [];
        }
    }, []);

    return {
        entries,
        loading,
        error,
        fetchEntries,
        getEntry,
        createEntry,
        postEntry,
        reverseEntry,
        getUnposted,
    };
}

/**
 * Hook for Financial Reports
 */
export function useFinancialReports() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getTrialBalance = useCallback(async (asOfDate?: string): Promise<TrialBalance | null> => {
        setLoading(true);
        setError(null);
        try {
            const params = asOfDate ? { as_of_date: asOfDate } : {};
            const data = await api.customRequest('accounting_reports_trial_balance_retrieve', params);
            return data;
        } catch (err: any) {
            setError(err?.message || 'فشل في جلب ميزان المراجعة');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const getIncomeStatement = useCallback(async (
        startDate?: string,
        endDate?: string
    ): Promise<IncomeStatement | null> => {
        setLoading(true);
        setError(null);
        try {
            const params: Record<string, string> = {};
            if (startDate) params.start_date = startDate;
            if (endDate) params.end_date = endDate;

            const data = await api.customRequest('accounting_reports_income_statement_retrieve', params);
            return data;
        } catch (err: any) {
            setError(err?.message || 'فشل في جلب قائمة الدخل');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const getBalanceSheet = useCallback(async (asOfDate?: string): Promise<BalanceSheet | null> => {
        setLoading(true);
        setError(null);
        try {
            const params = asOfDate ? { as_of_date: asOfDate } : {};
            const data = await api.customRequest('accounting_reports_balance_sheet_retrieve', params);
            return data;
        } catch (err: any) {
            setError(err?.message || 'فشل في جلب الميزانية العمومية');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const getAccountLedger = useCallback(async (
        accountId: number,
        startDate?: string,
        endDate?: string
    ): Promise<AccountLedger | null> => {
        setLoading(true);
        setError(null);
        try {
            const params: Record<string, any> = { account_id: accountId };
            if (startDate) params.start_date = startDate;
            if (endDate) params.end_date = endDate;

            const data = await api.customRequest('accounting_reports_ledger_retrieve', params);
            return data;
        } catch (err: any) {
            setError(err?.message || 'فشل في جلب دفتر الأستاذ');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        getTrialBalance,
        getIncomeStatement,
        getBalanceSheet,
        getAccountLedger,
    };
}

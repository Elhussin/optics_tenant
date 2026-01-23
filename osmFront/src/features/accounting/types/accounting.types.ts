// features/accounting/types/accounting.types.ts
/**
 * Types for Accounting Module
 */

export type AccountType =
    | 'asset'
    | 'liability'
    | 'equity'
    | 'revenue'
    | 'expense';

export type AccountSubType =
    | 'current_asset'
    | 'fixed_asset'
    | 'current_liability'
    | 'long_term_liability'
    | 'owner_equity'
    | 'retained_earnings'
    | 'sales_revenue'
    | 'other_revenue'
    | 'cost_of_goods'
    | 'operating_expense'
    | 'other_expense';

export type NormalBalance = 'debit' | 'credit';

export interface ChartOfAccount {
    id: number;
    code: string;
    name: string;
    name_en?: string;
    account_type: AccountType;
    account_subtype?: AccountSubType;
    normal_balance: NormalBalance;
    parent?: number;
    parent_name?: string;
    is_active: boolean;
    is_system: boolean;
    is_header?: boolean;
    current_balance: string;
    description?: string;
    children?: ChartOfAccount[];
}

export interface AccountTreeNode extends ChartOfAccount {
    children: AccountTreeNode[];
    level: number;
    expanded?: boolean;
}

export type JournalEntryType =
    | 'general'
    | 'sales'
    | 'purchase'
    | 'receipt'
    | 'payment'
    | 'adjustment';

export type JournalEntrySource =
    | 'manual'
    | 'sales_invoice'
    | 'purchase_invoice'
    | 'payment'
    | 'adjustment';

export interface JournalLine {
    id?: number;
    account: number;
    account_name?: string;
    account_code?: string;
    debit_amount: string;
    credit_amount: string;
    description?: string;
}

export interface JournalEntry {
    id: number;
    entry_number: string;
    entry_date: string;
    entry_type: JournalEntryType;
    source_type: JournalEntrySource;
    source_id?: string;
    description: string;
    reference?: string;
    total_debit: string;
    total_credit: string;
    is_posted: boolean;
    posted_by?: number;
    posted_by_name?: string;
    posted_at?: string;
    lines: JournalLine[];
    created_at: string;
}

export interface JournalEntryCreate {
    entry_date: string;
    entry_type: JournalEntryType;
    description: string;
    reference?: string;
    lines: {
        account: number;
        debit_amount: string;
        credit_amount: string;
        description?: string;
    }[];
}

export interface TrialBalanceItem {
    account_code: string;
    account_name: string;
    account_type: string;
    debit: number | string;
    credit: number | string;
}

export interface TrialBalance {
    as_of_date: string;
    accounts: TrialBalanceItem[];
    totals: {
        debit: number | string;
        credit: number | string;
        is_balanced: boolean;
    };
    // Computed properties for compatibility
    items?: TrialBalanceItem[];
    total_debit?: string;
    total_credit?: string;
    is_balanced?: boolean;
}

export interface IncomeStatementSection {
    title: string;
    items: {
        account_id: number;
        account_name: string;
        amount: string;
    }[];
    total: string;
}

export interface IncomeStatement {
    period: {
        start_date: string;
        end_date: string;
    };
    revenue: IncomeStatementSection;
    cost_of_goods: IncomeStatementSection;
    gross_profit: string;
    operating_expenses: IncomeStatementSection;
    operating_income: string;
    other_income: IncomeStatementSection;
    other_expenses: IncomeStatementSection;
    net_income: string;
}

export interface BalanceSheetSection {
    title: string;
    items: {
        account_id: number;
        account_name: string;
        amount: string;
    }[];
    total: string;
}

export interface BalanceSheet {
    as_of_date: string;
    assets: {
        current: BalanceSheetSection;
        fixed: BalanceSheetSection;
        total: string;
    };
    liabilities: {
        current: BalanceSheetSection;
        long_term: BalanceSheetSection;
        total: string;
    };
    equity: BalanceSheetSection;
    total_liabilities_equity: string;
    is_balanced: boolean;
}

export interface LedgerEntry {
    date: string;
    entry_number: string;
    description: string;
    debit: string;
    credit: string;
    balance: string;
}

export interface AccountLedger {
    account: {
        code: string;
        name: string;
    };
    opening_balance: string | number;
    entries: LedgerEntry[];
    closing_balance: string | number;
    // Optional computed fields
    total_debit?: string;
    total_credit?: string;
}

export interface FinancialPeriod {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    is_closed: boolean;
}

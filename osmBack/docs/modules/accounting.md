# Accounting Module 📊

The Accounting module handles all financial transactions, bookkeeping, and reporting. It is built on standard **Double-Entry Bookkeeping** principles.

## 🗂️ Chart of Accounts

The system comes with a standard hierarchical Chart of Accounts (COA).

-   **Assets (1xxxx)**: Cash, Inventory, Receivables.
-   **Liabilities (2xxxx)**: Payables, Loans, Taxes.
-   **Equity (3xxxx)**: Capital, Retained Earnings.
-   **Revenue (4xxxx)**: Sales, Services.
-   **Expenses (5xxxx)**: Salaries, Rent, Cost of Goods Sold.

### Automatic Journal Entries (`auto_journal.py`)
To minimize manual errors, the system automatically creates journal entries for operational actions:

1.  **Sales Invoice**:
    -   Debit: Accounts Receivable / Cash
    -   Credit: Sales Revenue
    -   Credit: Tax Payable
2.  **Inventory Purchase**:
    -   Debit: Inventory Asset
    -   Credit: Accounts Payable / Cash

## 📝 Key Models

### `Transaction`
Represents a single financial event (Income/Expense). Automatically updates the balance of the associated Account upon saving.

### `JournalEntry` & `JournalLine`
Represents a formal accounting entry.
-   **JournalEntry**: Comparison header (Date, Reference, Status).
-   **JournalLine**: The actual debit/credit lines. **Must balance** (Total Debit = Total Credit) before posting.

## 📈 Financial Reports
The system generates real-time reports:
1.  **Trial Balance**: Summary of all account balances.
2.  **Income Statement (P&L)**: Revenue - Expenses over a period.
3.  **Balance Sheet**: Assets = Liabilities + Equity.

## 🔐 Permissions
-   `view_accounting`: Access read-only reports.
-   `manage_journal`: Create and post manual journal entries.
-   `close_period`: Ability to close the financial year.

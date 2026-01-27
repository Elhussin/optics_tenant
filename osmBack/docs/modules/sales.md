# Sales & Invoicing 💰

The Sales module handles the Point of Sale (POS) operations, order processing, and invoice generation.

## 🛒 Order Lifecycle

1.  **Draft/Cart**: User adds items to the cart.
2.  **Creation**: `Order` is created with status `pending`.
    -   Stock is reserved (temporarily deducted).
3.  **Confirmation**: Status becomes `confirmed`.
    -   Financial transaction is recorded.
    -   Stock deduction is finalized.
4.  **Payment**: Status becomes `paid` or `partially_paid`.
    -   Payment record is created.
5.  **Completion**: Order is fulfilled/delivered (`completed`).

## 🧾 Invoices

The system supports two types of invoices compliant with ZATCA (Saudi Tax Authority):
1.  **Simplified Tax Invoice**: For B2C transactions (end consumers).
2.  **Standard Tax Invoice**: For B2B transactions (requires customer VAT number).

**Formatting:**
-   Invoices include QR Codes.
-   Amounts are calculated to 2 decimal places.
-   VAT (15%) is clearly separated.

## 💳 Payments

-   **Methods**: Cash, Card (Mada/Visa), Bank Transfer.
-   **Split Payments**: An order can be paid partially by Cash and partially by Card.

## 🔁 Returns & Refunds
-   Supports full or partial returns.
-   Automatically reverses the Stock Movement and creates a Credit Note (Financial Reversal).

Order System Integration Plan
Goal Description
Integrate the Backend Sales/Order system fully with the Frontend. Currently, the Frontend lacks an Order List page, uses hardcoded payment methods (mismatched with Backend's dynamic ones), and does not fully visualize Invoices and Payments associated with Orders. This plan aims to bridge these gaps and provide a premium "Order Management" experience.

User Review Required
IMPORTANT

Payment Methods: The frontend currently uses hardcoded payment types. I will switch this to fetch dynamic 
PaymentMethod
s from the backend (/api/payment-methods/). This ensures compatibility with the backend model.

Proposed Changes
Frontend (osmFront)
[NEW] Order List Page
File: src/features/orders/pages/OrdersListPage.tsx
Route: src/app/[locale]/dashboard/orders/page.tsx
Description: A comprehensive data table listing orders with:
Columns: Order #, Customer, Status, Total, Date, Payment Status.
Filters: Status, Date Range, Customer.
Actions: View, Edit, Cancel (if applicable).
[MODIFY] Order Creation Feature
Path: src/features/orders/create/
Changes:
Replace PAYMENT_TYPE_OPTIONS with data fetched from /api/payment-methods/.
Ensure 
OrderType
 selection updates the UI (e.g., showing Partner selection for Insurance/BNPL).
Integrate 
partner
 selection for insurance, bnpl, corporate order types.
[MODIFY] Order View Feature
Path: src/features/orders/view/
Changes:
Add Invoices Section: List invoices related to the order.
Add Payments Section: List payments and installments.
Add Action Buttons: "Deliver Order" (triggers invoice creation), "Add Payment" (if balance pending).
Status Timeline: Visualize confirmed_at, ready_at, delivered_at.
[NEW] Shared Services/Types
Path: 
src/features/orders/types/index.ts
Changes: Add 
Invoice
, 
Payment
, 
PaymentMethod
 interfaces matching backend.
Path: src/features/orders/services/orderService.ts
Changes: Add methods for fetching lists, payment methods, and invoice actions.
Verification Plan
Automated Tests
Run bun run build to ensure type safety.
Use browser tool to verify:
List Page: Loads and shows orders.
Create Order: Can select a dynamic payment method and submit.
View Order: Shows the created order, and after "Deliver" action, shows the generated Invoice.
Manual Verification
List Page: Navigate to /dashboard/orders. Verify list is populated.
Create Flow: Create a "Cash" order. Verify it appears in list.
Integration: Create an "Insurance" order. Verify Partner selection appears. This confirms dynamic form logic.
Lifecycle: Open an order -> Click "Ready" -> Click "Deliver". Verify Invoice is created in the backend and visible on screen.

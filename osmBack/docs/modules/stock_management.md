# Stock Management 📦

The Stock Management module provides comprehensive tools for tracking inventory, managing procurement, and handling inter-branch transfers.

## 📊 Core Concepts

### Stock
Represents the quantity of a specific **Product Variant** held at a specific **Branch**.
- **Quantity**: Current physical count.
- **Available**: Quantity items not reserved.
- **Average Cost**: Weighted average cost of inventory on hand.

### Stock Movements
Every change to inventory is an immutable ledger entry.
- **Purchase**: Adds stock (increases qty, updates average cost).
- **Sale**: Removes stock (decreases qty).
- **Transfer**: Moving stock between branches.
- **Return**: Customer returning items (increases qty).
- **Return to Supplier**: Sending items back to vendor (decreases qty).
- **Adjustment**: Manual correction (cycle counts).

---

## 🛠️ Key Features

### 1. Purchase Orders (Procurement)
Manage the full purchasing lifecycle:
- **Draft**: Create order, add items, set expected dates.
- **Submitted**: Send to approval workflow.
- **Approved**: Authorized for receipt.
- **Received**: 
    - Automatically creates "Purchase" stock movements.
    - Updates stock quantities.
    - Recalculates average costs based on incoming unit costs.

### 2. Stock Transfers
Move inventory between branches with a controlled process:
- **Request**: Source branch requests items.
- **Approve**: Warehouse/Manager approves.
- **Ship**: Source branch ships (deducts stock immediately).
- **Receive**: Destination branch confirms receipt (adds stock).
*Note: Items in transit are tracked separately.*

### 3. Manual Movements & Returns
For ad-hoc changes:
- **Add Inventory**: For opening stock or fast purchases.
- **Return to Supplier**:
    - Select "Return to Supplier" movement type.
    - Validates you have enough stock to return.
    - Decreases inventory count.
    - Captures reference/RMA number.

### 4. All Movements Audit
A master view of all inventory changes:
- **Path**: `/dashboard/stock-management/movements`
- **Features**:
    - Filter by Movement Type (e.g., show only Returns).
    - **Search by Reference**: Click any reference number to see all related movements (e.g., all lines from one Purchase Order).

---

## 🚀 How-To Guides

### How to Return Items to a Supplier
1. Go to **Stock Management > Stocks**.
2. Find the item and click **Viewer/Edit**.
3. Click **Add Movement**.
4. Select Type: `Return to Supplier`.
5. Enter Quantity (must be <= available) and Reference Number.
6. Click Save.

### How to View Transaction History
1. Go to **Stock Management > Movements**.
2. You will see a list of recent transactions.
3. To grouped items by a specific event (like PO #123), click on the Reference Number badge in the list.

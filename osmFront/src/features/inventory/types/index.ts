// أنواع المخزون

export interface Stock {
    id: number;
    branch: number;
    branch_name: string;
    branch_code: string;
    branch_type: 'store' | 'branch';
    variant: number;
    variant_sku: string;
    variant_name: string;
    product_name: string;
    quantity_in_stock: number;
    reserved_quantity: number;
    available_quantity: number;
    reorder_level: number;
    max_stock_level: number;
    min_stock_level: number;
    average_cost: string;
    stock_status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Overstocked';
    last_restocked: string | null;
    last_sale: string | null;
    allow_backorder: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface StockMovement {
    id: number;
    stock: number;
    stock_info: {
        branch_name: string;
        variant_name: string;
        product_name: string;
    };
    movement_type: MovementType;
    movement_type_display: string;
    quantity: number;
    quantity_before: number;
    quantity_after: number;
    cost_per_unit: string;
    reference_number: string;
    notes: string;
    movement_date: string;
    created_by_name: string;
    created_at: string;
}

export type MovementType =
    | 'purchase'
    | 'sale'
    | 'transfer_in'
    | 'transfer_out'
    | 'adjustment'
    | 'damage'
    | 'return'
    | 'reserve'
    | 'release';

export interface StockTransfer {
    id: number;
    transfer_number: string;
    from_branch: number;
    from_branch_name: string;
    from_branch_code: string;
    to_branch: number;
    to_branch_name: string;
    to_branch_code: string;
    status: TransferStatus;
    status_display: string;
    requested_by: string;
    approved_by: string;
    requested_date: string;
    approved_date: string | null;
    shipped_date: string | null;
    received_date: string | null;
    notes: string;
    items: StockTransferItem[];
    items_count: number;
    created_at: string;
    updated_at: string;
}

export type TransferStatus =
    | 'pending'
    | 'submitted'
    | 'shipped'
    | 'received'
    | 'completed'
    | 'cancelled';

export interface StockTransferItem {
    id: number;
    transfer: number;
    variant: number;
    variant_sku: string;
    variant_name: string;
    product_name: string;
    quantity_requested: number;
    quantity_sent: number;
    quantity_received: number;
    unit_cost: string;
    notes: string;
}

// Payloads
export interface CreateStockMovementPayload {
    stock: number;
    movement_type: MovementType;
    quantity: number;
    cost_per_unit?: number;
    reference_number?: string;
    notes?: string;
}

export interface CreateStockTransferPayload {
    from_branch: number;
    to_branch: number;
    notes?: string;
    items: {
        variant: number;
        quantity_requested: number;
        unit_cost?: number;
    }[];
}

// Store Types
export interface InventoryFormState {
    // Selected Branch (Store only)
    branchId: number | null;
    branchName: string;

    // Selected Variant
    variantId: number | null;
    variantName: string;
    variantSku: string;

    // Movement Details
    movementType: MovementType;
    quantity: number;
    costPerUnit: number;
    referenceNumber: string;
    notes: string;

    // Actions
    setBranch: (id: number | null, name: string) => void;
    setVariant: (id: number | null, name: string, sku: string) => void;
    setMovementType: (type: MovementType) => void;
    setQuantity: (qty: number) => void;
    setCostPerUnit: (cost: number) => void;
    setReferenceNumber: (ref: string) => void;
    setNotes: (notes: string) => void;
    reset: () => void;
}

export interface TransferFormState {
    // Branches
    fromBranchId: number | null;
    fromBranchName: string;
    toBranchId: number | null;
    toBranchName: string;

    // Items
    items: TransferItem[];

    // Notes
    notes: string;

    // Actions
    setFromBranch: (id: number | null, name: string) => void;
    setToBranch: (id: number | null, name: string) => void;
    addItem: (item: TransferItem) => void;
    updateItem: (index: number, item: Partial<TransferItem>) => void;
    removeItem: (index: number) => void;
    setItems: (items: TransferItem[]) => void;
    setNotes: (notes: string) => void;
    reset: () => void;
}

export interface TransferItem {
    variantId: number;
    variantName: string;
    variantSku: string;
    productName: string;
    quantityRequested: number;
    unitCost: number;
    availableQuantity: number;
}

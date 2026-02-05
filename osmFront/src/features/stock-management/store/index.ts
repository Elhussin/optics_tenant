"use client";

import { create } from "zustand";
import { MovementType, TransferItem } from "../types";

// ===== Inventory Movement Store =====
interface InventoryFormState {
    // Selected Branch (Store only)
    branchId: number | null;
    branchName: string;

    // Selected Variant
    variantId: number | null;
    variantName: string;
    variantSku: string;

    // Stock ID (if editing existing stock)
    stockId: number | null;
    currentQuantity: number;

    // Movement Details
    movementType: MovementType;
    quantity: number;
    costPerUnit: number;
    referenceNumber: string;
    notes: string;

    // Actions
    setBranch: (id: number | null, name: string) => void;
    setVariant: (id: number | null, name: string, sku: string) => void;
    setStock: (stockId: number | null, currentQty: number) => void;
    setMovementType: (type: MovementType) => void;
    setQuantity: (qty: number) => void;
    setCostPerUnit: (cost: number) => void;
    setReferenceNumber: (ref: string) => void;
    setNotes: (notes: string) => void;
    reset: () => void;
}

const inventoryInitialState = {
    branchId: null,
    branchName: "",
    variantId: null,
    variantName: "",
    variantSku: "",
    stockId: null,
    currentQuantity: 0,
    movementType: "purchase" as MovementType,
    quantity: 0,
    costPerUnit: 0,
    referenceNumber: "",
    notes: "",
    items: [],
};

export const useInventoryFormStore = create<InventoryFormState>((set) => ({
    ...inventoryInitialState,

    setBranch: (id, name) => set({ branchId: id, branchName: name }),
    setVariant: (id, name, sku) => set({ variantId: id, variantName: name, variantSku: sku }),
    setStock: (stockId, currentQty) => set({ stockId, currentQuantity: currentQty }),
    setMovementType: (type) => set({ movementType: type }),
    setQuantity: (qty) => set({ quantity: qty }),
    setCostPerUnit: (cost) => set({ costPerUnit: cost }),
    setReferenceNumber: (ref) => set({ referenceNumber: ref }),
    setNotes: (notes) => set({ notes }),

    addItem: () => {
        const state = get();
        // Validation before adding? maintained in UI usually, but good to have safeguard
        if (!state.branchId || !state.variantId) return;

        const newItem: InventoryItem = {
            branchId: state.branchId,
            branchName: state.branchName,
            variantId: state.variantId,
            variantName: state.variantName,
            variantSku: state.variantSku,
            stockId: state.stockId,
            currentQuantity: state.currentQuantity,
            movementType: state.movementType,
            quantity: state.quantity,
            costPerUnit: state.costPerUnit,
            referenceNumber: state.referenceNumber,
            notes: state.notes,
        };

        set({
            items: [...state.items, newItem],
            // Reset item-specific fields for next entry
            variantId: null,
            variantName: "",
            variantSku: "",
            stockId: null,
            currentQuantity: 0,
            quantity: 0,
            costPerUnit: 0,
            referenceNumber: "",
            notes: "",
            // Keep branch and movement type same for convenience? 
            // Often users add many items to same branch. 
            // Movement type might vary but usually batch is for "Purchase" or "Count".
            // Let's keep branch and movement type.
        });
    },

    removeItem: (index) => {
        const items = [...get().items];
        items.splice(index, 1);
        set({ items });
    },

    reset: () => set(inventoryInitialState),
}));


// ===== Transfer Store =====
interface TransferFormState {
    // Branches
    fromBranchId: number | null;
    fromBranchName: string;
    toBranchId: number | null;
    toBranchName: string;

    // Items
    items: TransferItem[];

    // Notes
    notes: string;

    // Total
    totalItems: number;
    totalQuantity: number;
    totalValue: number;

    // Actions
    setFromBranch: (id: number | null, name: string) => void;
    setToBranch: (id: number | null, name: string) => void;
    addItem: (item: TransferItem) => void;
    updateItem: (index: number, item: Partial<TransferItem>) => void;
    removeItem: (index: number) => void;
    setItems: (items: TransferItem[]) => void;
    setNotes: (notes: string) => void;
    calculateTotals: () => void;
    reset: () => void;
}

const transferInitialState = {
    fromBranchId: null,
    fromBranchName: "",
    toBranchId: null,
    toBranchName: "",
    items: [] as TransferItem[],
    notes: "",
    totalItems: 0,
    totalQuantity: 0,
    totalValue: 0,
};

export const useTransferFormStore = create<TransferFormState>((set, get) => ({
    ...transferInitialState,

    setFromBranch: (id, name) => set({ fromBranchId: id, fromBranchName: name }),
    setToBranch: (id, name) => set({ toBranchId: id, toBranchName: name }),

    addItem: (item) => {
        const items = [...get().items, item];
        set({ items });
        get().calculateTotals();
    },

    updateItem: (index, updates) => {
        const items = [...get().items];
        items[index] = { ...items[index], ...updates };
        set({ items });
        get().calculateTotals();
    },

    removeItem: (index) => {
        const items = get().items.filter((_, i) => i !== index);
        set({ items });
        get().calculateTotals();
    },

    setItems: (items) => {
        set({ items });
        get().calculateTotals();
    },

    setNotes: (notes) => set({ notes }),

    calculateTotals: () => {
        const { items } = get();
        const totalItems = items.length;
        const totalQuantity = items.reduce((sum, item) => sum + item.quantityRequested, 0);
        const totalValue = items.reduce((sum, item) => sum + (item.quantityRequested * item.unitCost), 0);
        set({ totalItems, totalQuantity, totalValue });
    },

    reset: () => set(transferInitialState),
}));

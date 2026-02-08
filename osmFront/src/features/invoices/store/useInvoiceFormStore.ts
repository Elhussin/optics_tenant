"use client";

import { create } from "zustand";
import { InvoiceItem, InvoiceStatus } from "../types";

interface InvoiceFormState {
    // Invoice ID (for edit mode)
    invoiceId: number | null;
    invoiceNumber: string;

    // Status
    status: InvoiceStatus;

    // Customer
    customerId: number | null;
    customerName: string;

    // Branch/User
    branchId: number | null;
    createdById: number | null;

    // Items
    items: InvoiceItem[];

    // Pricing
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;

    // Meta
    notes: string;
    dueDate: string | null;
    invoiceDate: string | null;

    // Actions
    setCustomer: (id: number | null, name: string) => void;
    setStatus: (status: InvoiceStatus) => void;
    setBranch: (id: number | null) => void;

    // Item actions
    addItem: (item: InvoiceItem) => void;
    updateItem: (index: number, item: Partial<InvoiceItem>) => void;
    removeItem: (index: number) => void;
    setItems: (items: InvoiceItem[]) => void;

    // Meta actions
    setNotes: (notes: string) => void;
    setDueDate: (date: string | null) => void;
    setInvoiceDate: (date: string | null) => void;

    // Calculation
    calculateTotals: () => void;

    // Load/Reset
    loadInvoice: (invoice: any) => void;
    reset: () => void;
}

const initialState = {
    invoiceId: null,
    invoiceNumber: "",
    status: "draft" as InvoiceStatus,
    customerId: null,
    customerName: "",
    branchId: null,
    createdById: null,
    items: [],
    subtotal: 0,
    taxAmount: 0,
    totalAmount: 0,
    paidAmount: 0,
    remainingAmount: 0,
    notes: "",
    dueDate: null,
    invoiceDate: null,
};

export const useInvoiceFormStore = create<InvoiceFormState>((set, get) => ({
    ...initialState,

    setCustomer: (id, name) => set({ customerId: id, customerName: name }),
    setStatus: (status) => set({ status }),
    setBranch: (id) => set({ branchId: id }),

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
    setDueDate: (date) => set({ dueDate: date }),
    setInvoiceDate: (date) => set({ invoiceDate: date }),

    calculateTotals: () => {
        const { items, paidAmount } = get();

        // Calculate subtotal
        const subtotal = items.reduce((sum, item) => {
            return sum + (item.total_price || (item.quantity * item.unit_price));
        }, 0);

        // Calculate tax (assuming items include tax or tax is calculated separately)
        // Check if items have tax_amount. If not, assume 0 for now or calculate global tax
        // For simplicity, summing item tax_amount if available
        const taxAmount = items.reduce((sum, item) => sum + (item.tax_amount || 0), 0);

        const totalAmount = subtotal + taxAmount;
        const remainingAmount = totalAmount - paidAmount;

        set({ subtotal, taxAmount, totalAmount, remainingAmount });
    },

    loadInvoice: (invoice) => {
        const items: InvoiceItem[] = (invoice.items || []).map((item: any) => ({
            id: item.id,
            product_variant: item.product_variant?.id || item.product_variant,
            product_variant_name: item.product_variant_name || "",
            product_name: item.product_name || "",
            quantity: item.quantity || 1,
            unit_price: parseFloat(item.unit_price) || 0,
            tax_amount: parseFloat(item.tax_amount) || 0,
            total_price: parseFloat(item.total_price) || 0,
        }));

        set({
            invoiceId: invoice.id,
            invoiceNumber: invoice.invoice_number,
            status: invoice.status,
            customerId: invoice.customer?.id || invoice.customer,
            customerName: invoice.customer_name || "",
            branchId: invoice.branch,
            createdById: invoice.created_by,
            items,
            subtotal: parseFloat(invoice.subtotal) || 0,
            taxAmount: parseFloat(invoice.tax_amount) || 0,
            totalAmount: parseFloat(invoice.total_amount) || 0,
            paidAmount: parseFloat(invoice.paid_amount) || 0,
            remainingAmount: parseFloat(invoice.remaining_amount) || 0,
            notes: invoice.notes || "",
            dueDate: invoice.due_date || null,
            invoiceDate: invoice.invoice_date || null,
        });
    },

    reset: () => set(initialState),
}));

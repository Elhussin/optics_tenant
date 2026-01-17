"use client";

import { create } from "zustand";
import { OrderItem, OrderType, PaymentType, OrderStatus, PaymentStatus } from "../types";

interface OrderFormState {
    // Order ID (for edit mode)
    orderId: number | null;
    orderNumber: string;

    // Status
    status: OrderStatus;
    paymentStatus: PaymentStatus;

    // Customer
    customerId: number | null;
    customerName: string;

    // User/Branch
    salesPersonId: number | null;
    branchId: number | null;

    // Prescription
    prescriptionId: number | null;

    // Order details
    orderType: OrderType;
    paymentType: PaymentType;

    // Items
    items: OrderItem[];

    // Pricing
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    discountPercent: number;
    discountAmount: number;
    totalAmount: number;
    paidAmount: number;

    // Notes
    notes: string;
    internalNotes: string;
    expectedDelivery: string | null;

    // Actions
    setCustomer: (id: number | null, name: string) => void;
    setSalesPerson: (id: number | null) => void;
    setBranch: (id: number | null) => void;
    setPrescription: (id: number | null) => void;
    setOrderType: (type: OrderType) => void;
    setPaymentType: (type: PaymentType) => void;
    setStatus: (status: OrderStatus) => void;

    // Item actions
    addItem: (item: OrderItem) => void;
    updateItem: (index: number, item: Partial<OrderItem>) => void;
    removeItem: (index: number) => void;
    setItems: (items: OrderItem[]) => void;

    // Pricing actions
    setDiscountPercent: (percent: number) => void;
    setDiscountAmount: (amount: number) => void;
    setPaidAmount: (amount: number) => void;
    setTaxRate: (rate: number) => void;

    // Notes
    setNotes: (notes: string) => void;
    setInternalNotes: (notes: string) => void;
    setExpectedDelivery: (date: string | null) => void;

    // Calculate
    calculateTotals: () => void;

    // Load existing order
    loadOrder: (order: any) => void;

    // Reset
    reset: () => void;
}

const initialState = {
    orderId: null,
    orderNumber: "",
    status: "pending" as const,
    paymentStatus: "pending" as const,
    customerId: null,
    customerName: "",
    salesPersonId: null,
    branchId: null,
    prescriptionId: null,
    orderType: "cash" as const,
    paymentType: "cash" as const,
    items: [],
    subtotal: 0,
    taxRate: 0.15,
    taxAmount: 0,
    discountPercent: 0,
    discountAmount: 0,
    totalAmount: 0,
    paidAmount: 0,
    notes: "",
    internalNotes: "",
    expectedDelivery: null,
};

export const useOrderFormStore = create<OrderFormState>((set, get) => ({
    ...initialState,

    setCustomer: (id, name) => set({ customerId: id, customerName: name }),
    setSalesPerson: (id) => set({ salesPersonId: id }),
    setBranch: (id) => set({ branchId: id }),
    setPrescription: (id) => set({ prescriptionId: id }),
    setOrderType: (type) => set({ orderType: type }),
    setPaymentType: (type) => set({ paymentType: type }),
    setStatus: (status) => set({ status }),

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

    setDiscountPercent: (percent) => {
        const subtotal = get().subtotal;
        const discountAmount = (subtotal * percent) / 100;
        set({ discountPercent: percent, discountAmount });
        get().calculateTotals();
    },

    setDiscountAmount: (amount) => {
        const subtotal = get().subtotal;
        const discountPercent = subtotal > 0 ? (amount / subtotal) * 100 : 0;
        set({ discountAmount: amount, discountPercent });
        get().calculateTotals();
    },

    setPaidAmount: (amount) => set({ paidAmount: amount }),
    setTaxRate: (rate) => {
        set({ taxRate: rate });
        get().calculateTotals();
    },

    setNotes: (notes) => set({ notes }),
    setInternalNotes: (notes) => set({ internalNotes: notes }),
    setExpectedDelivery: (date) => set({ expectedDelivery: date }),

    calculateTotals: () => {
        const { items, discountAmount, taxRate } = get();

        // Calculate subtotal
        const subtotal = items.reduce((sum, item) => {
            const itemTotal = item.quantity * item.unit_price;
            return sum + itemTotal;
        }, 0);

        // Calculate tax
        const taxableAmount = subtotal - discountAmount;
        const taxAmount = taxableAmount * taxRate;

        // Calculate total
        const totalAmount = taxableAmount + taxAmount;

        set({ subtotal, taxAmount, totalAmount });
    },

    loadOrder: (order) => {
        // تحميل بيانات طلب موجود
        const customer = order.customer;
        const customerName = typeof customer === 'object'
            ? (customer.full_name || customer.first_name || '')
            : '';

        // تحويل العناصر
        const items: OrderItem[] = (order.items || []).map((item: any) => ({
            product_variant: item.product_variant?.id || item.product_variant,
            product_name: item.product_variant?.product?.name || item.product_name || `Product ${item.product_variant}`,
            quantity: item.quantity || 1,
            unit_price: parseFloat(item.unit_price) || 0,
            prescription: item.prescription,
        }));

        set({
            orderId: order.id,
            orderNumber: order.order_number || "",
            status: order.status || "pending",
            paymentStatus: order.payment_status || "pending",
            customerId: typeof customer === 'object' ? customer.id : customer,
            customerName,
            branchId: order.branch?.id || order.branch,
            salesPersonId: order.sales_person?.id || order.sales_person,
            prescriptionId: order.prescription?.id || order.prescription,
            orderType: order.order_type || "cash",
            paymentType: order.payment_type || "cash",
            items,
            subtotal: parseFloat(order.subtotal) || 0,
            taxRate: parseFloat(order.tax_rate) || 0.15,
            taxAmount: parseFloat(order.tax_amount) || 0,
            discountAmount: parseFloat(order.discount_amount) || 0,
            discountPercent: 0, // سيتم حسابه
            totalAmount: parseFloat(order.total_amount) || 0,
            paidAmount: parseFloat(order.paid_amount) || 0,
            notes: order.notes || "",
            internalNotes: order.internal_notes || "",
            expectedDelivery: order.expected_delivery || null,
        });

        // حساب نسبة الخصم
        const subtotal = parseFloat(order.subtotal) || 0;
        const discountAmount = parseFloat(order.discount_amount) || 0;
        if (subtotal > 0) {
            set({ discountPercent: (discountAmount / subtotal) * 100 });
        }
    },

    reset: () => set(initialState),
}));


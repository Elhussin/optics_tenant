"use client";

import { create } from "zustand";
import { OrderItem, OrderType, OrderStatus, PaymentStatus } from "../types";

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
    invoiceTypeId: number | null;
    customerPartnerLinkId: number | null;
    partnerId: number | null;
    paymentMethodId: number | null;

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
    insuranceCoverage: number;

    // Split
    customerShare: number;
    partnerShare: number;
    patientSharePercentage: number;
    maxPatientShare: number;
    remainingLimit: number; // Add remaining limit

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
    setInvoiceType: (id: number | null) => void;
    setCustomerPartnerLink: (id: number | null, partnerId?: number | null) => void;
    setPartner: (id: number | null) => void;
    setInsuranceDetails: (details: { patientSharePercentage?: number; maxPatientShare?: number; remainingLimit?: number }) => void;
    setPaymentMethodId: (id: number | null) => void;
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
    setInsuranceCoverage: (amount: number) => void;
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
    invoiceTypeId: null,
    customerPartnerLinkId: null,
    partnerId: null,
    paymentMethodId: null,
    items: [],
    subtotal: 0,
    taxRate: 0.15,
    taxAmount: 0,
    discountPercent: 0,
    discountAmount: 0,
    totalAmount: 0,
    paidAmount: 0,
    insuranceCoverage: 0,
    customerShare: 0,
    partnerShare: 0,
    patientSharePercentage: 0,
    maxPatientShare: 0,
    remainingLimit: 0,
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
    setInvoiceType: (id) => set({ invoiceTypeId: id }),
    setCustomerPartnerLink: (id, partnerId) => set({ customerPartnerLinkId: id, ...(partnerId !== undefined && { partnerId }) }),
    setPartner: (id) => set({ partnerId: id, customerPartnerLinkId: null }),
    setInsuranceDetails: (details) => {
        set((state) => ({ ...state, ...details }));
        get().calculateTotals();
    },
    setPaymentMethodId: (id) => set({ paymentMethodId: id }),
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
    setInsuranceCoverage: (amount) => set({ insuranceCoverage: amount }),
    setTaxRate: (rate) => {
        set({ taxRate: rate });
        get().calculateTotals();
    },

    setNotes: (notes) => set({ notes }),
    setInternalNotes: (notes) => set({ internalNotes: notes }),
    setExpectedDelivery: (date) => set({ expectedDelivery: date }),

    calculateTotals: () => {
        const { items, discountAmount, taxRate, maxPatientShare, patientSharePercentage, remainingLimit, orderType } = get();

        // Calculate subtotal
        const subtotal = items.reduce((sum, item) => {
            const itemTotal = item.quantity * item.unit_price;
            return sum + itemTotal;
        }, 0);

        // Calculate tax
        const taxableAmount = Math.max(0, subtotal - discountAmount);
        const taxAmount = taxableAmount * taxRate;

        // Calculate total
        const totalAmount = taxableAmount + taxAmount;

        // Calculate Shares
        let customerShare = totalAmount;
        let partnerShare = 0;

        if (orderType === 'insurance' || orderType === 'corporate') {
            // Step 1: Determine Base Insurance Coverage (before copay)
            // This is limited by the remaining limit if set
            let baseInsuranceCoverage = totalAmount;
            if (remainingLimit > 0) {
                baseInsuranceCoverage = Math.min(totalAmount, remainingLimit);
            }

            // Step 2: Calculate Customer Share based on Base Coverage
            // Logic: Share % is applied to what insurance WOULD cover
            if (patientSharePercentage > 0) {
                let copayAmount = (baseInsuranceCoverage * patientSharePercentage) / 100;

                // Apply max cap to the copay amount
                if (maxPatientShare > 0) {
                    copayAmount = Math.min(copayAmount, maxPatientShare);
                }

                // Customer pays the copay
                customerShare = copayAmount;
            } else {
                customerShare = 0;
            }

            // Step 3: Calculate Partner Share
            // Partner pays Base Coverage minus Customer's Copay
            partnerShare = Math.max(0, baseInsuranceCoverage - customerShare);

            // Step 4: Add Excess to Customer Share
            // If Total > Base Coverage, customer pays the difference
            if (totalAmount > baseInsuranceCoverage) {
                customerShare += (totalAmount - baseInsuranceCoverage);
            }

            // Auto-update payment fields for insurance
            set({
                subtotal,
                taxAmount,
                totalAmount,
                customerShare,
                partnerShare,
                insuranceCoverage: partnerShare,
                paidAmount: customerShare
            });
        } else {
            set({ subtotal, taxAmount, totalAmount, customerShare: totalAmount, partnerShare: 0 });
        }
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
            invoiceTypeId: order.invoice_type?.id || order.invoice_type,
            customerPartnerLinkId: order.customer_partner_link?.id || order.customer_partner_link,
            partnerId: order.partner?.id || order.partner || null,
            paymentMethodId:
                (typeof order.payment_method === "object"
                    ? order.payment_method?.id
                    : order.payment_method) ?? null,
            items,
            subtotal: parseFloat(order.subtotal) || 0,
            taxRate: parseFloat(order.tax_rate) || 0.15,
            taxAmount: parseFloat(order.tax_amount) || 0,
            discountAmount: parseFloat(order.discount_amount) || 0,
            discountPercent: 0, // سيتم حسابه
            totalAmount: parseFloat(order.total_amount) || 0,
            paidAmount: parseFloat(order.paid_amount) || 0,
            customerShare: parseFloat(order.customer_share) || 0,
            partnerShare: parseFloat(order.partner_share) || 0,
            insuranceCoverage: parseFloat(order.partner_share) || 0, // Map partner share to insurance coverage
            patientSharePercentage: parseFloat(order.customer_partner_link?.patient_share_percentage) || 0,
            maxPatientShare: parseFloat(order.customer_partner_link?.max_patient_share) || 0,
            notes: order.notes || "",
            internalNotes: order.internal_notes || "",
            expectedDelivery: order.expected_delivery || null,
        });

        // Ensure totals are consistent
        const subtotal = parseFloat(order.subtotal) || 0;
        const discountAmount = parseFloat(order.discount_amount) || 0;
        if (subtotal > 0) {
            set({ discountPercent: (discountAmount / subtotal) * 100 });
        }
    },

    reset: () => set(initialState),
}));


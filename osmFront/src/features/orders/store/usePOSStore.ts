import { create } from "zustand";

export interface POSCartItem {
  id: string; // unique cart item id
  productId: string;
  name: string;
  price: number;
  quantity: number;
  discount: number;
  tax: number;
  type: string; // "frame", "lens", "contact_lens", "accessory"
  // For lenses:
  prescriptionId?: string;
}

export interface POSState {
  // UI State
  isFullScreen: boolean;
  toggleFullScreen: () => void;
  
  // Cart State
  cart: POSCartItem[];
  addToCart: (item: Omit<POSCartItem, "id">) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  updateDiscount: (id: string, discount: number) => void;
  clearCart: () => void;

  // Customer & Partner
  customerId: string | null;
  setCustomerId: (id: string | null) => void;
  partnerId: string | null;
  setPartnerId: (id: string | null) => void;
  
  // Insurance
  insuranceClaim: {
    policyNumber: string;
    approvalCode: string;
    copayAmount: number;
    copayType: "percentage" | "fixed";
  } | null;
  setInsuranceClaim: (claim: POSState["insuranceClaim"]) => void;

  // Payment
  paymentMethod: "cash" | "card" | "tabby" | "tamara" | null;
  setPaymentMethod: (method: POSState["paymentMethod"]) => void;
  isDirectPaymentEnabled: boolean;
  setDirectPaymentEnabled: (enabled: boolean) => void;

  // Totals Calculation
  getSubtotal: () => number;
  getTaxTotal: () => number;
  getDiscountTotal: () => number;
  getInsuranceCover: () => number;
  getGrandTotal: () => number;
}

export const usePOSStore = create<POSState>((set, get) => ({
  isFullScreen: false,
  toggleFullScreen: () => set((state) => ({ isFullScreen: !state.isFullScreen })),

  cart: [],
  addToCart: (item) => set((state) => {
    // Check if product already exists without specific prescription
    const existingIndex = state.cart.findIndex(i => i.productId === item.productId && !i.prescriptionId);
    if (existingIndex >= 0) {
      const newCart = [...state.cart];
      newCart[existingIndex].quantity += item.quantity;
      return { cart: newCart };
    }
    const id = Math.random().toString(36).substr(2, 9);
    return { cart: [...state.cart, { ...item, id }] };
  }),
  removeFromCart: (id) => set((state) => ({ cart: state.cart.filter(i => i.id !== id) })),
  updateQuantity: (id, qty) => set((state) => ({
    cart: state.cart.map(i => i.id === id ? { ...i, quantity: Math.max(1, qty) } : i)
  })),
  updateDiscount: (id, discount) => set((state) => ({
    cart: state.cart.map(i => i.id === id ? { ...i, discount: Math.max(0, discount) } : i)
  })),
  clearCart: () => set({ cart: [] }),

  customerId: null,
  setCustomerId: (id) => set({ customerId: id }),
  partnerId: null,
  setPartnerId: (id) => set({ partnerId: id }),

  insuranceClaim: null,
  setInsuranceClaim: (claim) => set({ insuranceClaim: claim }),

  paymentMethod: null,
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  isDirectPaymentEnabled: false,
  setDirectPaymentEnabled: (enabled) => set({ isDirectPaymentEnabled: enabled }),

  getSubtotal: () => get().cart.reduce((total, item) => total + (item.price * item.quantity), 0),
  getDiscountTotal: () => get().cart.reduce((total, item) => total + (item.discount * item.quantity), 0),
  getTaxTotal: () => get().cart.reduce((total, item) => {
    const afterDiscount = Math.max(0, item.price - item.discount);
    return total + (afterDiscount * item.quantity * item.tax);
  }, 0),
  getInsuranceCover: () => {
    const { insuranceClaim, getSubtotal, getDiscountTotal, getTaxTotal } = get();
    if (!insuranceClaim) return 0;
    const total = getSubtotal() - getDiscountTotal() + getTaxTotal();
    if (insuranceClaim.copayType === "fixed") {
      return Math.max(0, total - insuranceClaim.copayAmount);
    } else {
      // e.g., 20% copay means customer pays 20%, insurance covers 80%
      const customerPays = total * (insuranceClaim.copayAmount / 100);
      return Math.max(0, total - customerPays);
    }
  },
  getGrandTotal: () => {
    const total = get().getSubtotal() - get().getDiscountTotal() + get().getTaxTotal() - get().getInsuranceCover();
    return Math.max(0, total);
  }
}));

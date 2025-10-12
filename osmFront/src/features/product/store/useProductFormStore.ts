import { create } from "zustand";

interface ProductFormState {
  variantCount: number;
  variants: Record<string, any>[];
  openVariantIndex: number | null;
  isSubmitting: boolean;
  isShowModal: boolean;
  entityName: string;
  currentFieldName: string;
  
  isVariant: boolean;
  setVariantCount: (count: number) => void;
  setVariantField: (index: number, field: string, value: any) => void;
  toggleVariant: (index: number) => void;
  setIsSubmitting: (value: boolean) => void;
  setShowModal: (value: boolean) => void;
  setEntityName: (name: string) => void;
  setCurrentFieldName: (name: string) => void;
  
}

export const useProductFormStore = create<ProductFormState>((set) => ({
  variantCount: 1,
  variants: [{}],
  openVariantIndex: null,
  isSubmitting: false,
  isShowModal: false,
  entityName: "",
  currentFieldName: "",
  isVariant: false,

  setVariantCount: (count: number) =>
    set((state) => {
      const updated = [...state.variants];
      if (count > state.variants.length) {
        updated.push(...Array.from({ length: count - state.variants.length }, () => ({})));
      } else if (count < state.variants.length) {
        updated.length = count;
      }
      return { variantCount: count, variants: updated };
    }),

  setVariantField: (index: number, field: string, value: any) =>
    set((state) => {
      const updated = [...state.variants];
      updated[index] = { ...updated[index], [field]: value };
      return { variants: updated };
    }),

  toggleVariant: (index: number) =>
    set((state) => ({
      openVariantIndex: state.openVariantIndex === index ? null : index,
    })),

  setIsSubmitting: (value: boolean) => set({ isSubmitting: value }),
  setShowModal: (value: boolean) => set({ isShowModal: value }),
  setEntityName: (name: string) => set({ entityName: name }),
  setCurrentFieldName: (name: string) => set({ currentFieldName: name }),
  setIsVariant: (value: boolean) => set({ isVariant: value }),
}));

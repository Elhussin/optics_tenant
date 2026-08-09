# [Implementation Plan] Frontend Product Dashboard Enhancements

This document outlines the technical implementation plan for updating the frontend products dashboard (`osmFront/src/features/products` & `osmFront/src/app/[locale]/dashboard/products`) to align with backend changes and ERP usability standards.

## Proposed Changes

---

### 1. Configuration & Type Definitions
#### [MODIFY] [config.ts](file:///c:/code/optics_tenant/osmFront/src/features/products/constants/config.ts)
#### [MODIFY] [index.ts](file:///c:/code/optics_tenant/osmFront/src/features/products/types/index.ts)

- **New Fields in `ProductConfig` & `BasicVariantConfig`**:
  - `min_selling_price`: Minimum allowable selling price floor.
  - `barcode`: Numeric POS barcode field (with auto-generation note).
  - `tax_category`: Select field (`standard` 15%, `zero_rated` 0%, `exempt`).
  - `tax_rate`: Decimal percentage field.
- **Type Interfaces**:
  - Update `ProductVariant` type definitions to support `min_selling_price`, `barcode`, `tax_category`, and `tax_rate`.

---

### 2. Lens Matrix Generator Modal Component
#### [NEW] [LensMatrixModal.tsx](file:///c:/code/optics_tenant/osmFront/src/features/products/components/variant/LensMatrixModal.tsx)
#### [MODIFY] [ProductVariantStep.tsx](file:///c:/code/optics_tenant/osmFront/src/features/products/components/addProduct/components/ProductVariantStep.tsx)

- **UI Component (`LensMatrixModal.tsx`)**:
  - Render a modal dialog allowing users to enter SPH range (`start`, `end`, `step`), CYL range (`start`, `end`, `step`), selling price, minimum price, and shared attributes (diameter, material, color).
  - Perform POST call to `/api/products/lens-matrix/generate/`.
- **Visibility Control**:
  - Render the "Lens Matrix Generator" action button in `ProductVariantStep.tsx` ONLY when `variantType` is `stockLenses` or `contactLenses`.
  - **Restriction**: Completely hide Matrix Generator for `basic` variant products.

---

### 3. Basic Product Restrictions & Duplicate Prevention Validation
#### [MODIFY] [ProductTypeStep.tsx](file:///c:/code/optics_tenant/osmFront/src/features/products/components/addProduct/components/ProductTypeStep.tsx)
#### [MODIFY] [handleSave.ts](file:///c:/code/optics_tenant/osmFront/src/features/products/utils/handleSave.ts)

- **Basic Product Rule**:
  - When `variant_type === 'basic'`, lock `variant_count` to `1` and hide multi-variant count controls.
- **Form Validation & Duplicate Check**:
  - Check in `handleSave.ts` that `selling_price >= min_selling_price`.
  - Check for duplicate variants in the form before submitting payload and present a toast notification with the duplicate variant indexes.

---

### 4. Category & Dependent Option Filtering Improvements
#### [MODIFY] [filterData.ts](file:///c:/code/optics_tenant/osmFront/src/features/products/utils/filterData.ts)
#### [MODIFY] [selectRelatedData.ts](file:///c:/code/optics_tenant/osmFront/src/features/products/utils/selectRelatedData.ts)

- **Attribute Value Filtering**:
  - Ensure `attribute-values` filter correctly by attribute name (`Product Type`, `Color`, `Diameter`, `Base Curve`, `Material`, etc.).
- **Category Dependent Filtering**:
  - Dynamically filter categories based on the selected `main_group` (`FR` Frames, `SL` Spectacle Lenses, `CL` Contact Lenses, `AX` Accessories).

---

## Verification Plan

### Automated Verification
1. Run `bun dev` to verify the frontend compiles without TypeScript errors.

### Manual Verification
1. Open the Product Creation wizard in browser dashboard `/dashboard/products/create`.
2. Select a `basic` product type and verify that `variant_count` is locked to 1 and Matrix Generator is hidden.
3. Select a `stockLenses` product type and click "Lens Matrix Generator" button, verify the SPH/CYL grid modal works smoothly.
4. Try adding a variant with `selling_price` lower than `min_selling_price` and verify error notification.
5. Select different `main_group` choices (Frames vs Contact Lenses) and verify categories and attribute dropdowns filter dynamically.

import { onSubmit } from "./onSubmit";
import { buildPayload } from "@/src/features/products/utils/buildPayload";
import { safeToast } from "@/src/shared/utils/safeToast";

export const handleSave = (
  form: any,
  variants: any,
  config: any,
  t: any, // Add t function
  id?: string
) => {
  // Debug: Log what variants data we're receiving
  // console.log("🔍 handleSave called with:");
  // console.log("  - variants (raw):", variants);
  // console.log("  - config:", config);
  // console.log("  - form values:", form.getValues());

  form.handleSubmit(
    (formValues: any) => {
      // Debug: Log form values after handleSubmit
      // console.log("📋 formValues after handleSubmit:", formValues);
      // console.log("📋 formValues.variants:", formValues.variants);

      // IMPORTANT: Use formValues.variants instead of the stale 'variants' parameter
      // The 'variants' parameter passed to handleSave might be stale (captured at callback creation time)
      let variantsData = formValues.variants || [];

      // Debug: Log the payload that will be sent
      // console.log("🚀 variantsData to process (before filter):", variantsData);

      // Filter out completely empty variants (variants with no meaningful data)
      variantsData = variantsData.filter((variant: any) => {
        // Check if variant has any non-empty field (excluding defaults like discount_percentage: 0)
        const hasData = Object.entries(variant).some(([key, value]) => {
          if (key === 'attributes' || key === 'discount_percentage') return false;
          return value !== "" && value !== undefined && value !== null;
        });
        return hasData;
      });

      // console.log("🚀 variantsData to process (after filter):", variantsData);

      // If no variants have data, show error
      if (variantsData.length === 0) {
        safeToast(t("validation.noVariants"), { type: "error" });
        console.error("No variants with data found");
        return;
      }

      // Frontend validation for required variant fields
      // Production Update: Use form.setError instead of just console logging
      const requiredVariantFields = ['selling_price'];
      let hasValidationErrors = false;
      let firstErrorDetail = "";

      for (let i = 0; i < variantsData.length; i++) {
        const variant = variantsData[i];
        for (const field of requiredVariantFields) {
          if (!variant[field] || variant[field] === "") {
            // Set error on the specific field so it shows red border/message in UI
            form.setError(`variants.${i}.${field}`, {
              type: "manual",
              message: t("validation.required")
            });

            // Capture first error for the toast hint
            if (!hasValidationErrors) {
              const fieldName = field === 'selling_price' ? t("fields.sellingPrice") : field;
              firstErrorDetail = t("validation.invalidVariant", { index: i + 1, field: fieldName });
            }

            hasValidationErrors = true;
          }
        }
      }

      if (hasValidationErrors) {
        // Show a single helpful toast with a hint
        safeToast(firstErrorDetail || t("validation.invalidVariantsData"), { type: "error" });
        return;
      }

      // Build Variant Payload (Cleaning fields based on config)
      const variantsPayload = buildPayload({
        config: config,
        formData: variantsData,
        options: {
          multiple: true,
          // CRITICAL: Include 'attributes' (nested) and 'id' explicitly so they aren't stripped
          include: ["attributes", "id"],
          prefix: "variants",
        },
      });

      // Debug: Log the payload after buildPayload
      // console.log("🚀 variantsPayload after buildPayload:", variantsPayload);


      // Clean Main Payload
      // Ensure categories_ids is list of IDs
      let categoriesIds = formValues.categories_ids;
      if (
        Array.isArray(categoriesIds) &&
        categoriesIds.length > 0 &&
        typeof categoriesIds[0] === "object"
      ) {
        categoriesIds = categoriesIds.map((c: any) => c.id || c.value);
      }

      const finalPayload = {
        ...formValues,
        categories_ids: categoriesIds,
        // IMPORTANT: Backend expects 'variants_input' (not 'variants') for write operations
        // See: ProductSerializer.variants_input in product.py
        variants_input: variantsPayload,
      };

      // Remove the 'categories' and 'variants' fields to avoid conflicts
      delete finalPayload.categories;
      delete finalPayload.variants;  // Remove original 'variants' field

      // Debug: Log final payload
      // console.log("✅ Final Payload to be sent:", JSON.stringify(finalPayload, null, 2));

      onSubmit(finalPayload, form, t, id);
    },
    (errors: any) => {
      console.error("Form Validation Errors:", errors);
      safeToast("Please fill all required fields correctly.", {
        type: "error",
      });
      const firstError = Object.values(errors)[0] as any;
      if (firstError?.message) safeToast(firstError.message, { type: "error" });
    }
  )();
};

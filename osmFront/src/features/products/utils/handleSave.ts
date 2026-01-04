import { onSubmit } from "./onsbmit";
import { buildPayload } from "@/src/features/products/utils/buildPayload";
import { safeToast } from "@/src/shared/utils/safeToast";

export const handleSave = (
  form: any,
  variants: any,
  config: any,
  id?: string
) => {
  form.handleSubmit(
    (formValues: any) => {
      // Build Variant Payload (Cleaning fields based on config)
      const variantsPayload = buildPayload({
        config: config,
        formData: variants,
        options: {
          multiple: true,
          // CRITICAL: Include 'attributes' (nested) and 'id' explicitly so they aren't stripped
          include: ["attributes", "id"],
          prefix: "variants",
        },
      });

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
        variants: variantsPayload,
      };

      // Remove the 'categories' field if it exists (duplication of categories_ids usually from GET)
      delete finalPayload.categories;

      onSubmit(finalPayload, form, id);
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

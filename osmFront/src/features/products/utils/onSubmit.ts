import { safeToast } from "@/src/shared/utils/safeToast";

export const onSubmit = async (data: any, form: any, t: any, id?: string) => {
    // console.log("data", data); // Removed for production
    try {
        let result;
        if (id) {
            const response = await form.mutation.mutateAsync(data);
            result = { success: true, data: response };
            // console.log("result", result);
        } else {
            result = await form.submitForm(data);
            // console.log("result full:", JSON.stringify(result, null, 2));
        }

        if (result?.success) {
            safeToast(t("validation.saved"), { type: "success" });
            if (result.data) {
                form.reset(result.data);
            }
        } else {
            console.error("Submission failed:", result);
            const errorDetails = result?.error?.details || {};
            const genericMessage = typeof result?.error === 'string'
                ? result.error
                : (result?.error?.message || t("validation.error"));

            // 1. Show generic toast first
            safeToast(genericMessage, { type: "error" });

            // 2. Map specific field errors to the form
            if (Object.keys(errorDetails).length > 0) {
                const formValues = form.getValues();

                const IGNORED_KEYS = new Set([
                    "status_code",
                    "timestamp",
                    "detail",
                    "non_field_errors",
                    "error",
                    "message",
                    "code",
                    "success",
                ]);

                const KNOWN_VARIANT_FIELDS = new Set([
                    "selling_price",
                    "cost_price",
                    "min_selling_price",
                    "spherical",
                    "cylinder",
                    "axis",
                    "frame_color",
                    "lens_diameter",
                    "lens_material",
                    "lens_color",
                    "lens_base_curve",
                    "stock",
                    "barcode",
                    "attributes",
                    "sku",
                    "product_type",
                ]);

                Object.entries(errorDetails).forEach(([key, messages]: [string, any]) => {
                    if (IGNORED_KEYS.has(key)) return;

                    const message = Array.isArray(messages) ? messages[0] : String(messages);

                    // A. Attempt to set error on top-level field
                    form.setError(key, { type: 'manual', message });

                    // B. Only attach to variants if key is actually a variant field
                    if (KNOWN_VARIANT_FIELDS.has(key) && formValues?.variants && Array.isArray(formValues.variants)) {
                        formValues.variants.forEach((_: any, index: number) => {
                            form.setError(`variants.${index}.${key}`, { type: 'manual', message });
                        });
                    }
                });
            }
        }
    } catch (err: any) {
        console.error("Critical error in onSubmit:", err);
        const message = err?.response?.data?.detail || err?.message || t("validation.error");
        safeToast(message, { type: "error" });
    }
};

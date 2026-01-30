import { safeToast } from "@/src/shared/utils/safeToast";

export const onSubmit = async (data: any, form: any, t: any, id?: string) => {
    // console.log("data", data); // Removed for production
    try {
        let result;
        if (id) {
            result = await form.mutation.mutateAsync(data);
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

                Object.entries(errorDetails).forEach(([key, messages]: [string, any]) => {
                    const message = Array.isArray(messages) ? messages[0] : String(messages);

                    // A. Attempt to set error on top-level field
                    form.setError(key, { type: 'manual', message });

                    // B. Heuristic: If the key seems like a variant field (validation failure from backend often comes flat for manual creation),
                    // try to attach it to variants if they exist.
                    if (formValues?.variants && Array.isArray(formValues.variants)) {
                        formValues.variants.forEach((_: any, index: number) => {
                            // We optimistically set the error on this field for all variants
                            // This ensures that whichever variant caused the issue displays the error.
                            // If the field doesn't exist on a variant, React Hook Form usually ignores/handles it gracefully.
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

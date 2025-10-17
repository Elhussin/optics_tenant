
import { safeToast } from "@/src/shared/utils/toastService";


    // Build and submit: get form values from useForm + variants from store
       export const handleSave = (id?: number,handleSubmit: any, variants: any,onSubmit: any,reset: any,ProductVariantConfig: any,buildPayload: any,updateProductVariant: any,submitForm: any) => {

        // use handleSubmit to validate and get values from react-hook-form
        handleSubmit((formValues: any) => {
            // build variants payload from zustand variants array
            const variantsPayload = buildPayload({
                config: ProductVariantConfig,
                formData: variants,
                options: { multiple: true, include: ["product_id"], prefix: "variants" },
            });
            const finalPayload = {
                ...formValues,
                variants: variantsPayload,
            };
            onSubmit(finalPayload ,id,updateProductVariant,submitForm,reset);
        })();
    };


export const onSubmit = async (data: any, id?: number, updateProductVariant?: any, submitForm?: any,  reset?: any) => {
    try {
        let result;
        if (id) {
            result = await updateProductVariant.mutation.mutateAsync(data);
        } else {
            result = await submitForm(data); // send final payload to API helper
        }

        if (result?.success) {
            safeToast("Saved successfully", { type: "success" });
            reset(result.data);
        }
    } catch (err: any) {
        safeToast(err?.message || "Server error", { type: "error" });
    }
};

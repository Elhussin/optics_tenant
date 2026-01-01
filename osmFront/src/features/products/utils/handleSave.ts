import {onSubmit} from "./onsbmit";
import { buildPayload } from "@/src/features/products/utils/buildPayload";
import { safeToast } from "@/src/shared/utils/safeToast";

export const handleSave = (form: any, variants: any,config:any,id?:string) => {
    console.log("handleSave called with variants:", variants);
    
    form.handleSubmit((formValues: any) => {
        console.log("Validation Passed. Building Payload...");
        const variantsPayload = buildPayload({
            config: config,
            formData: variants,
            options: { multiple: true, include: [], prefix: "variants" },
        });


        const finalPayload = {
            ...formValues,
            variants: variantsPayload,
        };
        console.log("finalPayload ready:", finalPayload);
        onSubmit(finalPayload,form,id);
    }, (errors: any) => {
        console.error("Form Validation Errors:", errors);
        safeToast("Please fill all required fields correctly.", { type: "error" });
        // Optional: Show specific field error
        const firstError = Object.values(errors)[0] as any;
        if(firstError?.message) safeToast(firstError.message, { type: "error" });
    })();
};
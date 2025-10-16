import {onSubmit} from "./onsbmit";
import { buildPayload } from "@/src/features/products/utils/buildPayload";

export const handleSave = (form: any, variants: any,config:any,id?:string) => {
    form.handleSubmit((formValues: any) => {
        const variantsPayload = buildPayload({
            config: config,
            formData: variants,
            options: { multiple: true, include: ["product_id"], prefix: "variants" },
        });


        const finalPayload = {
            ...formValues,
            variants: variantsPayload,
        };
        onSubmit(finalPayload,form,id);
    })();
};
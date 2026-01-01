import { safeToast } from "@/src/shared/utils/safeToast";

export const onSubmit = async (data: any, form: any, id?: string) => {
    console.log("data", data);
    try {
        let result;
        if (id) {
            result = await form.mutation.mutateAsync(data);
            console.log("result", result);
        } else {
            result = await form.submitForm(data); // send final payload to API helper
            console.log("result full:", JSON.stringify(result, null, 2));
        }

        if (result?.success) {
            safeToast("Saved successfully", { type: "success" });
            form.reset(result.data);
        }
        console.log("result", result);
    } catch (err: any) {
        console.log("err", err);
        safeToast(err?.message || "Server error", { type: "error" });
    }
};

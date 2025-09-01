// // app/reset-password/page.tsx
// "use client";
// import { useSearchParams, useRouter } from "next/navigation";
// import { useState } from "react";
// import { useFormRequest } from "@/lib/hooks/useFormRequest";
// import { safeToast } from "@/lib/utils/toastService";
// export default function ResetPasswordPage() {
//   const searchParams = useSearchParams();
//   const uid = searchParams.get("uid");
//   const token = searchParams.get("token");

//   const [password, setPassword] = useState("");
//   const [success, setSuccess] = useState(false);

//   const formRequest = useFormRequest({
//     alias: "users_password_reset_confirm_create",
//     onSuccess: () => {
//       safeToast("Password reset successfully!", { type: "success" });
//       setSuccess(true);
//     },
//     onError: (err) => {
  
//       console.log(err);

//     },
//   });
//   const handleReset = () => {
//     formRequest.submitForm({ uid, token, password });
//   };

//   return (
//     <div>
//       {success ? (
//         <p>Password reset successfully! You can now login.</p>
//       ) : (
//         <>
//           <input
//             type="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             placeholder="New Password"
//           />
//           <button onClick={handleReset}>Reset Password</button>
//           <b>{formRequest?.errors?.root as string}</b>
//         </>
//       )}
//     </div>
//   );
// }
"use client";
import { useSearchParams } from "next/navigation";
import { useFormRequest } from "@/lib/hooks/useFormRequest";
import { safeToast } from "@/lib/utils/toastService";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid") || "";
  const token = searchParams.get("token") || "";

  const formRequest = useFormRequest({
    alias: "users_password_reset_confirm_create",
    defaultValues: { uid, token, password: "" },
    onSuccess: () => {
      safeToast("Password reset successfully!", { type: "success" });
    },
    // onError: (err) => {
    //   // console.error("Reset password error:");
    //     return null; 
    // },
  });

  const handleReset = async (values: any) => {
    await formRequest.submitForm(values);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      {formRequest.formState.isSubmitSuccessful ? (
        <div className="bg-white shadow-lg rounded-2xl p-6 text-center max-w-md w-full">
          <h2 className="text-xl font-semibold text-green-600 mb-2">
            Password reset successfully 🎉
          </h2>
          <p className="text-gray-600">You can now login with your new password.</p>
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Reset Your Password
          </h2>
          <form
            onSubmit={formRequest.handleSubmit(handleReset)}
            className="space-y-5"
          >
            <input type="hidden" {...formRequest.register("uid")} />

            <input type="hidden" {...formRequest.register("token")} />
  
            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                placeholder="Enter new password"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                {...formRequest.register("password", {
                  required: "Password is required",
                })}
              />
              {formRequest.formState.errors.password && (
                <p className="text-sm text-red-500 mt-1">
                  {formRequest.formState.errors.password.message as string}
                </p>
              )}
                                 {formRequest.formState.errors.uid && (
                <p className="text-sm text-red-500 mt-1">
                  {formRequest.formState.errors.uid.message as string}
                </p>
              )}
              {formRequest.formState.errors.token && (
                <p className="text-sm text-red-500 mt-1">
                  {formRequest.formState.errors.token.message as string}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={formRequest.isSubmitting}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {formRequest.isSubmitting ? "Resetting..." : "Reset Password"}
            </button>

            {/* Root Error */}
            {formRequest.formErrors.root && (
              <p className="text-center text-sm text-red-600 mt-3">
                {formRequest.formErrors.root}
              </p>
            )}
          </form>
        </div>
      )}
    </div>

  );
}

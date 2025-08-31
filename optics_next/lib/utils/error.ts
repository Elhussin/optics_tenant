

// import { safeToast } from "@/lib/utils/toastService";
// export function handleErrorStatus(error: any): string {
//   if (!error || typeof error !== "object") return "Unknown error";

//   // شبكة غير متوفرة أو خطأ غير متوقع
//   if (!error.response) {
//     return "Network error. Please check your internet connection.";
//   }

//   const status = error.status;
//   const detail = error.response.data?.detail || error.message;


//   const statusMessages: Record<number, string> = {
//     400: "Validation error occurred",
//     401: "Unauthorized access",
//     403: "Forbidden access",
//     404: "Resource not found",
//     408: "Request timeout, please try again",
//     422: "Unprocessable entity",
//     429: "Too many requests, please try again later",
//     500: "Internal server error",
//     503: "Service unavailable",
//   };

//   // إذا وُجدت رسالة تفصيلية من الـ API، استخدمها
//   // if (detail && typeof detail === "string") {
//   //   return detail;
//   // }

//   // أو استخدم الرسالة المعرفة حسب الكود
//   if (status in statusMessages) {
//     return statusMessages[status];
//   }

//   return "An unexpected error occurred.";
// }

// export function handleServerErrors(error: any, setError: (name: string, error: any) => void) {
//   const serverErrors = error?.response?.data;

//   if (serverErrors && typeof serverErrors === "object") {
//     for (const [field, messages] of Object.entries(serverErrors)) {
//       if (Array.isArray(messages)) {
//         setError(field as string, {
//           type: "server",
//           message: messages.join(" "),
//         });
//       }
//     }


//     const nonFieldError =
//       (Array.isArray(serverErrors?.non_field_errors) && serverErrors.non_field_errors.join(" ")) ||
//       serverErrors?.detail;

//     if (nonFieldError) {
//       setError("root", {
//         type: "server",
//         message: nonFieldError,
//       });
//       safeToast(nonFieldError, {type: "error",});
//     }

//   } else {
//     const fallbackError = handleErrorStatus(error);
//     setError("root", {
//       type: "server",
//       message: fallbackError,
//     });
//     safeToast(fallbackError, {type: "error",});
//   }
// }

import { safeToast } from "@/lib/utils/toastService";
// import { handleErrorStatus } from "./handleErrorStatus";


export interface NormalizedError {
  message: string;
  code?: number | string;
  details?: any;
}

export function handleErrorStatus(error: any): NormalizedError {
  if (!error || typeof error !== "object") {
    return { message: "Unknown error occurred" };
  }

  // خطأ شبكة
  if (!error.response) {
    return {
      message: "Network error. Please check your internet connection.",
      code: "NETWORK_ERROR",
    };
  }

  const status = error.status || error.response.status;
  const detail = error.response.data?.detail || error.message;

  const statusMessages: Record<number, string> = {
    400: "Validation error occurred",
    401: "Unauthorized access",
    403: "Forbidden access",
    404: "Resource not found",
    408: "Request timeout, please try again",
    422: "Unprocessable entity",
    429: "Too many requests, please try again later",
    500: "Internal server error",
    503: "Service unavailable",
  };

  return {
    message: detail || statusMessages[status] || "An unexpected error occurred.",
    code: status,
    details: error.response.data,
  };
}



export function handleServerErrors(
  error: any,
  setError: (name: string, error: any) => void,
  options: { showToast?: boolean } = { showToast: true }
) {
  const serverErrors = error?.response?.data;

  if (serverErrors && typeof serverErrors === "object") {
    // أخطاء مرتبطة بالحقول
    for (const [field, messages] of Object.entries(serverErrors)) {
      if (Array.isArray(messages)) {
        setError(field as string, {
          type: "server",
          message: messages.join(" "),
        });
      }
    }

    // أخطاء عامة (مش مرتبطة بحقل معين)
    const nonFieldError =
      (Array.isArray(serverErrors?.non_field_errors) &&
        serverErrors.non_field_errors.join(" ")) ||
      serverErrors?.detail;

    if (nonFieldError) {
      setError("root", {
        type: "server",
        message: nonFieldError,
      });

      if (options.showToast) {
        safeToast(nonFieldError, { type: "error" });
      }
    }
  } else {
    // fallback error
    const normalized = handleErrorStatus(error);

    setError("root", {
      type: "server",
      message: normalized.message,
    });

    if (options.showToast) {
      safeToast(normalized.message, { type: "error" });
    }
  }
}

// utils/formatError.ts
// export interface FormattedError {
//   message: string;
//   code?: string | number;
//   details?: any;
// }

// export function formatError(error: any): FormattedError {
//   // ✅ لو الخطأ من سيرفر (Axios / fetch)
//   if (error?.response) {
//     const status = error.response.status;
//     const data = error.response.data;

//     return {
//       message: data?.message || "Server error occurred",
//       code: status,
//       details: data?.errors || data,
//     };
//   }

//   // ✅ لو الخطأ من Validation (Zod)
//   if (error?.errors && Array.isArray(error.errors)) {
//     return {
//       message: "Validation failed",
//       details: error.errors.map((e: any) => e.message),
//     };
//   }

//   // ✅ لو الخطأ Error عادي (JS)
//   if (error instanceof Error) {
//     return {
//       message: error.message,
//       code: "JS_ERROR",
//     };
//   }

//   // ✅ لو نص فقط
//   if (typeof error === "string") {
//     return {
//       message: error,
//     };
//   }

//   // ✅ fallback
//   return {
//     message: "Unknown error occurred",
//     details: error,
//   };
// }

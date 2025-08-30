

import { safeToast } from "@/lib/utils/toastService";
export function handleErrorStatus(error: any): string {
  if (!error || typeof error !== "object") return "Unknown error";

  // شبكة غير متوفرة أو خطأ غير متوقع
  if (!error.response) {
    return "Network error. Please check your internet connection.";
  }

  const status = error.status;
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

  // إذا وُجدت رسالة تفصيلية من الـ API، استخدمها
  // if (detail && typeof detail === "string") {
  //   return detail;
  // }

  // أو استخدم الرسالة المعرفة حسب الكود
  if (status in statusMessages) {
    return statusMessages[status];
  }

  return "An unexpected error occurred.";
}

export function handleServerErrors(error: any, setError: (name: string, error: any) => void) {
  const serverErrors = error?.response?.data;

  if (serverErrors && typeof serverErrors === "object") {
    for (const [field, messages] of Object.entries(serverErrors)) {
      if (Array.isArray(messages)) {
        setError(field as string, {
          type: "server",
          message: messages.join(" "),
        });
      }
    }


    const nonFieldError =
      (Array.isArray(serverErrors?.non_field_errors) && serverErrors.non_field_errors.join(" ")) ||
      serverErrors?.detail;

    if (nonFieldError) {
      setError("root", {
        type: "server",
        message: nonFieldError,
      });
      safeToast(nonFieldError, {type: "error",});
    }

  } else {
    const fallbackError = handleErrorStatus(error);
    setError("root", {
      type: "server",
      message: fallbackError,
    });
    safeToast(fallbackError, {type: "error",});
  }
}
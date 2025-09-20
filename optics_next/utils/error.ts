import { safeToast } from "@/utils/toastService";

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
  let message = '';
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
    message = normalized.message + " " + normalized.code + " " + normalized.details;
    
    if (normalized.code === "NETWORK_ERROR") {
      message = "Network error. Please check your internet connection.";
    }

    setError("root", {
      type: "server",
      message: message,
    });

    if (options.showToast) {
      safeToast(normalized.message, { type: "error" });
    }
  }
}

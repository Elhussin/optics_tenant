export  function handleError(error: any) {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('Error response:', error.response.data);
    console.error('Error status:', error.response.status);
    console.error('Error headers:', error.response.headers);
  } else if (error.request) {
    // The request was made but no response was received
    console.error('Error request:', error.request);
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('Error message:', error.message);
  }
  console.error('Error config:', error.config);
}

export function handleApiError(error: any) {
  if (error.response) {
    // Server responded with a status code outside the range of 2xx
    console.error('API Error:', error.response.data);
    console.error('Status Code:', error.response.status);
  } else if (error.request) {
    // Request was made but no response received
    console.error('API Request Error:', error.request);
  } else {
    // Something else happened in setting up the request
    console.error('API Error Message:', error.message);
  }
}


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

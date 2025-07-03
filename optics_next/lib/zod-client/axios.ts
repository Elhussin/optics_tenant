// lib/axios.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useRouter } from "next/navigation";
const CSRF_COOKIE_NAME = "optics_tenant_csrftoken";
const CSRF_HEADER_NAME = "X-OPTICS-TENANT-CSRFToken";

// Fallback base URL
let baseUrl = "http://localhost:8001";


if (typeof window !== "undefined") {
  const hostname = window.location.hostname;
  const subdomain = hostname.split(".")[0];
  const domain = process.env.NEXT_PUBLIC_API_BASE || "localhost:8001";
  if (!hostname.includes("localhost") || hostname !== "localhost") {
    baseUrl = `http://${subdomain}.${domain}`;
  } else {
    baseUrl = `http://${domain}`;
  }
  // إذا كنا نعمل على localhost أو store1.localhost
  if (hostname === "localhost" || hostname.endsWith(".localhost")) {
    baseUrl = "http://store1.localhost:8001"; // ← تأكد أن هذا صحيح
  } else {
    baseUrl = `http://${subdomain}.${domain}`;
  }
}




function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

const axiosInstance = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const csrfToken = getCookie(CSRF_COOKIE_NAME);
  if (csrfToken && config.headers) {
    config.headers[CSRF_HEADER_NAME] = csrfToken;
  }

  // Optional: pass tenant header
  const tenant = window.location.hostname.split(".")[0];
  config.headers["X-Tenant"] = tenant;

  return config;
});

// Flag لتفادي تكرار المحاولة
let isRefreshing = false;

axiosInstance.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // لا نحاول عمل refresh في الحالات التالية:
    if (
      error.response?.status !== 401 || // فقط إذا الخطأ 401
      originalRequest._retry ||         // تم المحاولة من قبل
      originalRequest.url?.includes("/users/token/refresh/") // لا نحاول إن كان هو نفسه refresh endpoint
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      // محاولة واحدة فقط لعمل refresh
      if (!isRefreshing) {
        isRefreshing = true;
        await axiosInstance.post("/api/users/token/refresh/"); // سيتم إرسال refreshToken الموجود في HttpOnly Cookie
        isRefreshing = false;
   
        return axiosInstance(originalRequest);
      }
    } catch (refreshError) {
      isRefreshing = false;

      return Promise.reject(refreshError);
    }

    return Promise.reject(error);
  }
);


export { axiosInstance ,baseUrl};


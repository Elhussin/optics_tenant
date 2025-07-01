// lib/axios.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

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
}
if (typeof window !== "undefined") {
  const hostname = window.location.hostname;
  const subdomain = hostname.split(".")[0];
  const domain = process.env.NEXT_PUBLIC_API_BASE || "localhost:8001";

  // إذا كنا نعمل على localhost أو store1.localhost
  if (hostname === "localhost" || hostname.endsWith(".localhost")) {
    baseUrl = "http://store1.localhost:8001"; // ← تأكد أن هذا صحيح
  } else {
    baseUrl = `http://${subdomain}.${domain}`;
  }
}


const isAuthEndpoint = (url: string) =>
  url.includes('/login') || 
  url.includes('/refresh') || 
  url.includes('/register') ||
  url.includes('/logout');

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

// axiosInstance.interceptors.response.use(
//   (response) => response,
//   async (error: AxiosError) => {

//     const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

//     if (
//       error.response?.status !== 401 ||
//       isAuthEndpoint(originalRequest?.url || "") ||
//       originalRequest._retry
//     ) {
//       return Promise.reject(error);
//     }

//     originalRequest._retry = true;

//     try {
//       console.log("🔄 Attempting to refresh token via httpOnly cookie...");
//       await axiosInstance.post("/users/token/refresh/");
//       console.log("✅ Token refreshed successfully via httpOnly cookie");
//       return axiosInstance(originalRequest);
//     } catch (refreshError) {
//       console.error("Token refresh failed:", refreshError);

//       if (typeof window !== "undefined") {
//         localStorage.removeItem("user");
//         localStorage.removeItem("userPreferences");
//         window.location.href = "/auth/login";
//       }

//       return Promise.reject(refreshError);
//     }
//   }
// );

export { axiosInstance ,baseUrl};

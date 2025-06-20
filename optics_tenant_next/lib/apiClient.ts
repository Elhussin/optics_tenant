// import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
// import { jwtDecode } from "jwt-decode";
// import { toast } from "react-toastify";

// interface DecodedToken {
//   exp: number;
//   [key: string]: any;
// }

// // Session Utilities
// const manageTokens = {
//   clear: () => {
//     localStorage.removeItem("access_token");
//     localStorage.removeItem("refresh_token");
//     localStorage.removeItem("exp_token");
//   },
//   redirectToLogin: () => {
//     toast.warn("Session expired. Redirecting to login...");
//   },
// };

// // Axios instance
// export const API = axios.create({
//   baseURL: "/api/", // proxy path, adjust based on your setup
// });

// // Add tenant header from subdomain
// API.interceptors.request.use((config) => {
//   const token = localStorage.getItem("access_token");
//   const hostname = window.location.hostname;
//   const tenant = hostname.split(".")[0]; // assuming tenant1.domain.com

//   if (token) {
//     config.headers = {
//       ...config.headers,
//       Authorization: `Bearer ${token}`,
//       "X-Tenant": tenant, // custom header for backend to detect tenant
//     };
//   }

//   return config;
// });

// // Auto-refresh token interceptor
// API.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
//       try {
//         const newToken = await RefreshToken();
//         return API(originalRequest);
//       } catch (err) {
//         manageTokens.clear();
//         manageTokens.redirectToLogin();
//         return Promise.reject(err);
//       }
//     }
//     return Promise.reject(error);
//   }
// );

// const TOKEN_EXPIRY_BUFFER = 5 * 60;

// const isTokenExpired = (): boolean => {
//   const exp = localStorage.getItem("exp_token");
//   if (!exp || isNaN(Number(exp))) return true;
//   const currentTime = Math.floor(Date.now() / 1000);
//   return currentTime > Number(exp) - TOKEN_EXPIRY_BUFFER;
// };

// const isRefreshTokenValid = (): boolean => {
//   const refresh = localStorage.getItem("refresh_token");
//   if (!refresh) return false;
//   try {
//     const decoded = jwtDecode<DecodedToken>(refresh);
//     return Math.floor(Date.now() / 1000) < decoded.exp;
//   } catch {
//     return false;
//   }
// };

// let refreshPromise: Promise<string> | null = null;

// export const RefreshToken = async (): Promise<string> => {
//   if (refreshPromise) return refreshPromise;

//   refreshPromise = (async () => {
//     const refresh = localStorage.getItem("refresh_token");
//     if (!refresh || !isRefreshTokenValid()) {
//       throw new Error("Invalid or expired refresh token");
//     }

//     const response = await API.post("/users/auth/token/refresh/", { refresh });
//     const newToken = response.data.access;
//     const decoded = jwtDecode<DecodedToken>(newToken);

//     localStorage.setItem("access_token", newToken);
//     localStorage.setItem("exp_token", decoded.exp.toString());

//     return newToken;
//   })();

//   return refreshPromise;
// };

// export const ensureTokenValidity = async () => {
//   if (isTokenExpired()) {
//     await RefreshToken();
//   }
// };

// export const SecureRequest = async <T = any>(
//   method: "get" | "post" | "put" | "delete",
//   url: string,
//   data?: any
// ): Promise<T> => {
//   try {
//     await ensureTokenValidity();

//     const response: AxiosResponse<T> =
//       method === "get"
//         ? await API.get(url, { params: data })
//         : await API[method](url, data);

//     return response.data;
//   } catch (error: any) {
//     if (error.response?.status === 401) {
//       manageTokens.clear();
//       manageTokens.redirectToLogin();
//     } else if (error.request) {
//       toast.warn("Network error. Please check your connection.");
//     } else {
//       console.error("Unexpected error:", error.message);
//     }
//     throw error;
//   }
// };
import axios from 'axios';

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

API.interceptors.response.use(
  res => res,
  async err => {
    if (err.response?.status === 401 && !err.config._retry) {
      err.config._retry = true;
      await API.post('/users/token/refresh/');
      return API(err.config);
    }
    throw err;
  }
);

export default API;

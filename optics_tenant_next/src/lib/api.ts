import axios from "axios";
import { createApiClient } from "@/src/api-zod/zodSchemas";
import { endpoints } from "@/src/api-zod/zodSchemas";

let baseUrl = "http://localhost:8001"; // fallback

if (typeof window !== "undefined") {
  const hostname = window.location.hostname; // مثل: store1.localhost
  const subdomain = hostname.split(".")[0];  // "store1"
  const domain = process.env.NEXT_PUBLIC_API_BASE || "localhost:8001"; // "localhost:8001"

  // إذا كنت تعمل على subdomain محلي مثل store1.localhost:3000
  if (!hostname.includes("localhost")) {
    baseUrl = `http://${subdomain}.${domain}`;  // مثال: http://store1.yourdomain.com
  } else if (hostname !== "localhost") {
    // مثال: store1.localhost ⇒ نستخدم subdomain
    baseUrl = `http://${subdomain}.${domain}`;
  } else {
    // localhost فقط (بدون subdomain)
    baseUrl = `http://${domain}`;
  }
}
const axiosInstance = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
});

console.log("Axios Instance Created with Base URL: %s", axiosInstance);
console.log("API Base URL:", baseUrl);

export const API = createApiClient(baseUrl, {
  axiosInstance,
});

console.log("API Client Created:", API);
// API.interceptors.response.use(
//     res => res,
//     async err => {
//       if (err.response.status === 401) {
//         await API.post("/api/users/token/refresh/");
//         return API(err.config);
//       }
//       return Promise.reject(err);
//     }
//   );
  
  
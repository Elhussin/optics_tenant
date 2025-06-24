import { createApiClient } from "@/src/api-zod/zodSchemas";
import axios from "axios";

let baseUrl = `http://${process.env.NEXT_PUBLIC_API_BASE}` || "http://localhost:8000";

if (typeof window !== "undefined") {
    const subdomain = window.location.hostname.split(".")[0];
    baseUrl = `http://${subdomain}.${process.env.NEXT_PUBLIC_API_BASE}`;
}

export const API = createApiClient(baseUrl);


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
  
  
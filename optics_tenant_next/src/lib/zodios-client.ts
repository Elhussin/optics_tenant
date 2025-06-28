// src/lib/zodios-client.ts
import { createApiClient } from "@/src/lib/zod-api";

import { Zodios, type ZodiosOptions } from "@zodios/core";
import { endpoints } from "@/src/lib/zod-api";
import { axiosInstance ,baseUrl} from "./axios";

// Export a ready-to-use singleton Zodios client
export const api = new Zodios(baseUrl, endpoints, {
  axiosInstance,
});



// إنشاء الـ API client
export const API_CLIENT = createApiClient(baseUrl, {
  axiosInstance,
});

export default api;



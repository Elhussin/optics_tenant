// src/lib/zodios-client.ts
import { createApiClient } from ".";

import { Zodios } from "@zodios/core";
import { endpoints } from "./index";
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



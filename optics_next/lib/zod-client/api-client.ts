// lib/api-client.ts
import { Zodios } from "@zodios/core";
import { axiosInstance, baseUrl } from "./axios";
import { endpoints } from "./index"; // تأكد أن هذا يستورد Zodios endpoint schema
import 
const api = new Zodios(baseUrl, endpoints, { axiosInstance });

// Utility wrapper
export const ApiClient = {
  get: async <T = any>(alias: string, params?: any): Promise<T> => {
    try {
      return await api.get(alias, { params });
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  post: async <T = any>(alias: string, body?: any, params?: any): Promise<T> => {
    try {
      return await api.post(alias, body, { params });
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  put: async <T = any>(alias: string, body?: any, params?: any): Promise<T> => {
    try {
      return await api.put(alias, body, { params });
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  delete: async <T = any>(alias: string, params?: any): Promise<T> => {
    try {
      return await api.delete(alias, { params });
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
};

function handleApiError(error: unknown) {
  if (axiosInstance.isAxiosError(error)) {
    console.error("API Error:", error.response?.data || error.message);
  } else {
    console.error("Unknown Error:", error);
  }
}

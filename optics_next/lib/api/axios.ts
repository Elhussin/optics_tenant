// lib/axios.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
const CSRF_COOKIE_NAME = "optics_tenant_csrftoken";
const CSRF_HEADER_NAME = "X-OPTICS-TENANT-CSRFToken";
const LANGUAGE_COOKIE_NAME = "django_language";
import { endpoints } from "./zodClient";
import { getBaseUrl } from "@/lib/utils/getBaseUrl";
import { Zodios, type ZodiosInstance } from "@zodios/core";

// Define a custom interface that includes our new method
interface CustomZodiosInstance extends ZodiosInstance<typeof endpoints> {
  customRequest: (alias: string, data?: any) => Promise<any>;
}

const baseUrl = getBaseUrl();

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

  const tenant = window.location.hostname.split(".")[0];
  config.headers["X-Tenant"] = tenant;

  const language = getCookie(LANGUAGE_COOKIE_NAME);
  if (language && config.headers) {
    config.headers["Accept-Language"] = language || "en";
  }

  return config;
});

let refreshTokenPromise: Promise<any> | null = null;

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (refreshTokenPromise) {
        await refreshTokenPromise;
      } else {
        refreshTokenPromise = axiosInstance.post("/api/users/token/refresh/");
        await refreshTokenPromise;
        refreshTokenPromise = null;
      }

      return axiosInstance(originalRequest);

    } catch (refreshError) {
      refreshTokenPromise = null;
      window.location.href = '/auth/login';
      return Promise.reject(refreshError);
    }
  }
);


export const api: CustomZodiosInstance = new Zodios(baseUrl, endpoints, {
  axiosInstance,
}) as CustomZodiosInstance;

function replacePathParams(url: string, params: Record<string, any>): string {
  let processedUrl = url;
  Object.entries(params).forEach(([key, value]) => {
    processedUrl = processedUrl.replace(`:${key}`, encodeURIComponent(value));
  });
  return processedUrl;
}


api.customRequest = async function (alias: string, data: any = {}) {
  const endpoint : any = endpoints.find(e => e.alias === alias);
  if (!endpoint) {
    throw new Error(`Endpoint with alias "${alias}" not found.`);
  }

  const method = endpoint.method.toUpperCase();
  let url : string = endpoint.path;
  
  const pathParams: Record<string, any> = {};
  const otherParams: Record<string, any> = {};
  
  const pathParamPattern : RegExp = /:([a-zA-Z_][a-zA-Z0-9_]*)/g;
  const pathParamNames : any[] = [];
  let match : any;
  
  while ((match = pathParamPattern.exec(url)) !== null) {
    pathParamNames.push(match[1]);
  }
  
  if (data && typeof data === 'object') {
    Object.entries(data).forEach(([key, value]) => {
      if (pathParamNames.includes(key)) {
        pathParams[key] = value;
      } else {
        otherParams[key] = value;
      }
    });
  }
  

  url = replacePathParams(url, pathParams);
  
  const config: any = {
    method: method,
    url: url,
  };
  
  if (method === 'GET' || method === 'DELETE') {
    if (Object.keys(otherParams).length > 0) {
      config.params = otherParams;
    }
  } else {
    config.data = otherParams;
  }
  
  try {
    const response = await axiosInstance(config);
      return response.data;

  } catch (error) {

    throw error;
  }
};

declare module "@zodios/core" {
  interface ZodiosInstanceN {
    customRequest: (alias: string, data?: any) => Promise<any>;
  }
}


export default api;


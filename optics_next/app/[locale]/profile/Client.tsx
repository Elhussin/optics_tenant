"use client";

import { axiosInstance } from "@/lib/api/axios";
import { apiConfig } from "@/lib/api/apiConfig";
import { getBaseUrl } from "@/lib/utils/getBaseUrl";

export const getClientData = async (clientId: number) => {
  try {
    // تجاهل subdomain لو تحب
    apiConfig.ignoreSubdomain = true;

    const baseUrl = getBaseUrl(undefined, apiConfig.ignoreSubdomain);
    const res = await axiosInstance.get(`${baseUrl}/api/tenants/clients/${clientId}/`);
    return res.data;
  } catch (error) {
    console.error("Error fetching client data:", error);
    return null;
  }
};

"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
} from "react";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { formsConfig } from "@/src/shared/constants/formsConfig";

// Define the shape of the Tenant Settings object based on your backend model
export interface TenantSettings {
  id?: string;
  business_name: string;
  phone: string;
  whatsapp?: string;
  email: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  website?: string;
  description?: string;
  is_active?: boolean;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  tiktok?: string;

  // Add other fields as needed
}

interface TenantContextType {
  tenantSettings: TenantSettings | null;
  loading: boolean;
  refetchTenantSettings: () => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenantSettings, setTenantSettings] = useState<TenantSettings | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  const fetchSettings = useApiForm({
    alias: formsConfig["tenant-settings"].listAlias!, // users_tenant_settings_list
    enabled: true,
  });

  useEffect(() => {
    if (fetchSettings.query.isSuccess && fetchSettings.query.data) {
      // Assuming the list returns an array, and we want the first active one or just the first one.
      // Adjust based on your actual API response structure (pagination, results array, etc.)
      const data = fetchSettings.query.data as any; // Type assertion if needed
      const results = Array.isArray(data) ? data : data.results || [];
      console.log("results", results);

      if (results.length > 0) {
        setTenantSettings(results[0]);
      } else {
        setTenantSettings(null);
      }
      setLoading(false);
    } else if (fetchSettings.query.isError) {
      console.error(
        "Failed to fetch tenant settings",
        fetchSettings.query.error,
      );
      setTenantSettings(null);
      setLoading(false);
    } else if (fetchSettings.query.isLoading) {
      setLoading(true);
    }
  }, [
    fetchSettings.query.isSuccess,
    fetchSettings.query.data,
    fetchSettings.query.isError,
    fetchSettings.query.isLoading,
  ]);

  const value = useMemo(
    () => ({
      tenantSettings,
      loading,
      refetchTenantSettings: fetchSettings.query.refetch,
    }),
    [tenantSettings, loading, fetchSettings.query.refetch],
  );

  return (
    <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
}

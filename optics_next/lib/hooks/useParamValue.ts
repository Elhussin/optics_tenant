"use client";

import { useParams } from "next/navigation";

export function useParamValue(key: string): string | undefined {
  const params = useParams();
  const value = params[key];

  if (Array.isArray(value)) {
    return value[0]; 
  }

  return value;
}

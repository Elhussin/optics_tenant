"use client";

import { useTranslations } from "next-intl";
import { getEntityTranslationNamespace } from "@/src/shared/constants/entityTranslationMap";

type Options = Record<string, any>;

/**
 * Merges multiple translation namespaces with fallback support.
 * Searches for keys in order and returns the first match found.
 *
 * Automatically maps entity names to their file locations using entityTranslationMap.
 * Example: "hrm-employees" → "forms/hrm"
 *
 * IMPORTANT: The namespaces array MUST have a consistent length across renders
 * to comply with React Hooks rules.
 *
 * @param namespaces - Array of namespace names to search (max 5 supported)
 * @returns Translation function that searches across all namespaces
 */
export function useMergedTranslations(namespaces: string[]) {
  // Map entity names to their actual file locations
  const mappedNamespaces = namespaces.map((ns) =>
    getEntityTranslationNamespace(ns),
  );

  // Fixed number of hook calls to comply with React Hooks rules
  // We support up to 5 namespaces - extend if needed
  const t1 = useTranslations(mappedNamespaces[0] || "");
  const t2 = useTranslations(mappedNamespaces[1] || "");
  const t3 = useTranslations(mappedNamespaces[2] || "");
  const t4 = useTranslations(mappedNamespaces[3] || "");
  const t5 = useTranslations(mappedNamespaces[4] || "");

  // Build active translations array based on actual namespaces provided
  const translations = [
    { t: t1, active: !!mappedNamespaces[0] },
    { t: t2, active: !!mappedNamespaces[1] },
    { t: t3, active: !!mappedNamespaces[2] },
    { t: t4, active: !!mappedNamespaces[3] },
    { t: t5, active: !!mappedNamespaces[4] },
  ];

  const t = (key: string, opts?: Options) => {
    // Search through active translations in order
    for (const { t: translator, active } of translations) {
      if (active && translator.has(key)) {
        return translator(key, opts);
      }
    }
    // Return key as fallback if not found in any namespace
    return key;
  };

  return t;
}

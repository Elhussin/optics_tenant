'use client';

import { useTranslations } from 'next-intl';

type Options = Record<string, any>;
export function useMergedTranslations(namespaces: string[]) {
  // Call hooks at the top level
  const translations = namespaces.map(ns => useTranslations(ns));

  const t = (key: string, opts?: Options) => {
    for (const tr of translations) {
      if (tr.has(key)) {
        return tr(key, opts);
      }
    }
    return key;
  };

  return t;
}
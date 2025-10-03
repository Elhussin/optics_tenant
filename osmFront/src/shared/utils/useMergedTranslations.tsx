'use client';

import { useTranslations } from 'next-intl';

type Options = Record<string, any>;

export function useMergedTranslations(namespaces: string[]) {
  const translators = namespaces.map((ns) => useTranslations(ns));

  const t = (key: string, opts?: Options) => {
    for (const tr of translators) {
      if (tr.has(key)) {
        return tr(key, opts);
      }
    }
    // fallback لو الكلمة مش موجودة
    return key;
  };

  return t;
}

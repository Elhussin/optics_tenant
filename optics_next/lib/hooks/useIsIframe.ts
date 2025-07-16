'use client'

import { useEffect, useState } from 'react';

export function useIsIframe() {
  const [isIframe, setIsIframe] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsIframe(window.self !== window.top);
    }
  }, []);

  return isIframe;
}

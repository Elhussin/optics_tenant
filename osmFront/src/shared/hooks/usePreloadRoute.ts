import { useRef } from "react";

/**
 * usePreloadRoute is a custom hook that preloads a route.
 * 
 * @param importFn - The function to import the route.
 * 
 * @returns {() => void}
 */
export function usePreloadRoute(importFn: () => Promise<any>) {
  const loaded = useRef(false);

  return () => {
    if (!loaded.current) {
      importFn();
      loaded.current = true;
    }
  };
}

// shared/components/LazyComponent.tsx
/**
 * Lazy Loading Components
 * مكونات التحميل الكسول
 */

"use client";

import React, {
  Suspense,
  ComponentType,
  lazy,
  useState,
  useEffect,
} from "react";
import { Spinner, PageLoading } from "@/src/shared/components/ui/Spinner";

// Loading fallback options
type LoadingSize = "sm" | "md" | "lg" | "full";

interface LazyComponentProps {
  loader: () => Promise<{ default: ComponentType<Record<string, unknown>> }>;
  loadingSize?: LoadingSize;
  loadingMessage?: string;
  fallback?: React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

const LoadingFallback = ({
  size = "md",
  message,
}: {
  size?: LoadingSize;
  message?: string;
}) => {
  switch (size) {
    case "sm":
      return (
        <div className="flex items-center justify-center p-4">
          <Spinner size="sm" />
        </div>
      );
    case "lg":
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Spinner size="lg" />
          {message && <p className="mt-4 text-secondary">{message}</p>}
        </div>
      );
    case "full":
      return <PageLoading message={message || "جاري التحميل..."} />;
    default:
      return (
        <div className="flex items-center justify-center py-8">
          <Spinner size="md" />
        </div>
      );
  }
};

/**
 * LazyComponent wrapper
 * غلاف التحميل الكسول
 */
export function LazyComponent({
  loader,
  loadingSize = "md",
  loadingMessage,
  fallback,
  ...props
}: LazyComponentProps) {
  const LazyLoadedComponent = lazy(loader);

  return (
    <Suspense
      fallback={
        fallback || (
          <LoadingFallback size={loadingSize} message={loadingMessage} />
        )
      }
    >
      <LazyLoadedComponent {...props} />
    </Suspense>
  );
}

/**
 * Create a lazy component with custom loading
 */
export function createLazyComponent<P extends Record<string, unknown>>(
  loader: () => Promise<{ default: ComponentType<P> }>,
  options?: {
    loadingSize?: LoadingSize;
    loadingMessage?: string;
  }
) {
  const LazyLoadedComponent = lazy(loader);

  return function LazyWrapper(props: P) {
    return (
      <Suspense
        fallback={
          <LoadingFallback
            size={options?.loadingSize || "md"}
            message={options?.loadingMessage}
          />
        }
      >
        <LazyLoadedComponent {...props} />
      </Suspense>
    );
  };
}

/**
 * Lazy image with blur placeholder
 * صورة كسولة مع صورة ضبابية مؤقتة
 */
interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholderColor?: string;
}

export function LazyImage({
  src,
  alt,
  width,
  height,
  className,
  placeholderColor = "#e2e8f0",
}: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        width: width ? `${width}px` : "100%",
        height: height ? `${height}px` : "auto",
        backgroundColor: placeholderColor,
      }}
    >
      {!loaded && !error && <div className="absolute inset-0 skeleton" />}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-elevated text-secondary">
          <span>فشل التحميل</span>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  );
}

/**
 * Deferred content - renders after a delay
 * محتوى مؤجل - يُعرض بعد تأخير
 */
interface DeferredProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  delay?: number;
}

export function Deferred({
  children,
  fallback = null,
  delay = 100,
}: DeferredProps) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldRender(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  if (!shouldRender) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Render when visible - only renders when in viewport
 * عرض عند الظهور - يُعرض فقط عند الوصول للمنطقة المرئية
 */
interface RenderWhenVisibleProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
}

export function RenderWhenVisible({
  children,
  fallback,
  rootMargin = "100px",
  threshold = 0,
}: RenderWhenVisibleProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  return <div ref={ref}>{isVisible ? children : fallback}</div>;
}

export default LazyComponent;

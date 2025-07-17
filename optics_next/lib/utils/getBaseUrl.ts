// lib/utils/getBaseUrl.ts

export const getBaseUrl = (hostFromServer?: string): string => {
    const port = process.env.NEXT_PUBLIC_PORT || "8000";
    const isProduction = process.env.NODE_ENV === "production";
    const protocol = isProduction ? "https" : "http";
  
    const hostname =
      typeof window !== "undefined"
        ? window.location.hostname
        : hostFromServer?.split(":")[0] || "localhost";
  
    // 🧪 localhost فقط
    if (hostname === "localhost") {
      return `${protocol}://localhost:${port}`;
    }
  
    // 🧪 subdomain.localhost
    if (hostname.endsWith(".localhost")) {
      const parts = hostname.split(".");
      const subdomain = parts.length === 2 ? parts[0] : null;
  
      if (subdomain) {
        return `${protocol}://${subdomain}.localhost:${port}`;
      }
    }
  
    // 🧪 production domains (store1.example.com أو example.com)
    const parts = hostname.split(".");
    const isSubdomain = parts.length > 2;
  
    if (isProduction) {
      // 🟢 حذف البورت في production
      if (isSubdomain) {
        const subdomain = parts[0];
        const mainDomain = parts.slice(1).join(".");
        return `${protocol}://${subdomain}.${mainDomain}`;
      }
      return `${protocol}://${hostname}`;
    } else {
      // 🟠 development - أبقِ البورت
      if (isSubdomain) {
        const subdomain = parts[0];
        const mainDomain = parts.slice(1).join(".");
        return `${protocol}://${subdomain}.${mainDomain}:${port}`;
      }
      return `${protocol}://${hostname}:${port}`;
    }
  };
  



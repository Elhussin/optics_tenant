

export const getSubdomain = (hostFromServer?: string): string | null => {
  const hostname =
    typeof window !== "undefined"
      ? window.location.hostname
      : hostFromServer?.split(":")[0] || "localhost";

  // 1. استرجاع النطاق الأساسي من المتغيرات البيئية
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || "localhost";

  // استثناء localhost الصريح (بدون subdomain)
  if (hostname === "localhost") return null;

  // إذا كان الهوست يتطابق تمامًا مع الأساسي (مثلاً optics.com) -> لا يوجد subdomain
  if (hostname === baseDomain) return null;

  // 2. التحقق مما إذا كان الهوست هو نطاق فرعي من النطاق الأساسي
  // نتأكد أن الهوست ينتهي بـ .baseDomain (مثال: store1.localhost أو store1.optics.com)
  const dotBaseDomain = `.${baseDomain}`;
  if (hostname.endsWith(dotBaseDomain)) {
    // نحصل على الجزء الذي يسبق النطاق الأساسي
    // store1.optics.com -> store1
    const candidate = hostname.replace(dotBaseDomain, "");

    // 3. تجاهل www إذا كان هو الـ subdomain
    if (candidate === "www") return null;

    // حماية إضافية من النقاط (مثال: sub.store1.optics.com -> نرفض الـ deep subdomains أو نأخذ الأخير)
    // هنا نفترض depth واحد فقط للـ Tenant
    if (candidate.includes('.')) {
      return candidate.split('.').pop() || candidate;
    }

    return candidate;
  }

  // حالة احتياطية: local dev بدون env صحيح (لا ينبغي أن تحدث إذا كان env مضبوط)
  if (baseDomain === 'localhost' && hostname.endsWith('.localhost')) {
    const parts = hostname.split(".");
    if (parts.length === 2 && parts[0] !== 'www') return parts[0];
  }

  return null;
};




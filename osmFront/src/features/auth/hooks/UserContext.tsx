// src/features/auth/hooks/UserContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
} from "react";
import { safeToast } from "@/src/shared/utils/safeToast";
import { useRouter } from "@/src/app/i18n/navigation";
import { useTranslations } from "next-intl";
import { UserContextType, User } from "@/src/shared/types";
import { useApiForm } from "@/src/shared/hooks/useApiForm";

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const t = useTranslations("userContext");

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 1️⃣ منع الجلب التلقائي – نحتاج إلى جلب يدوي بعد تسجيل الدخول
  const fetchUser = useApiForm({
    alias: "users_profile_retrieve",
    // إذا كان useApiForm يمرّر الخيارات إلى react‑query:
    enabled: false,          // <-- مهم
    retry: false,
    staleTime: 0,
  });

  // 2️⃣ تحديث الـ state عندما ينجح الجلب اليدوي
  useEffect(() => {
    if (fetchUser.query.isSuccess && fetchUser.query.data) {
      setUser(fetchUser.query.data);
      setLoading(false);
    } else if (fetchUser.query.isError) {
      setUser(null);
      setLoading(false);
    } else if (fetchUser.query.isLoading) {
      setLoading(true);
    }
  }, [
    fetchUser.query.isSuccess,
    fetchUser.query.data,
    fetchUser.query.isError,
    fetchUser.query.isLoading,
  ]);

  // لا نحتاج إلى effect آخر لتشغيل الجلب تلقائيًا – نستخدم refetch فقط
  const logoutRequest = useApiForm({
    alias: "users_logout_create",
    onSuccess: () => {
      setUser(null);
      router.replace(`/auth/login`);
      safeToast(t("logoutSuccess"), { type: "success" });
    },
  });

  const logout = async () => {
    try {
      await logoutRequest.submitForm();
    } catch {
      safeToast(t("logoutError"), { type: "error" });
    }
  };

  const value: UserContextType = useMemo(
    () => ({
      user,
      setUser,
      loading,
      // 3️⃣ جلب المستخدم يدوياً بعد تسجيل الدخول
      refetchUser: async () => {
        try {
          const res = await fetchUser.query.refetch(); // ← يرسل الكوكي الجديد
          if (res?.data) setUser(res.data);
          return {
            success: res?.isSuccess ?? false,
            data: res?.data,
            error: res?.error,
          };
        } catch (error) {
          setUser(null);
          return { success: false, error };
        }
      },
      logout,
    }),
    [user, loading]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

import axios from "axios";
import { Zodios } from "@zodios/core";
import type { ZodiosOptions } from "@zodios/core";
import {createApiClient}  from "@/src/api-zod/gin-api"; // تأكد من المسار الصحيح
// import createApiClient  from "@/src/api-zod/gin-api"; // تأكد من المسار الصحيح

// دالة لتحديد ما إذا كان الـ endpoint خاص بالمصادقة
const isAuthEndpoint = (url: string) =>
  url.includes('/login') || 
  url.includes('/refresh') || 
  url.includes('/register') ||
  url.includes('/logout');

// تحديد الـ base URL
let baseUrl = "http://localhost:8001"; // fallback

if (typeof window !== "undefined") {
  const hostname = window.location.hostname; // مثل: store1.localhost
  const subdomain = hostname.split(".")[0];  // "store1"
  const domain = process.env.NEXT_PUBLIC_API_BASE || "localhost:8001"; // "localhost:8001"

  // إذا كنت تعمل على subdomain محلي مثل store1.localhost:3000
  if (!hostname.includes("localhost")) {
    baseUrl = `http://${subdomain}.${domain}`;  // مثال: http://store1.yourdomain.com
  } else if (hostname !== "localhost") {
    // مثال: store1.localhost ⇒ نستخدم subdomain
    baseUrl = `http://${subdomain}.${domain}`;
  } else {
    // localhost فقط (بدون subdomain)
    baseUrl = `http://${domain}`;
  }
}

// إنشاء axios instance مع إعدادات httpOnly cookies
const axiosInstance = axios.create({
  baseURL: baseUrl,
  withCredentials: true, // ⭐ مهم جداً للـ httpOnly cookies
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});


// إنشاء الـ API client
const api = createApiClient(baseUrl, {
  axiosInstance,
});

// إضافة الـ interceptor للاستجابة
// axiosInstance.interceptors.response.use(
//   (response) => response, // ✅ لو الطلب ناجح مرره كما هو
//   async (error) => {
//     const originalRequest = error.config;

//     // ⛔ لو مش 401 أو كان طلب مصادقة أو تم المحاولة مسبقاً
//     if (
//       error.response?.status !== 401 ||
//       isAuthEndpoint(originalRequest.url) ||
//       originalRequest._retry
//     ) {
//       return Promise.reject(error);
//     }

//     // تحديد أن هذا الطلب تم إعادة المحاولة معه
//     originalRequest._retry = true;

//     try {
//       console.log('🔄 Attempting to refresh token via httpOnly cookie...');
      
//       // 🍪 استدعاء refresh endpoint - الـ cookie سيتم إرساله تلقائياً
//       await api.users_token_refresh_create();

//       console.log('✅ Token refreshed successfully via httpOnly cookie');

//       // ⚠️ أعد تنفيذ الطلب الأصلي
//       // الـ cookie الجديد سيتم إرساله تلقائياً
//       return axiosInstance(originalRequest);
      
//     } catch (refreshError) {
//       console.error('⛔ Refresh token failed:', refreshError);

//       // 🧹 إعادة توجيه لصفحة تسجيل الدخول
//       if (typeof window !== 'undefined') {
//         // لا حاجة لحذف localStorage لأن الـ tokens في httpOnly cookies
//         // الـ server سيقوم بحذف الـ cookies عند logout
        
//         // يمكنك حذف أي بيانات user أخرى من localStorage
//         localStorage.removeItem('user');
//         localStorage.removeItem('userPreferences');
        
//         // إعادة توجيه لصفحة تسجيل الدخول
//         window.location.href = '/login';
//       }

//       return Promise.reject(refreshError);
//     }
//   }
// );

// ⚠️ لا نحتاج request interceptor لإضافة Authorization header
// لأن الـ httpOnly cookies ترسل تلقائياً مع كل request

// دالة مساعدة للـ logout (لحذف الـ httpOnly cookies)
export const logout = async () => {
  try {
    // استدعاء logout endpoint لحذف الـ httpOnly cookies من الـ server
    // await api.users_logout_create();
    await api.get('/api/users/logout/');
    // حذف أي بيانات محلية
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('userPreferences');
    }
    
    // إعادة توجيه لصفحة تسجيل الدخول
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  } catch (error) {
    console.error('Logout failed:', error);
    // حتى لو فشل الـ logout، نحذف البيانات المحلية ونعيد التوجيه
    if (typeof window !== 'undefined') {
      localStorage.clear();
      window.location.href = '/login';
    }
  }
};

// دالة للتحقق من حالة المصادقة
// export const checkAuthStatus = async () => {
//   try {
//     // استدعاء endpoint للتحقق من صحة الـ token
//     const response = await api.users_users_retrieve();
//     return { isAuthenticated: true, user: response };
//   } catch (error) {
//     return { isAuthenticated: false, user: null };
//   }
// };

export default api;
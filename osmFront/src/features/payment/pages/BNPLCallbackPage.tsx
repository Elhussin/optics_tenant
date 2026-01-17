// features/payment/pages/BNPLCallbackPage.tsx
/**
 * صفحة استجابة الدفع الآجل (Tabby/Tamara Callback)
 */

"use client";

import React, { useEffect, useState } from "react";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent } from "@/src/shared/components/shadcn/ui/card";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import { useBNPL } from "../hooks/usePayment";
import { Link } from "@/src/app/i18n/navigation";
import type { BNPLProvider } from "../types/payment.types";

interface BNPLCallbackPageProps {
  provider: BNPLProvider;
  status: "success" | "cancel" | "failure";
  sessionId: string;
  paymentId?: string;
  orderId?: number;
}

type CallbackState = "loading" | "success" | "failure" | "cancelled";

export function BNPLCallbackPage({
  provider,
  status,
  sessionId,
  paymentId,
  orderId,
}: BNPLCallbackPageProps) {
  const { handleCallback, loading } = useBNPL();
  const [callbackState, setCallbackState] = useState<CallbackState>("loading");
  const [error, setError] = useState<string | null>(null);

  const providerName = provider === "tabby" ? "تابي" : "تمارا";
  const providerColor = provider === "tabby" ? "#3BFFC1" : "#F9D74C";

  useEffect(() => {
    const processCallback = async () => {
      try {
        await handleCallback(provider, sessionId, status, paymentId);

        if (status === "success") {
          setCallbackState("success");
        } else if (status === "cancel") {
          setCallbackState("cancelled");
        } else {
          setCallbackState("failure");
        }
      } catch (err: any) {
        setError(err?.message || "حدث خطأ أثناء معالجة الدفع");
        setCallbackState("failure");
      }
    };

    processCallback();
  }, [provider, sessionId, status, paymentId, handleCallback]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="border-0 shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header with provider color */}
        <div className="h-2" style={{ backgroundColor: providerColor }} />

        <CardContent className="p-8">
          {/* Loading State */}
          {callbackState === "loading" && (
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 relative">
                <div className="absolute inset-0 border-4 border-gray-200 rounded-full" />
                <div
                  className="absolute inset-0 border-4 border-t-transparent rounded-full animate-spin"
                  style={{
                    borderColor: `${providerColor} transparent transparent transparent`,
                  }}
                />
              </div>
              <h2 className="text-xl font-bold mb-2">جاري معالجة الدفع...</h2>
              <p className="text-gray-500">يرجى الانتظار</p>
            </div>
          )}

          {/* Success State */}
          {callbackState === "success" && (
            <div className="text-center">
              <div
                className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${providerColor}20` }}
              >
                <CheckCircle
                  className="w-12 h-12"
                  style={{ color: providerColor }}
                />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-green-600">
                تم الدفع بنجاح!
              </h2>
              <p className="text-gray-500 mb-6">
                تمت العملية عبر {providerName} بنجاح
              </p>

              {paymentId && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-6">
                  <div className="text-sm text-gray-500">رقم العملية</div>
                  <div className="font-mono font-bold">{paymentId}</div>
                </div>
              )}

              <div className="space-y-3">
                {orderId && (
                  <Link href={`/dashboard/orders/${orderId}`}>
                    <Button className="w-full gap-2">
                      عرض الطلب
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                )}
                <Link href="/dashboard/orders">
                  <Button variant="outline" className="w-full">
                    العودة للطلبات
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Cancelled State */}
          {callbackState === "cancelled" && (
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-12 h-12 text-yellow-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-yellow-600">
                تم إلغاء العملية
              </h2>
              <p className="text-gray-500 mb-6">
                تم إلغاء عملية الدفع عبر {providerName}
              </p>

              <div className="space-y-3">
                {orderId && (
                  <Link href={`/dashboard/orders/${orderId}`}>
                    <Button className="w-full gap-2">
                      العودة للطلب
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                )}
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="w-4 h-4" />
                  إعادة المحاولة
                </Button>
              </div>
            </div>
          )}

          {/* Failure State */}
          {callbackState === "failure" && (
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-12 h-12 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-red-600">
                فشلت العملية
              </h2>
              <p className="text-gray-500 mb-4">
                حدث خطأ أثناء معالجة الدفع عبر {providerName}
              </p>

              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm mb-6">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                <Button
                  className="w-full gap-2"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="w-4 h-4" />
                  إعادة المحاولة
                </Button>
                {orderId && (
                  <Link href={`/dashboard/orders/${orderId}`}>
                    <Button variant="outline" className="w-full">
                      العودة للطلب
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Provider Logo */}
          <div className="mt-8 pt-6 border-t text-center">
            <span className="text-sm text-gray-400">مدعوم من</span>
            <div
              className="font-bold text-lg mt-1"
              style={{ color: providerColor }}
            >
              {providerName}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default BNPLCallbackPage;

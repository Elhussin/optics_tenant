// features/payment/hooks/usePayment.ts
/**
 * Payment API Hooks
 */
"use client";
import { useState, useCallback } from "react";
import { api } from "@/src/shared/api/axios";
import type {
  Payment,
  PaymentCreate,
  Installment,
  BNPLSession,
  BNPLSessionCreate,
  PaymentSummary,
  RefundRequest,
  BNPLProvider,
} from "../types/payment.types";

/**
 * Hook for managing Payments
 */
export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async (params?: Record<string, any>) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.customRequest("sales_payments_list", params);
      setPayments(data.results || data);
    } catch (err: any) {
      setError(err?.message || "فشل في جلب المدفوعات");
    } finally {
      setLoading(false);
    }
  }, []);

  const createPayment = useCallback(
    async (payment: PaymentCreate) => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.customRequest("sales_payments_create", payment);
        await fetchPayments();
        return data;
      } catch (err: any) {
        setError(
          err?.response?.data?.message || err?.message || "فشل في إنشاء الدفعة",
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchPayments],
  );

  const getPaymentsByOrder = useCallback(async (orderId: number) => {
    try {
      const data = await api.customRequest("sales_payments_list", {
        order: orderId,
      });
      return data.results || data;
    } catch (err) {
      return [];
    }
  }, []);

  const refundPayment = useCallback(
    async (refund: RefundRequest) => {
      setLoading(true);
      try {
        const data = await api.customRequest(
          "sales_payments_refund_create",
          refund,
        );
        await fetchPayments();
        return data;
      } catch (err: any) {
        setError(err?.message || "فشل في استرداد المبلغ");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchPayments],
  );

  return {
    payments,
    loading,
    error,
    fetchPayments,
    createPayment,
    getPaymentsByOrder,
    refundPayment,
  };
}

/**
 * Hook for managing Installments
 */
export function useInstallments() {
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInstallments = useCallback(
    async (params?: Record<string, any>) => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.customRequest("sales_installments_list", params);
        setInstallments(data.results || data);
      } catch (err: any) {
        setError(err?.message || "فشل في جلب الأقساط");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const getInstallmentsByPayment = useCallback(async (paymentId: number) => {
    try {
      const data = await api.customRequest("sales_installments_list", {
        payment: paymentId,
      });
      return data.results || data;
    } catch (err) {
      return [];
    }
  }, []);

  const getDueInstallments = useCallback(async () => {
    try {
      const data = await api.customRequest("sales_installments_list", {
        status: "due",
      });
      return data.results || data;
    } catch (err) {
      return [];
    }
  }, []);

  const getOverdueInstallments = useCallback(async () => {
    try {
      const data = await api.customRequest("sales_installments_list", {
        status: "overdue",
      });
      return data.results || data;
    } catch (err) {
      return [];
    }
  }, []);

  const markAsPaid = useCallback(
    async (installmentId: number, paidDate?: string) => {
      setLoading(true);
      try {
        const data = await api.customRequest(
          "sales_installments_partial_update",
          {
            id: installmentId,
            status: "paid",
            paid_at: paidDate || new Date().toISOString().split("T")[0],
          },
        );
        await fetchInstallments();
        return data;
      } catch (err: any) {
        setError(err?.message || "فشل في تحديث القسط");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchInstallments],
  );

  return {
    installments,
    loading,
    error,
    fetchInstallments,
    getInstallmentsByPayment,
    getDueInstallments,
    getOverdueInstallments,
    markAsPaid,
  };
}

/**
 * Hook for BNPL (Buy Now Pay Later) - Tabby & Tamara
 */
export function useBNPL() {
  const [session, setSession] = useState<BNPLSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSession = useCallback(
    async (data: BNPLSessionCreate): Promise<BNPLSession | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await api.customRequest(
          "sales_payments_create_bnpl_session_create",
          data,
        );
        setSession(result);
        return result;
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "فشل في إنشاء جلسة الدفع",
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const getSessionStatus = useCallback(
    async (sessionId: string, provider: BNPLProvider) => {
      try {
        const data = await api.customRequest(
          "sales_payments_bnpl_status_retrieve",
          {
            session_id: sessionId,
            provider,
          },
        );
        return data;
      } catch (err) {
        return null;
      }
    },
    [],
  );

  const handleCallback = useCallback(
    async (
      provider: BNPLProvider,
      sessionId: string,
      status: "success" | "cancel" | "failure",
      paymentId?: string,
    ) => {
      setLoading(true);
      try {
        const data = await api.customRequest(
          "sales_payments_bnpl_callback_create",
          {
            provider,
            session_id: sessionId,
            status,
            payment_id: paymentId,
          },
        );
        return data;
      } catch (err: any) {
        setError(err?.message || "فشل في معالجة رد الدفع");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const getTabbyWidget = useCallback(
    (publicKey: string, amount: number, currency: string = "SAR") => {
      // Returns Tabby widget configuration
      return {
        selector: "#tabby-widget",
        currency,
        price: amount,
        installmentsCount: 4,
        lang: "ar",
        source: "product",
        publicKey,
      };
    },
    [],
  );

  const getTamaraWidget = useCallback(
    (publicKey: string, amount: number, currency: string = "SAR") => {
      // Returns Tamara widget configuration
      return {
        selector: "#tamara-widget",
        currency,
        price: amount,
        lang: "ar",
        publicKey,
      };
    },
    [],
  );

  const reset = useCallback(() => {
    setSession(null);
    setError(null);
  }, []);

  return {
    session,
    loading,
    error,
    createSession,
    getSessionStatus,
    handleCallback,
    getTabbyWidget,
    getTamaraWidget,
    reset,
  };
}

/**
 * Hook for Payment Summary
 */
export function usePaymentSummary(orderId: number) {
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    if (!orderId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await api.customRequest(
        "sales_orders_payment_summary_retrieve",
        {
          id: orderId,
        },
      );
      setSummary(data);
      return data;
    } catch (err: any) {
      setError(err?.message || "فشل في جلب ملخص الدفع");
      return null;
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  return { summary, loading, error, fetchSummary };
}

import React from "react";
import {
  CreditCard,
  Calendar,
  DollarSign,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { GlassCard } from "@/src/shared/components/ui/GlassCard";
import { Badge } from "@/src/shared/components/ui/Badge";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { Loading4 } from "@/src/shared/components/ui/loding";
import { EmptyState } from "@/src/shared/components/ui/EmptyState";

interface PaymentsSectionProps {
  orderId: number;
}

export function PaymentsSection({ orderId }: PaymentsSectionProps) {
  const [expandedPayments, setExpandedPayments] = React.useState<Set<number>>(
    new Set(),
  );

  const { query } = useApiForm({
    alias: "sales_payments_list",
    defaultValues: {
      order: orderId,
      page_size: 50,
    },
    enabled: !!orderId,
  });

  const payments = React.useMemo(() => {
    const data: any = query.data;
    if (!data) return [];
    if (Array.isArray(data)) return data;
    return Array.isArray(data.results) ? data.results : [];
  }, [query.data]);

  const toggleExpanded = (paymentId: number) => {
    setExpandedPayments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(paymentId)) {
        newSet.delete(paymentId);
      } else {
        newSet.add(paymentId);
      }
      return newSet;
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: any; label: string }> = {
      pending: { variant: "neutral", label: "قيد الانتظار" },
      completed: { variant: "success", label: "مكتمل" },
      paid: { variant: "success", label: "مدفوع" },
      partial: { variant: "warning", label: "جزئي" },
      failed: { variant: "danger", label: "فشل" },
      refunded: { variant: "neutral", label: "مسترد" },
    };

    const config = statusMap[status] || statusMap.pending;
    return (
      <Badge variant={config.variant} outline dot>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  const formatMoney = (amount: any) => {
    const n = Number.parseFloat(String(amount ?? "0"));
    if (Number.isNaN(n)) return "-";
    return n.toLocaleString("ar-SA", { maximumFractionDigits: 2 });
  };

  if (query.isLoading) {
    return (
      <GlassCard className="border-border-main/50" hover>
        <div className="p-6 flex items-center justify-center min-h-[200px]">
          <Loading4 />
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="border-border-main/50" hover>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-main mb-4 flex items-center gap-2">
          <CreditCard size={20} className="text-primary" />
          المدفوعات ({payments.length})
        </h3>

        {payments.length === 0 ? (
          <EmptyState
            title="لا توجد مدفوعات"
            description="لم يتم تسجيل مدفوعات لهذا الطلب بعد"
          />
        ) : (
          <div className="space-y-3">
            {payments.map((payment: any) => {
              const isExpanded = expandedPayments.has(payment.id);
              const hasInstallments =
                payment.is_installment && payment.installments?.length > 0;

              return (
                <div
                  key={payment.id}
                  className="rounded-xl bg-surface border border-border-main hover:border-primary/50 transition-all duration-300 animate-fade-in-up overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <CreditCard size={18} className="text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-main">
                            {payment.payment_method?.name_ar ||
                              payment.payment_method?.name_en ||
                              "طريقة دفع"}
                          </p>
                          <p className="text-xs text-secondary flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDate(payment.paid_at || payment.created_at)}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(payment.status)}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border-main/50">
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign size={16} className="text-primary" />
                        <span className="text-secondary">المبلغ:</span>
                        <span className="font-bold text-main">
                          {formatMoney(payment.amount)} ر.س
                        </span>
                      </div>

                      {hasInstallments && (
                        <button
                          onClick={() => toggleExpanded(payment.id)}
                          className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp size={16} />
                              إخفاء الأقساط
                            </>
                          ) : (
                            <>
                              <ChevronDown size={16} />
                              عرض الأقساط ({payment.installments.length})
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Installments */}
                  {hasInstallments && isExpanded && (
                    <div className="bg-elevated/50 border-t border-border-main/50 p-4">
                      <h4 className="text-sm font-semibold text-secondary mb-3">
                        الأقساط
                      </h4>
                      <div className="space-y-2">
                        {payment.installments.map(
                          (installment: any, index: number) => (
                            <div
                              key={installment.id}
                              className="flex items-center justify-between p-3 rounded-lg bg-surface text-sm"
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">
                                  {installment.installment_number}
                                </span>
                                <span className="text-secondary">
                                  {formatDate(installment.due_date)}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-semibold text-main">
                                  {formatMoney(installment.amount)} ر.س
                                </span>
                                {getStatusBadge(installment.status)}
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </GlassCard>
  );
}

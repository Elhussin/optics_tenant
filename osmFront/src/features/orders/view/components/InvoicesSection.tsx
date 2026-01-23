import React from "react";
import { FileText, Eye, Calendar, DollarSign } from "lucide-react";
import { GlassCard } from "@/src/shared/components/ui/GlassCard";
import { Badge } from "@/src/shared/components/ui/Badge";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { Loading4 } from "@/src/shared/components/ui/loding";
import { EmptyState } from "@/src/shared/components/ui/EmptyState";

interface InvoicesSectionProps {
  orderId: number;
}

export function InvoicesSection({ orderId }: InvoicesSectionProps) {
  const { query } = useApiForm({
    alias: "sales_invoices_list",
    defaultValues: {
      order: orderId,
      page_size: 50,
    },
    enabled: !!orderId,
  });

  const invoices = React.useMemo(() => {
    const data: any = query.data;
    if (!data) return [];
    if (Array.isArray(data)) return data;
    return Array.isArray(data.results) ? data.results : [];
  }, [query.data]);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: any; label: string }> = {
      draft: { variant: "neutral", label: "مسودة" },
      confirmed: { variant: "info", label: "مؤكد" },
      paid: { variant: "success", label: "مدفوع" },
      partially_paid: { variant: "warning", label: "مدفوع جزئياً" },
      overdue: { variant: "danger", label: "متأخر" },
    };

    const config = statusMap[status] || statusMap.draft;
    return (
      <Badge variant={config.variant} outline dot>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
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
          <FileText size={20} className="text-primary" />
          الفواتير ({invoices.length})
        </h3>

        {invoices.length === 0 ? (
          <EmptyState
            title="لا توجد فواتير"
            description="لم يتم إنشاء فواتير لهذا الطلب بعد"
          />
        ) : (
          <div className="space-y-3">
            {invoices.map((invoice: any) => (
              <div
                key={invoice.id}
                className="p-4 rounded-xl bg-surface border border-border-main hover:border-primary/50 transition-all duration-300 animate-fade-in-up"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-main font-mono">
                        {invoice.invoice_number}
                      </p>
                      <p className="text-xs text-secondary flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(invoice.created_at)}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(invoice.status)}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border-main/50">
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign size={16} className="text-primary" />
                    <span className="text-secondary">المبلغ:</span>
                    <span className="font-bold text-main">
                      {formatMoney(invoice.total_amount)} ر.س
                    </span>
                  </div>
                  <ActionButton
                    variant="icon-view"
                    size="sm"
                    icon={<Eye size={16} />}
                    title="عرض التفاصيل"
                    navigateTo={`/dashboard/invoices/${invoice.id}`}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </GlassCard>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/src/shared/api/axios";
import { GlassCard } from "@/src/shared/components/ui/GlassCard";
import { Badge } from "@/src/shared/components/ui/Badge";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { SectionLoading } from "@/src/shared/components/ui/Spinner";
import { ConfirmDialog } from "@/src/shared/components/ui/dialogs/ConfirmDialog";
import { FileText, Printer, ArrowLeft, Ban, CreditCard, CheckCircle, QrCode } from "lucide-react";
import { safeToast } from "@/src/shared/utils/safeToast";
import { IssueCreditNoteDialog } from "../components/IssueCreditNoteDialog";

function formatMoney(amount: any, locale: string) {
  const n = Number.parseFloat(String(amount ?? "0"));
  if (Number.isNaN(n)) return "-";
  return n.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function InvoiceDetailPage() {
  const t = useTranslations("invoices");
  const locale = useLocale();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [invoice, setInvoice] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [creditNoteDialogOpen, setCreditNoteDialogOpen] = useState(false);

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      setIsLoading(true);
      const data = await api.customRequest("sales_invoices_retrieve", { params: { id: parseInt(id) } });
      setInvoice(data);
    } catch (error) {
      safeToast(t("errors.fetch"), { type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmInvoice = async () => {
    try {
      await api.customRequest("sales_invoices_confirm_create", { params: { id: parseInt(id) }, data: {} });
      safeToast(t("success.confirmed"), { type: "success" });
      fetchInvoice();
    } catch (error) {
      safeToast(t("errors.confirm"), { type: "error" });
    }
  };

  const handleDelete = async () => {
    try {
      await api.customRequest("sales_invoices_destroy", { params: { id: parseInt(id) } });
      safeToast(t("success.deleted"), { type: "success" });
      router.push("/dashboard/invoices");
    } catch (error) {
      safeToast(t("errors.delete"), { type: "error" });
    }
  };

  if (isLoading) return <SectionLoading />;
  if (!invoice) return <div>{t("errors.notFound")}</div>;

  const isConfirmed = invoice.status !== "draft";

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <ActionButton
          variant="secondary"
          icon={<ArrowLeft size={18} />}
          label={t("actions.back")}
          onClick={() => router.push("/dashboard/invoices")}
        />
        <div className="flex items-center gap-3">
          <ActionButton
            variant="outline"
            icon={<Printer size={18} />}
            label={t("actions.print")}
            onClick={() => window.print()}
          />
          {!isConfirmed && (
            <>
              <ActionButton
                variant="primary"
                icon={<CheckCircle size={18} />}
                label={t("actions.confirm")}
                onClick={handleConfirmInvoice}
              />
              <ActionButton
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
                icon={<Ban size={18} />}
                label={t("actions.delete")}
                onClick={() => setDeleteDialogOpen(true)}
              />
            </>
          )}
          {isConfirmed && (
            <ActionButton
              variant="outline"
              className="border-amber-200 text-amber-600 hover:bg-amber-50"
              icon={<CreditCard size={18} />}
              label={t("actions.issueCreditNote")}
              onClick={() => setCreditNoteDialogOpen(true)}
            />
          )}
        </div>
      </div>

      <GlassCard className="p-8 space-y-8 print:shadow-none print:border-none print:p-0">
        {/* Header section */}
        <div className="flex justify-between items-start border-b border-border-main pb-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-main flex items-center gap-3">
              {t("invoice")} #{invoice.invoice_number}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={isConfirmed ? "success" : "neutral"}>
                {t(`status.${invoice.status}`)}
              </Badge>
              <Badge variant="info">
                {invoice.invoice_type_details?.name}
              </Badge>
            </div>
            {/* ZATCA Info */}
            <div className="mt-4 space-y-1 text-sm text-secondary bg-surface/50 p-4 rounded-xl border border-border-main/50">
              <p><strong>{t("zatca.uuid")}:</strong> <span className="font-mono">{invoice.invoice_uuid || "-"}</span></p>
              <p><strong>{t("zatca.taxNumber")}:</strong> <span className="font-mono">{invoice.zatca_tax_number || "-"}</span></p>
              <p><strong>{t("zatca.hash")}:</strong> <span className="font-mono break-all">{invoice.current_invoice_hash || "-"}</span></p>
            </div>
          </div>
          
          <div className="text-right space-y-1 text-sm text-secondary">
            <p className="text-lg font-bold text-main mb-2">{t("companyDetails")}</p>
            {/* These would normally come from TenantSettings context, using placeholders or simple layout for now */}
            <p>{t("date")}: {new Date(invoice.created_at).toLocaleDateString(locale)}</p>
            <p>{t("dueDate")}: {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString(locale) : "-"}</p>
          </div>
        </div>

        {/* Customer Details */}
        <div>
          <h3 className="text-lg font-semibold mb-3">{t("customerDetails")}</h3>
          <div className="bg-surface p-4 rounded-xl border border-border-main text-sm">
            <p className="font-medium text-main text-base mb-1">{invoice.customer_name || t("guest")}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-secondary border-b border-border-main">
              <tr>
                <th className="py-3 px-4 font-semibold">{t("table.item")}</th>
                <th className="py-3 px-4 font-semibold text-right">{t("table.qty")}</th>
                <th className="py-3 px-4 font-semibold text-right">{t("table.unitPrice")}</th>
                <th className="py-3 px-4 font-semibold text-right">{t("table.tax")}</th>
                <th className="py-3 px-4 font-semibold text-right">{t("table.total")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-main/50">
              {invoice.items?.map((item: any, idx: number) => (
                <tr key={idx} className="hover:bg-surface/50">
                  <td className="py-4 px-4">
                    <p className="font-medium text-main">{item.product_name || t("unknownProduct")}</p>
                  </td>
                  <td className="py-4 px-4 text-right">{item.quantity}</td>
                  <td className="py-4 px-4 text-right">{formatMoney(item.unit_price, locale)}</td>
                  <td className="py-4 px-4 text-right">
                    {formatMoney(item.tax_amount, locale)} <span className="text-xs text-secondary">({(parseFloat(item.tax_rate || "0") * 100).toFixed(0)}%)</span>
                  </td>
                  <td className="py-4 px-4 text-right font-medium text-main">{formatMoney(item.net_amount, locale)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Summary */}
        <div className="flex justify-end">
          <div className="w-full md:w-1/2 lg:w-1/3 space-y-3 bg-surface p-6 rounded-2xl border border-border-main">
            <div className="flex justify-between text-sm text-secondary">
              <span>{t("summary.subtotal")}</span>
              <span>{formatMoney(invoice.subtotal, locale)} {invoice.currency}</span>
            </div>
            <div className="flex justify-between text-sm text-secondary">
              <span>{t("summary.discount")}</span>
              <span className="text-red-500">-{formatMoney(invoice.discount_amount, locale)} {invoice.currency}</span>
            </div>
            <div className="flex justify-between text-sm text-secondary">
              <span>{t("summary.tax")}</span>
              <span>{formatMoney(invoice.tax_amount, locale)} {invoice.currency}</span>
            </div>
            <div className="pt-3 border-t border-border-main flex justify-between font-bold text-lg text-main">
              <span>{t("summary.total")}</span>
              <span>{formatMoney(invoice.total_amount, locale)} {invoice.currency}</span>
            </div>
            <div className="pt-3 border-t border-border-main flex justify-between font-medium text-green-600">
              <span>{t("summary.paid")}</span>
              <span>{formatMoney(invoice.paid_amount, locale)} {invoice.currency}</span>
            </div>
          </div>
        </div>

        {/* ZATCA QR Placeholder */}
        <div className="mt-8 flex justify-center print:mt-12">
          <div className="text-center p-4 border-2 border-dashed border-gray-300 rounded-xl">
            <QrCode className="w-32 h-32 mx-auto text-gray-800" />
            <p className="mt-2 text-sm text-gray-500 font-mono">ZATCA QR Code</p>
          </div>
        </div>

        {/* Print Only: Return Policy */}
        <div className="hidden print:block mt-12 pt-8 border-t-2 border-gray-200 text-center text-sm text-gray-600">
          <h4 className="font-bold text-gray-800 mb-2">سياسة الاسترجاع والاستبدال</h4>
          <p>يحق للعميل استبدال أو استرجاع البضاعة خلال 3 أيام من تاريخ الشراء، بشرط أن تكون بحالتها الأصلية.</p>
          <p>العدسات الطبية المفصلة لا ترد ولا تستبدل إلا في حال وجود خطأ مصنعي.</p>
          <p className="mt-4 font-bold">شكراً لزيارتكم!</p>
        </div>
      </GlassCard>

      <ConfirmDialog
        open={deleteDialogOpen}
        title={t("dialogs.deleteTitle")}
        message={t("dialogs.deleteMessage")}
        onCancel={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        confirmText={t("dialogs.confirm")}
        cancelText={t("dialogs.cancel")}
        isDanger
      />

      <IssueCreditNoteDialog 
        open={creditNoteDialogOpen}
        onClose={() => setCreditNoteDialogOpen(false)}
        invoice={invoice}
      />
    </div>
  );
}

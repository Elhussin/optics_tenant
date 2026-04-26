"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { Loader2, AlertCircle } from "lucide-react";
import api from "@/src/shared/api/axios";
import CreatePurchaseOrder from "@/src/features/stock-management/components/purchase-orders/CreatePurchaseOrder";

interface PurchaseOrder {
  id: number;
  order_number: string;
  supplier: number;
  supplier_name: string;
  branch: number;
  branch_name: string;
  status: string;
  order_date: string;
  expected_date?: string;
  notes: string;
  items: Array<{
    id: number;
    variant: number;
    variant_sku: string;
    variant_name: string;
    product_name: string;
    quantity_ordered: number;
    unit_cost: string;
  }>;
}

// Only draft orders can be edited
const EDITABLE_STATUSES = ["draft"];

export default function PurchaseOrderEditPage() {
  const t = useTranslations("inventory");
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  // Fetch order data
  const {
    data: order,
    error,
    isLoading,
  } = useQuery<PurchaseOrder>({
    queryKey: ["purchase_order_edit", orderId],
    queryFn: async () => {
      const response = await api.customRequest(
        "products_purchase_orders_retrieve",
        { id: orderId },
      );
      return response;
    },
    enabled: !!orderId,
    refetchOnWindowFocus: false,
  });

  // Check if order is editable
  const isEditable = order && EDITABLE_STATUSES.includes(order.status);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-body flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-secondary">
            {t("common.loading") || "جاري التحميل..."}
          </p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-body flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <h2 className="text-xl font-semibold text-main">
            {t("purchaseOrders.details.loadError") || "فشل تحميل أمر الشراء"}
          </h2>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-primary text-white rounded-lg"
          >
            {t("common.back") || "العودة"}
          </button>
        </div>
      </div>
    );
  }

  if (!isEditable) {
    return (
      <div className="min-h-screen bg-body flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-amber-500" />
          <h2 className="text-xl font-semibold text-main">
            {t("purchaseOrders.edit.notEditable") ||
              "لا يمكن تعديل أمر الشراء هذا"}
          </h2>
          <p className="text-secondary">
            {t("purchaseOrders.edit.onlyDraft") ||
              "يمكن تعديل أوامر الشراء في حالة المسودة فقط"}
          </p>
          <p className="text-sm text-secondary">
            {t("purchaseOrders.edit.currentStatus") || "الحالة الحالية"}:{" "}
            <span className="font-semibold">{order.status}</span>
          </p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-primary text-white rounded-lg"
          >
            {t("common.back") || "العودة"}
          </button>
        </div>
      </div>
    );
  }

  // Transform order data to initialData format
  const initialData = {
    id: order.id,
    supplier: order.supplier,
    branch: order.branch,
    order_date: order.order_date,
    expected_date: order.expected_date || "",
    notes: order.notes || "",
    items: order.items.map((item) => ({
      variant: item.variant,
      variant_name: item.variant_sku,
      product_name: item.product_name,
      quantity_ordered: item.quantity_ordered,
      unit_cost: Number(item.unit_cost),
    })),
  };

  return <CreatePurchaseOrder mode="edit" initialData={initialData} />;
}

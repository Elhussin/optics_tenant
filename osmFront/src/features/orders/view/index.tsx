"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  User,
  Package,
  CreditCard,
  Clock,
  ClipboardCheck,
  Truck,
  XCircle,
  Edit,
  Printer,
  ArrowRight,
  Calendar,
  Phone,
  MapPin,
} from "lucide-react";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/shared/components/shadcn/ui/card";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { Loading4 } from "@/src/shared/components/ui/loding";

// New Components
import { StatusTimeline } from "./components/StatusTimeline";
import { InvoicesSection } from "./components/InvoicesSection";
import { PaymentsSection } from "./components/PaymentsSection";
import { OrderActions } from "./components/OrderActions";

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig: Record<
    string,
    { label: string; color: string; icon: any }
  > = {
    pending: {
      label: "قيد الانتظار",
      color: "bg-yellow-100 text-yellow-700",
      icon: Clock,
    },
    confirmed: {
      label: "مؤكد",
      color: "bg-blue-100 text-blue-700",
      icon: ClipboardCheck,
    },
    ready: {
      label: "جاهز",
      color: "bg-purple-100 text-purple-700",
      icon: Package,
    },
    delivered: {
      label: "تم التسليم",
      color: "bg-green-100 text-green-700",
      icon: Truck,
    },
    cancelled: {
      label: "ملغي",
      color: "bg-red-100 text-red-700",
      icon: XCircle,
    },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${config.color}`}
    >
      <Icon size={16} />
      {config.label}
    </span>
  );
};

// Payment status badge
const PaymentBadge = ({ status }: { status: string }) => {
  const config: Record<string, { label: string; color: string }> = {
    pending: { label: "غير مدفوع", color: "bg-red-100 text-red-700" },
    partial: { label: "دفع جزئي", color: "bg-yellow-100 text-yellow-700" },
    paid: { label: "مدفوع", color: "bg-green-100 text-green-700" },
    refunded: { label: "مسترد", color: "bg-gray-100 text-gray-700" },
    disputed: { label: "متنازع عليه", color: "bg-orange-100 text-orange-700" },
  };

  const badge = config[status] || config.pending;

  return (
    <span
      className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${badge.color}`}
    >
      {badge.label}
    </span>
  );
};

interface ViewOrderProps {
  orderId: number;
}

export function ViewOrder({ orderId }: ViewOrderProps) {
  const { query, isBusy } = useApiForm({
    alias: "sales_orders_retrieve",
    defaultValues: { id: orderId },
    enabled: !!orderId,
  });

  const order = query.data;

  const handleActionComplete = () => {
    query.refetch();
  };

  const remainingAmount = order
    ? parseFloat(order.total_amount || 0) - parseFloat(order.paid_amount || 0)
    : 0;

  if (isBusy || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading4 />
      </div>
    );
  }

  const customer = order.customer || {};
  const items = order.items || [];

  return (
    <div className="min-h-screen bg-body py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/dashboard/orders"
              className="text-sm text-secondary hover:text-primary flex items-center gap-1 mb-2"
            >
              <ArrowRight size={16} />
              العودة للقائمة
            </Link>
            <h1 className="text-3xl font-bold text-main flex items-center gap-3">
              <ShoppingCart className="text-primary" />
              الطلب #{order.order_number}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Printer size={16} className="ml-2" />
              طباعة
            </Button>
            <Link href={`/dashboard/orders/${orderId}/edit`}>
              <Button className="bg-primary hover:bg-primary/90">
                <Edit size={16} className="ml-2" />
                تعديل الطلب
              </Button>
            </Link>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="py-4 flex items-center justify-between">
              <span className="text-secondary">حالة الطلب</span>
              <StatusBadge status={order.status} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 flex items-center justify-between">
              <span className="text-secondary">حالة الدفع</span>
              <PaymentBadge status={order.payment_status} />
            </CardContent>
          </Card>
        </div>

        {/* Order Actions */}
        <div className="mb-6">
          <OrderActions
            orderId={orderId}
            status={order.status}
            paymentStatus={order.payment_status}
            remainingAmount={remainingAmount}
            onActionComplete={handleActionComplete}
          />
        </div>

        {/* Status Timeline */}
        <div className="mb-6">
          <StatusTimeline
            createdAt={order.created_at}
            confirmedAt={order.confirmed_at}
            readyAt={order.ready_at}
            deliveredAt={order.delivered_at}
            status={order.status}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Order Details */}
          <div className="col-span-2 space-y-6">
            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User size={20} />
                  معلومات العميل
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="text-primary" size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">
                      {customer.full_name || customer.first_name || "غير محدد"}
                    </p>
                    {customer.phone && (
                      <p className="text-secondary flex items-center gap-1">
                        <Phone size={14} />
                        {customer.phone}
                      </p>
                    )}
                  </div>
                </div>
                {customer.address && (
                  <div className="flex items-start gap-2 text-secondary pt-2 border-t">
                    <MapPin size={16} className="mt-0.5" />
                    <p>{customer.address}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package size={20} />
                  المنتجات ({items.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {items.map((item: any, index: number) => (
                    <div key={index} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {item.product_variant?.product?.name ||
                              `المنتج #${item.product_variant}`}
                          </p>
                          <p className="text-sm text-secondary">
                            SKU: {item.product_variant?.sku || "-"}
                          </p>
                        </div>
                        <div className="text-left">
                          <p className="font-semibold">
                            {parseFloat(item.total_price || 0).toFixed(2)} ر.س
                          </p>
                          <p className="text-sm text-secondary">
                            {item.quantity} ×{" "}
                            {parseFloat(item.unit_price || 0).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            {(order.notes || order.internal_notes) && (
              <Card>
                <CardHeader>
                  <CardTitle>الملاحظات</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {order.notes && (
                    <div>
                      <p className="text-sm text-secondary mb-1">
                        ملاحظات للعميل
                      </p>
                      <p className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        {order.notes}
                      </p>
                    </div>
                  )}
                  {order.internal_notes && (
                    <div>
                      <p className="text-sm text-secondary mb-1">
                        ملاحظات داخلية
                      </p>
                      <p className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg text-yellow-800 dark:text-yellow-200">
                        {order.internal_notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Invoices Section */}
            <InvoicesSection orderId={orderId} />

            {/* Payments Section */}
            <PaymentsSection orderId={orderId} />
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card className="bg-gradient-to-br from-primary/5 to-blue-50 dark:from-primary/10 dark:to-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard size={20} />
                  ملخص الطلب
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-secondary">المجموع الفرعي</span>
                  <span>{parseFloat(order.subtotal || 0).toFixed(2)} ر.س</span>
                </div>
                {parseFloat(order.discount_amount || 0) > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>الخصم</span>
                    <span>
                      -{parseFloat(order.discount_amount).toFixed(2)} ر.س
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-secondary">
                    الضريبة (
                    {(parseFloat(order.tax_rate || 0) * 100).toFixed(0)}%)
                  </span>
                  <span>
                    {parseFloat(order.tax_amount || 0).toFixed(2)} ر.س
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-xl font-bold">
                    <span>الإجمالي</span>
                    <span className="text-primary">
                      {parseFloat(order.total_amount || 0).toFixed(2)} ر.س
                    </span>
                  </div>
                </div>
                <div className="flex justify-between text-sm pt-2">
                  <span className="text-secondary">المدفوع</span>
                  <span className="text-green-600 font-medium">
                    {parseFloat(order.paid_amount || 0).toFixed(2)} ر.س
                  </span>
                </div>
                {parseFloat(order.total_amount || 0) -
                  parseFloat(order.paid_amount || 0) >
                  0 && (
                  <div className="flex justify-between text-sm font-semibold">
                    <span>المتبقي</span>
                    <span className="text-red-500">
                      {(
                        parseFloat(order.total_amount || 0) -
                        parseFloat(order.paid_amount || 0)
                      ).toFixed(2)}{" "}
                      ر.س
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Dates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar size={20} />
                  التواريخ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-secondary">تاريخ الإنشاء</span>
                  <span>
                    {new Date(order.created_at).toLocaleDateString("ar-SA")}
                  </span>
                </div>
                {order.confirmed_at && (
                  <div className="flex justify-between">
                    <span className="text-secondary">تاريخ التأكيد</span>
                    <span>
                      {new Date(order.confirmed_at).toLocaleDateString("ar-SA")}
                    </span>
                  </div>
                )}
                {order.expected_delivery && (
                  <div className="flex justify-between">
                    <span className="text-secondary">موعد التسليم</span>
                    <span>
                      {new Date(order.expected_delivery).toLocaleDateString(
                        "ar-SA",
                      )}
                    </span>
                  </div>
                )}
                {order.delivered_at && (
                  <div className="flex justify-between">
                    <span className="text-secondary">تاريخ التسليم</span>
                    <span>
                      {new Date(order.delivered_at).toLocaleDateString("ar-SA")}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewOrder;

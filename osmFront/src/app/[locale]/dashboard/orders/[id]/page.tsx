"use client";

import { useParams } from "next/navigation";
import { ViewOrder } from "@/src/features/orders/view";

export default function ViewOrderPage() {
  const params = useParams();
  const orderId = parseInt(params.id as string);

  if (isNaN(orderId)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">رقم الطلب غير صالح</p>
      </div>
    );
  }

  return <ViewOrder orderId={orderId} />;
}

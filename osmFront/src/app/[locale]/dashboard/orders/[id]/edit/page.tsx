"use client";

import { useParams } from "next/navigation";
import { EditOrder } from "@/src/features/orders/edit";

export default function EditOrderPage() {
  const params = useParams();
  const orderId = parseInt(params.id as string);

  if (isNaN(orderId)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">رقم الطلب غير صالح</p>
      </div>
    );
  }

  return <EditOrder orderId={orderId} />;
}

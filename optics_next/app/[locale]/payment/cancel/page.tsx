// app/paypal/cancel/page.tsx
"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function PayPalCancelPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-yellow-50 p-6">
      <AlertTriangle className="text-yellow-600 w-20 h-20 mb-4" />
      <h1 className="text-3xl font-bold text-yellow-700">Payment Cancelled</h1>
      <p className="text-gray-700 mt-2 text-center max-w-md">
        You have cancelled the payment process. You can try again anytime to complete your subscription.
      </p>
      <Link
        href="/pricing"
        className="mt-6 px-6 py-3 bg-yellow-600 text-white rounded-lg shadow hover:bg-yellow-700 transition"
      >
        Try Again
      </Link>
    </div>
  );
}

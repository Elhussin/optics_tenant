// app/paypal/fail/page.tsx
"use client";

import Link from "next/link";
import { XCircle } from "lucide-react";

export default function PayPalFailPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-red-50 p-6">
      <XCircle className="text-red-600 w-20 h-20 mb-4" />
      <h1 className="text-3xl font-bold text-red-700">Payment Failed</h1>
      <p className="text-gray-700 mt-2 text-center max-w-md">
        Unfortunately, your payment could not be processed. Please try again or contact support.
      </p>
      <Link
        href="/pricing"
        className="mt-6 px-6 py-3 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition"
      >
        Try Again
      </Link>
    </div>
  );
}

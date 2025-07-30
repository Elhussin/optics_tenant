"use client";

import { useState } from "react";

type PayPalButtonProps = {
  clientId: string; // معرف العميل في النظام عندك
};

export default function PayPalButton({ clientId }: PayPalButtonProps) {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState("basic");
  const [period, setPeriod] = useState("month");
    const url= process.env.NEXT_PUBLIC_API_BASE
  const createOrder = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${url}/api/tenants/paypal/create/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client: clientId, plan, period }),
      });

      const data = await res.json();

      if (data.approval_url) {
        // فتح صفحة PayPal للموافقة
        window.location.href = data.approval_url;
      } else {
        alert("Failed to create PayPal order");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating PayPal order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg max-w-sm mx-auto bg-white shadow-md">
      <h3 className="text-lg font-bold mb-4">Choose Your Plan</h3>

      <label className="block mb-2">
        Plan:
        <select
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          className="w-full border rounded p-2 mt-1"
        >
          <option value="basic">Basic</option>
          <option value="premium">Premium</option>
          <option value="enterprise">Enterprise</option>
        </select>
      </label>

      <label className="block mb-4">
        Period:
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="w-full border rounded p-2 mt-1"
        >
          <option value="month">Monthly</option>
          <option value="year">Yearly</option>
        </select>
      </label>

      <button
        onClick={createOrder}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
      >
        {loading ? "Processing..." : "Pay with PayPal"}
      </button>
    </div>
  );
}

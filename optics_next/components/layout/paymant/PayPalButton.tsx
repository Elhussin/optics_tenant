"use client";

import { useState } from "react";
import { axiosInstance } from "@/lib/api/axios";
import { getBaseUrl } from "@/lib/utils/getBaseUrl";
import { apiConfig } from "@/lib/api/apiConfig";
import { PayPalButtonProps } from "@/types";

export default function PayPalButton({ clientId, planId, direction, label ,method}: PayPalButtonProps) {
  const [loading, setLoading] = useState(false);
  const createOrder = async () => {
    try {
      setLoading(true);
      apiConfig.ignoreSubdomain = true;
      if(direction=="شهر"){
        direction='month'
      }else if(direction=="سنة"){
        direction='year'
      }
      const baseUrl = getBaseUrl(undefined, apiConfig.ignoreSubdomain);
      const res = await axiosInstance.post(
        `${baseUrl}/api/tenants/create-payment-order/`,
        { client_id: clientId, plan_id: planId, direction: direction?.toLocaleLowerCase() ,method: method?.toLocaleLowerCase() || "paypal" }
      );

      const data = res.data;
      console.log("data", data);
      if (data.approval_url) {
        console.log("data.approval_url", data.approval_url);
        window.open(data.approval_url, '_self');
        // window.location.href = data.approval_url;
      } else {

        console.log("Failed to create PayPal order",data);
        alert("Failed to create PayPal order");
      }
    } catch (err) {
      console.log("err", err);
      console.error("Error creating PayPal order", err);
      // alert("Error creating PayPal order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={createOrder}
      disabled={loading}
      className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? "Processing..." : label || `${direction}`}
    </button>
  );
}

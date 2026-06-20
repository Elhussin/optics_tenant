"use client";

import React from "react";
import { StockTaking } from "@/src/features/stock-management/components/stock/StockTaking";

export default function StockTakingRoute() {
  return (
    <div className="p-4 md:p-6 h-full">
      <StockTaking />
    </div>
  );
}

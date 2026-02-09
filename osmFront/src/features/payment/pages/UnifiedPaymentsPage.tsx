"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/shared/components/shadcn/ui/tabs";
import { PaymentsListPage } from "@/src/features/payment";
import { InstallmentsPage } from "@/src/features/payment";
import DynamicFormGenerator from "@/src/features/formGenerator/components/DynamicFormGenerator";
import { CreditCard, Calendar, BarChart3 } from "lucide-react";

export default function UnifiedPaymentsPage() {
  const t = useTranslations("payments");
  const [activeTab, setActiveTab] = useState("sales-payments");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <Tabs
        defaultValue="sales-payments"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 h-auto p-1 bg-muted/50 rounded-xl">
          <TabsTrigger
            value="sales-payments"
            className="flex items-center gap-2 py-3 rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
          >
            <CreditCard className="w-4 h-4" />
            <span>{t("salesPayments", { fallback: "Sales Payments" })}</span>
          </TabsTrigger>
          <TabsTrigger
            value="installments"
            className="flex items-center gap-2 py-3 rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
          >
            <Calendar className="w-4 h-4" />
            <span>{t("installments", { fallback: "Installments" })}</span>
          </TabsTrigger>
          <TabsTrigger
            value="subscription"
            className="flex items-center gap-2 py-3 rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
          >
            <BarChart3 className="w-4 h-4" />
            <span>{t("subscription", { fallback: "My Subscription" })}</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent
            value="sales-payments"
            className="m-0 focus-visible:outline-none"
          >
            <PaymentsListPage />
          </TabsContent>

          <TabsContent
            value="installments"
            className="m-0 focus-visible:outline-none"
          >
            <InstallmentsPage />
          </TabsContent>

          <TabsContent
            value="subscription"
            className="m-0 focus-visible:outline-none"
          >
            <DynamicFormGenerator entity="payments" />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

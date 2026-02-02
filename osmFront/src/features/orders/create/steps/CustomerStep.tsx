"use client";

import React, { useState, useEffect } from "react";
import { Search, User, UserCheck } from "lucide-react";
import { Input } from "@/src/shared/components/shadcn/ui/input";
import { Label } from "@/src/shared/components/shadcn/ui/label";
import { Card, CardContent } from "@/src/shared/components/shadcn/ui/card";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { useOrderFormStore } from "../../store/useOrderFormStore";
import { SectionLoading } from "@/src/shared/components/ui/Spinner";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import DynamicFormDialog from "@/src/shared/components/ui/dialogs/DynamicFormDialog";
export function CustomerStep() {
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const store = useOrderFormStore();

  // Search customers
  const { query, isBusy } = useApiForm({
    alias: "crm_customers_list",
    defaultValues: { search: searchTerm, page_size: 10 },
    enabled: searchTerm.length >= 2,
  });

  useEffect(() => {
    if (searchTerm.length >= 2) {
      query.refetch();
    }
  }, [searchTerm]);

  useEffect(() => {
    if (query.data?.results) {
      setCustomers(query.data.results);
    }
  }, [query.data]);

  const handleSelectCustomer = (customer: any) => {
    store.setCustomer(
      customer.id,
      customer.full_name || `${customer.first_name} ${customer.last_name}`,
    );
    setSearchTerm("");
    setCustomers([]);
  };

  return (
    <div className="space-y-6">
      {/* Customer Search */}
      <div className="space-y-4">
        <Label className="text-lg font-semibold flex items-center gap-2">
          <User size={20} />
          اختيار العميل
          <ActionButton
            variant="success"
            icon={<User size={20} />}
            onClick={() => setShowModal(true)}
          />
        </Label>

        {/* Selected Customer */}
        {store.customerId && (
          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200">
            <CardContent className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                  <UserCheck size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="font-medium">{store.customerName}</p>
                  <p className="text-sm text-secondary">العميل المحدد</p>
                </div>
              </div>
              <button
                onClick={() => store.setCustomer(null, "")}
                className="text-sm text-red-500 hover:text-red-700"
              >
                تغيير
              </button>
            </CardContent>
          </Card>
        )}

        {/* Search Input */}
        {!store.customerId && (
          <div className="relative">
            <Search
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <Input
              type="text"
              placeholder="ابحث باسم العميل أو رقم الهاتف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />

            {/* Search Results */}
            {searchTerm.length >= 2 && (
              <div className="absolute z-10 w-full mt-1 bg-elevated rounded-lg shadow-lg border max-h-60 overflow-y-auto">
                {isBusy ? (
                  <div className="p-4 text-center">
                    <SectionLoading height="h-32" />
                  </div>
                ) : customers.length > 0 ? (
                  customers.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => handleSelectCustomer(customer)}
                      className="w-full px-4 py-3 text-right hover:bg-gray-100 dark:hover:bg-gray-800 border-b last:border-0"
                    >
                      <p className="font-medium">
                        {customer.full_name ||
                          `${customer.first_name} ${customer.last_name}`}
                      </p>
                      <p className="text-sm text-secondary">
                        {customer.phone || customer.email}
                      </p>
                    </button>
                  ))
                ) : (
                  <p className="p-4 text-center text-secondary">
                    لا توجد نتائج
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      {showModal && (
        <DynamicFormDialog
          entity={"customers"}
          onClose={() => {
            setShowModal(false);
            query.refetch();
            // setFetchForginKey(true);
          }}
        />
      )}
      {/* Note about branch and sales person */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
        <p className="text-blue-700 dark:text-blue-300">
          <strong>ملاحظة:</strong> سيتم تحديد الفرع والمستخدم تلقائياً بناء على
          بيانات تسجيل الدخول
        </p>
      </div>
    </div>
  );
}

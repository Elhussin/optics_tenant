import React from "react";
import { usePOSStore } from "../../store/usePOSStore";
import { UserPlus, ShieldPlus, FileText } from "lucide-react";
import { Button } from "@/src/shared/components/shadcn/ui/button";

export function POSCustomerPanel() {
  const { customerId, partnerId, insuranceClaim } = usePOSStore();

  return (
    <div className="flex items-center gap-2">
      <Button 
        variant={customerId ? "default" : "outline"} 
        className="flex-1 justify-start"
      >
        <UserPlus className="w-4 h-4 mr-2 ml-2" />
        {customerId ? "العميل محدد" : "اختيار العميل"}
      </Button>

      <Button 
        variant={partnerId ? "secondary" : "outline"}
        className="flex-none px-3"
        title="التأمين"
      >
        <ShieldPlus className="w-4 h-4" />
      </Button>

      <Button 
        variant="outline"
        className="flex-none px-3"
        title="الوصفة الطبية"
      >
        <FileText className="w-4 h-4" />
      </Button>
    </div>
  );
}

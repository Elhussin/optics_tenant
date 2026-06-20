"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/shared/components/shadcn/ui/dialog";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import { Input } from "@/src/shared/components/shadcn/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/shared/components/shadcn/ui/select";
import { Switch } from "@/src/shared/components/shadcn/ui/switch";
import { Label } from "@/src/shared/components/shadcn/ui/label";
import { AccountTreeSelect, AccountNode } from "./AccountTreeSelect";
import { api } from "@/src/shared/api/axios";
import { safeToast } from "@/src/shared/utils/safeToast";
import { Loader2 } from "lucide-react";

interface ChartOfAccountDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  account?: any;
  accountsTree: AccountNode[]; // Passed from parent to show tree
}

export function ChartOfAccountDialog({
  open,
  onClose,
  onSuccess,
  account,
  accountsTree,
}: ChartOfAccountDialogProps) {
  const t = useTranslations("accounting");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTreeSelect, setShowTreeSelect] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    account_type: "asset",
    parent: null as number | null,
    parentName: "",
    description: "",
    is_active: true,
  });

  useEffect(() => {
    if (account) {
      setFormData({
        code: account.code || "",
        name: account.name || "",
        account_type: account.account_type || "asset",
        parent: account.parent || null,
        parentName: account.parent_name || "",
        description: account.description || "",
        is_active: account.is_active ?? true,
      });
    } else {
      setFormData({
        code: "",
        name: "",
        account_type: "asset",
        parent: null,
        parentName: "",
        description: "",
        is_active: true,
      });
    }
    setShowTreeSelect(false);
  }, [account, open]);

  const handleSubmit = async () => {
    if (!formData.name || !formData.code) {
      safeToast(t("errors.requiredFields") || "Please fill in all required fields", { type: "error" });
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        code: formData.code,
        name: formData.name,
        account_type: formData.account_type,
        parent: formData.parent,
        description: formData.description,
        is_active: formData.is_active,
      };

      if (account) {
        await api.customRequest("accounting_chart_of_accounts_partial_update", {
          params: { id: account.id },
          data: payload,
        });
        safeToast(t("success.updated") || "Account updated successfully", { type: "success" });
      } else {
        await api.customRequest("accounting_chart_of_accounts_create", {
          data: payload,
        });
        safeToast(t("success.created") || "Account created successfully", { type: "success" });
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      safeToast(t("errors.submit") || "Failed to save account", { type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {account ? t("accounts.editAccount") || "تعديل الحساب" : t("accounts.newAccount") || "حساب جديد"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>الرمز المحاسبي <span className="text-red-500">*</span></Label>
            <Input
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="e.g. 1001"
            />
          </div>

          <div className="space-y-2">
            <Label>اسم الحساب <span className="text-red-500">*</span></Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. نقدية بالصندوق"
            />
          </div>

          <div className="space-y-2">
            <Label>نوع الحساب</Label>
            <Select
              value={formData.account_type}
              onValueChange={(val) => setFormData({ ...formData, account_type: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر نوع الحساب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asset">أصول (Asset)</SelectItem>
                <SelectItem value="liability">خصوم (Liability)</SelectItem>
                <SelectItem value="equity">حقوق ملكية (Equity)</SelectItem>
                <SelectItem value="revenue">إيرادات (Revenue)</SelectItem>
                <SelectItem value="expense">مصروفات (Expense)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>الحساب الرئيسي (الأب)</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 justify-start text-right"
                onClick={() => setShowTreeSelect(!showTreeSelect)}
              >
                {formData.parentName || formData.parent || "بدون حساب رئيسي (مستوى أول)"}
              </Button>
              {formData.parent && (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-red-500 px-3"
                  onClick={() => setFormData({ ...formData, parent: null, parentName: "" })}
                >
                  مسح
                </Button>
              )}
            </div>

            {showTreeSelect && (
              <div className="mt-2 animate-in slide-in-from-top-2">
                <AccountTreeSelect
                  data={accountsTree}
                  selectedId={formData.parent}
                  onSelect={(id, name) => {
                    if (id === account?.id) {
                      safeToast("لا يمكن اختيار الحساب كأب لنفسه", { type: "error" });
                      return;
                    }
                    setFormData({ ...formData, parent: id, parentName: name });
                    setShowTreeSelect(false);
                  }}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>الوصف</Label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="وصف إضافي (اختياري)"
            />
          </div>

          <div className="flex items-center space-x-2 space-x-reverse pt-2">
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              id="active-mode"
            />
            <Label htmlFor="active-mode">حساب نشط</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            إلغاء
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            حفظ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { SectionLoading } from "@/src/shared/components/ui/Spinner";
import { ArrowRight, Save, AlertTriangle } from "lucide-react";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/shared/components/shadcn/ui/card";
import { Input } from "@/src/shared/components/shadcn/ui/input";
import { Textarea } from "@/src/shared/components/shadcn/ui/textarea";
import { Label } from "@/src/shared/components/shadcn/ui/label";
import { safeToast } from "@/src/shared/utils/safeToast";
import api from "@/src/shared/api/axios";

export default function StockMovementEditPage() {
  const t = useTranslations("inventory");
  const params = useParams();
  const router = useRouter();
  const id = params.id ? parseInt(params.id as string, 10) : null;

  const { query } = useApiForm({
    alias: "products_stock_movements_retrieve",
    defaultValues: { id },
    enabled: !!id,
  });

  const [formData, setFormData] = React.useState({
    reference_number: "",
    notes: "",
  });
  const [isSaving, setIsSaving] = React.useState(false);

  useEffect(() => {
    if (query.data) {
      setFormData({
        reference_number: query.data.reference_number || "",
        notes: query.data.notes || "",
      });
    }
  }, [query.data]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await api.customRequest("products_stock_movements_partial_update", {
        id,
        reference_number: formData.reference_number,
        notes: formData.notes,
      });
      safeToast(t("common.savedSuccessfully"), { type: "success" });
      router.push(`/dashboard/stock-management/movements/${id}`);
    } catch (error) {
      safeToast(t("common.error"), { type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  if (query.isLoading || !query.data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SectionLoading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-body py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => router.back()}
              className="text-sm text-secondary hover:text-primary flex items-center gap-1 mb-2 transition-colors"
            >
              <ArrowRight size={16} />
              {t("common.cancel")}
            </button>
            <h1 className="text-3xl font-bold text-main">
              {t("movements.editTitle")} #{id}
            </h1>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            <Save size={16} />
            {isSaving ? t("common.saving") : t("common.save")}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("movements.editInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-lg p-4 flex gap-3 text-amber-800 dark:text-amber-200">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <p className="text-sm">
                {t("movements.editWarning") ||
                  "Note: You can only edit reference numbers and notes. Quantity and type cannot be changed as they affect stock history."}
              </p>
            </div>

            <div className="space-y-2">
              <Label>{t("movements.reference")}</Label>
              <Input
                value={formData.reference_number}
                onChange={(e) =>
                  setFormData({ ...formData, reference_number: e.target.value })
                }
                placeholder={t("movements.referencePlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <Label>{t("movements.notes")}</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder={t("movements.notesPlaceholder")}
                rows={4}
              />
            </div>

            {/* Read-only fields context */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <Label className="text-secondary">{t("movements.type")}</Label>
                <div className="text-main font-medium mt-1">
                  {query.data.movement_type_display}
                </div>
              </div>
              <div>
                <Label className="text-secondary">
                  {t("movements.quantity")}
                </Label>
                <div className="text-main font-medium mt-1">
                  {query.data.quantity}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

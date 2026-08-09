"use client";

import React, { useState, useMemo } from "react";
import {
  Grid,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Layers,
  Zap,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/src/shared/components/shadcn/ui/dialog";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import { Input } from "@/src/shared/components/shadcn/ui/input";
import { Label } from "@/src/shared/components/shadcn/ui/label";
import { Badge } from "@/src/shared/components/ui/Badge";
import { safeToast } from "@/src/shared/utils/safeToast";
import { axiosInstance } from "@/src/shared/api/axios";
import { useTranslations } from "next-intl";

interface LensMatrixModalProps {
  productId?: number;
  variantType?: string;
  onSuccess?: () => void;
}

export function LensMatrixModal({
  productId,
  variantType = "stockLenses",
  onSuccess,
}: LensMatrixModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const t = useTranslations("products");

  // Form states
  const [sphStart, setSphStart] = useState<number>(-6.0);
  const [sphEnd, setSphEnd] = useState<number>(0.0);
  const [sphStep, setSphStep] = useState<number>(0.25);

  const [cylStart, setCylStart] = useState<number>(0.0);
  const [cylEnd, setCylEnd] = useState<number>(-2.0);
  const [cylStep, setCylStep] = useState<number>(-0.25);

  const [sellingPrice, setSellingPrice] = useState<string>("100.00");
  const [minSellingPrice, setMinSellingPrice] = useState<string>("80.00");

  // Calculate total matrix combinations preview
  const totalCombinations = useMemo(() => {
    const calcCount = (start: number, end: number, step: number) => {
      if (!step || step === 0) return 1;
      const absStep = Math.abs(step);
      const diff = Math.abs(end - start);
      return Math.floor(diff / absStep) + 1;
    };

    const sphCount = calcCount(sphStart, sphEnd, sphStep);
    const cylCount =
      cylStart === 0 && cylEnd === 0 ? 1 : calcCount(cylStart, cylEnd, cylStep);
    return sphCount * cylCount;
  }, [sphStart, sphEnd, sphStep, cylStart, cylEnd, cylStep]);

  const handleGenerate = async () => {
    if (!productId) {
      safeToast(t("validation.saveProductFirst") || "يرجى حفظ المنتج أولاً قبل توليد المصفوفة", {
        type: "error",
      });
      return;
    }

    if (!sellingPrice || parseFloat(sellingPrice) <= 0) {
      safeToast(t("validation.invalidPrice") || "يرجى إدخال سعر بيع صحيح", {
        type: "error",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await axiosInstance.post("/api/products/lens-matrix/generate/", {
        product_id: productId,
        sph_start: sphStart,
        sph_end: sphEnd,
        sph_step: sphStep,
        cyl_start: cylStart,
        cyl_end: cylEnd,
        cyl_step: cylStep,
        selling_price: parseFloat(sellingPrice),
        min_selling_price: minSellingPrice ? parseFloat(minSellingPrice) : null,
        variant_type: variantType,
      });

      const data = response.data;

      if (data && data.created_count !== undefined) {
        safeToast(
          `تم إنشاء ${data.created_count} عدسة بنجاح! (تم تخطي ${data.skipped_duplicates_count} عدسة مكررة)`,
          { type: "success" }
        );
        setIsOpen(false);
        if (onSuccess) onSuccess();
      } else {
        safeToast("حدث خطأ أثناء توليد مصفوفة العدسات", { type: "error" });
      }
    } catch (error: any) {
      console.error("Failed to generate lens matrix:", error);
      safeToast(error?.message || "فشل في اتصال السيرفر لتوليد العدسات", {
        type: "error",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="gap-2 border-primary/40 bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all shadow-sm rounded-xl font-bold"
      >
        <Grid className="w-4 h-4" />
        <span>مولد مصفوفة العدسات (Lens Matrix)</span>
        <Badge variant="secondary" className="bg-primary/20 text-primary border-none">
          <Sparkles className="w-3 h-3 mr-1" /> آلي
        </Badge>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl rounded-2xl border-primary/20 shadow-2xl backdrop-blur-md">
          <DialogHeader className="border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-md">
                <Grid className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-black text-foreground">
                  مولد شبكة العدسات الآلي (Lens Matrix Generator)
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-1">
                  إنشاء شبكات الباور كاملة (SPH × CYL) بضغطة واحدة مع منع تكرار النطاقات الموجودة
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Range Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Spherical Range */}
              <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-foreground flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" /> مدى السفير (SPH)
                  </span>
                  <Badge variant="outline" className="text-xs">
                    Spherical
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">من (Start)</Label>
                    <Input
                      type="number"
                      step="0.25"
                      value={sphStart}
                      onChange={(e) => setSphStart(parseFloat(e.target.value) || 0)}
                      className="text-center font-bold"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">إلى (End)</Label>
                    <Input
                      type="number"
                      step="0.25"
                      value={sphEnd}
                      onChange={(e) => setSphEnd(parseFloat(e.target.value) || 0)}
                      className="text-center font-bold"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">الخطوة (Step)</Label>
                    <Input
                      type="number"
                      step="0.25"
                      value={sphStep}
                      onChange={(e) => setSphStep(parseFloat(e.target.value) || 0.25)}
                      className="text-center font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Cylinder Range */}
              <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-foreground flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-500" /> مدى السلندر (CYL)
                  </span>
                  <Badge variant="outline" className="text-xs">
                    Cylinder
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">من (Start)</Label>
                    <Input
                      type="number"
                      step="0.25"
                      value={cylStart}
                      onChange={(e) => setCylStart(parseFloat(e.target.value) || 0)}
                      className="text-center font-bold"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">إلى (End)</Label>
                    <Input
                      type="number"
                      step="0.25"
                      value={cylEnd}
                      onChange={(e) => setCylEnd(parseFloat(e.target.value) || 0)}
                      className="text-center font-bold"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">الخطوة (Step)</Label>
                    <Input
                      type="number"
                      step="0.25"
                      value={cylStep}
                      onChange={(e) => setCylStep(parseFloat(e.target.value) || -0.25)}
                      className="text-center font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="font-bold text-xs">سعر البيع الافتراضي (Selling Price) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  placeholder="100.00"
                  className="font-bold text-emerald-600"
                />
              </div>
              <div>
                <Label className="font-bold text-xs">أقل سعر بيع مسموح (Minimum Price)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={minSellingPrice}
                  onChange={(e) => setMinSellingPrice(e.target.value)}
                  placeholder="80.00"
                  className="font-bold text-amber-600"
                />
              </div>
            </div>

            {/* Matrix Summary Box */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 via-blue-500/10 to-indigo-500/10 border border-primary/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <div>
                  <h4 className="font-bold text-sm text-foreground">إجمالي العدسات المتوقعة</h4>
                  <p className="text-xs text-muted-foreground">
                    سيتم إنشاء جميع العدسات مع حساب الـ SKU والباركود لكل عدسة تلقائياً
                  </p>
                </div>
              </div>
              <span className="text-2xl font-black text-primary px-3 py-1 rounded-lg bg-background border border-primary/30 shadow-inner">
                {totalCombinations}
              </span>
            </div>
          </div>

          <DialogFooter className="border-t border-border pt-4 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isGenerating}
              className="rounded-xl"
            >
              إلغاء
            </Button>
            <Button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || totalCombinations <= 0}
              className="rounded-xl bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 font-bold px-6 shadow-lg shadow-primary/20"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جاري التوليد...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 ml-2" />
                  توليد {totalCombinations} عدسة الآن
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

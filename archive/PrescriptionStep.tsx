"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Edit3,
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  X,
} from "lucide-react";
import { Label } from "@/src/shared/components/shadcn/ui/label";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/src/shared/components/shadcn/ui/card";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { useOrderFormStore } from "../../store/useOrderFormStore";
import { SkeletonGroup } from "@/src/shared/components/ui/Skeleton";
import EyeTest from "@/src/features/prescription/components/EyeTest";
import { motion, AnimatePresence } from "framer-motion";

interface PrescriptionCardProps {
  prescription: any;
  isSelected: boolean;
  isExpanded: boolean;
  isEditing: boolean;
  onSelect: () => void;
  onToggleExpand: () => void;
  onToggleEdit: () => void;
  customerId: number | null;
}

function PrescriptionCard({
  prescription,
  isSelected,
  isExpanded,
  isEditing,
  onSelect,
  onToggleExpand,
  onToggleEdit,
  customerId,
}: PrescriptionCardProps) {
  const examDate = new Date(
    prescription.exam_date || prescription.created_at
  ).toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Card
      className={`transition-all overflow-hidden ${
        isSelected ? "ring-2 ring-primary bg-primary/5" : "hover:shadow-md"
      }`}
    >
      {/* Header - Always Visible */}
      <CardHeader
        className="py-3 px-4 cursor-pointer flex flex-row items-center justify-between"
        onClick={onSelect}
      >
        <div className="flex items-center gap-3">
          {/* Selection Indicator */}
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
              isSelected
                ? "bg-primary border-primary"
                : "border-gray-300 dark:border-gray-600"
            }`}
          >
            {isSelected && <Check size={12} className="text-white" />}
          </div>

          {/* Date Badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
              {examDate}
            </span>
            <span className="text-xs text-secondary">#{prescription.id}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Edit Button */}
          {isSelected && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onToggleEdit();
              }}
              className="h-8 px-3"
            >
              {isEditing ? (
                <>
                  <X size={14} className="mr-1" />
                  إلغاء
                </>
              ) : (
                <>
                  <Edit3 size={14} className="mr-1" />
                  تعديل
                </>
              )}
            </Button>
          )}

          {/* Expand/Collapse Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>
        </div>
      </CardHeader>

      {/* Collapsed Summary */}
      {!isExpanded && (
        <CardContent className="py-2 px-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex flex-wrap gap-4 text-xs">
            <div>
              <span className="font-medium text-primary">OD: </span>
              <span className="text-secondary">
                {prescription.right_sph || "—"} /{" "}
                {prescription.right_cyl || "—"} ×{" "}
                {prescription.right_axis || "—"}°
              </span>
            </div>
            <div>
              <span className="font-medium text-primary">OS: </span>
              <span className="text-secondary">
                {prescription.left_sph || "—"} / {prescription.left_cyl || "—"}{" "}
                × {prescription.left_axis || "—"}°
              </span>
            </div>
          </div>
        </CardContent>
      )}

      {/* Expanded View - EyeTest Component */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <CardContent className="pt-4 border-t border-gray-100 dark:border-gray-700">
              <EyeTest
                alias="prescriptions_prescription_update"
                title="تعديل الفحص"
                message="تم حفظ التعديلات بنجاح"
                submitText={isEditing ? "حفظ التعديلات" : ""}
                id={prescription.id}
                isView={!isEditing}
                showContactLens={false}
                customerId={customerId || undefined}
              />
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

export function PrescriptionStep() {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showNewPrescription, setShowNewPrescription] = useState(false);
  const store = useOrderFormStore();

  // Fetch customer prescriptions - مع تحديث تلقائي عند تغيير العميل
  const queryParams = React.useMemo(
    () => ({
      customer: store.customerId,
      page_size: 20,
    }),
    [store.customerId]
  );

  const { query, isBusy } = useApiForm({
    alias: "prescriptions_prescription_list",
    defaultValues: queryParams,
    enabled: !!store.customerId,
  });

  // إعادة جلب البيانات عند تغيير العميل
  useEffect(() => {
    if (store.customerId) {
      // مسح الفحوصات السابقة
      setPrescriptions([]);
      setExpandedId(null);
      setEditingId(null);
      setShowNewPrescription(false);
      // إلغاء اختيار الفحص السابق
      store.setPrescription(null);
      // جلب فحوصات العميل الجديد
      query.refetch();
    }
  }, [store.customerId]);

  useEffect(() => {
    if (query.data?.results) {
      setPrescriptions(query.data.results);

      // إذا لم توجد وصفات، أظهر نموذج إنشاء جديد
      if (query.data.results.length === 0) {
        setShowNewPrescription(true);
      }
    }
  }, [query.data]);

  const handleSelectPrescription = (id: number) => {
    const newId = store.prescriptionId === id ? null : id;
    store.setPrescription(newId);

    // Auto-expand when selecting
    if (newId) {
      setExpandedId(newId);
    }
  };

  const handleToggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
    // Close editing if collapsing
    if (expandedId === id) {
      setEditingId(null);
    }
  };

  const handleToggleEdit = (id: number) => {
    setEditingId(editingId === id ? null : id);
  };

  if (!store.customerId) {
    return (
      <div className="text-center py-8">
        <FileText size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-secondary">يرجى اختيار العميل أولاً</p>
      </div>
    );
  }

  console.log("prescriptions", prescriptions);
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Label className="text-lg font-semibold flex items-center gap-2">
          <FileText size={20} />
          الوصفات الطبية للعميل
        </Label>

        <div className="flex gap-2">
          {prescriptions.length > 0 && !showNewPrescription && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNewPrescription(true)}
              className="gap-2"
            >
              <Plus size={16} />
              فحص جديد
            </Button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isBusy ? (
        <div className="space-y-3">
          <SkeletonGroup type="card" count={2} />
        </div>
      ) : (
        <div className="space-y-4">
          {/* New Prescription Form */}
          <AnimatePresence>
            {showNewPrescription && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-2 border-dashed border-primary/50 bg-primary/5">
                  <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Plus size={18} className="text-primary" />
                      <span className="font-semibold text-primary">
                        فحص جديد
                      </span>
                    </div>
                    {prescriptions.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowNewPrescription(false)}
                        className="h-8 w-8 p-0"
                      >
                        <X size={16} />
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="pt-4 border-t border-primary/20">
                    <EyeTest
                      alias="prescriptions_prescription_create"
                      title="فحص جديد"
                      message="تم حفظ الفحص بنجاح"
                      submitText="حفظ الفحص"
                      isView={false}
                      showContactLens={false}
                      customerId={store.customerId || undefined}
                      onSaveSuccess={(newPrescription) => {
                        // إضافة الفحص الجديد للقائمة
                        setPrescriptions((prev) => [newPrescription, ...prev]);
                        // تحديد الفحص الجديد
                        store.setPrescription(newPrescription.id);
                        // إخفاء نموذج الإنشاء
                        setShowNewPrescription(false);
                        // إعادة جلب البيانات
                        query.refetch();
                      }}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Existing Prescriptions List */}
          {prescriptions.length > 0 ? (
            <div className="space-y-3">
              <Label className="text-sm text-secondary">
                الفحوصات السابقة ({prescriptions.length})
              </Label>

              {prescriptions.map((prescription) => (
                <PrescriptionCard
                  key={prescription.id}
                  prescription={prescription}
                  isSelected={store.prescriptionId === prescription.id}
                  isExpanded={expandedId === prescription.id}
                  isEditing={editingId === prescription.id}
                  onSelect={() => handleSelectPrescription(prescription.id)}
                  onToggleExpand={() => handleToggleExpand(prescription.id)}
                  onToggleEdit={() => handleToggleEdit(prescription.id)}
                  customerId={store.customerId}
                />
              ))}
            </div>
          ) : (
            !showNewPrescription && (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-secondary mb-4">
                  لا توجد فحوصات سابقة للعميل
                </p>
              </div>
            )
          )}
        </div>
      )}

      {/* Skip Note */}
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-sm">
        <p className="text-yellow-700 dark:text-yellow-300">
          <strong>ملاحظة:</strong> يمكنك تخطي هذه الخطوة إذا لم تكن هناك وصفة
          طبية للطلب
        </p>
      </div>
    </div>
  );
}

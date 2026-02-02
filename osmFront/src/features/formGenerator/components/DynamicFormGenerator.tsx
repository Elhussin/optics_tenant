"use client";

import React, { useState, useEffect, useMemo } from "react";
import { z } from "zod";
import { schemas } from "@/src/shared/api/schemas";
import { DynamicFormProps } from "@/src/shared/types/DynamicFormTypes";
import {
  defaultConfig,
  ignoredFields,
} from "@/src/features/formGenerator/constants/generatFormConfig";
import { RenderField } from "./RenderField";
import { cn } from "@/src/shared/utils/cn";
import { Save, ArrowLeft, Sparkles, RotateCcw } from "lucide-react";
import { formsConfig } from "@/src/shared/constants/entityConfig";
import { safeToast } from "@/src/shared/utils/safeToast";
import { useTranslations } from "next-intl";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { useRouter } from "@/src/app/i18n/navigation";
import DynamicFormDialog from "@/src/shared/components/ui/dialogs/DynamicFormDialog";
import { relationshipConfigs } from "@/src/features/formGenerator/constants/generatFormConfig";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { useMergedTranslations } from "@/src/shared/utils/useMergedTranslations";

// Premium UI Components
import { GlassCard } from "@/src/shared/components/ui/GlassCard";
import { Badge } from "@/src/shared/components/ui/Badge";
import { Skeleton, SkeletonGroup } from "@/src/shared/components/ui/Skeleton";
import { EmptyState } from "@/src/shared/components/ui/EmptyState";
import { Form } from "@/src/shared/components/shadcn/ui/form";

export default function DynamicFormGenerator(props: DynamicFormProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [currentFieldName, setCurrentFieldName] = useState("");
  const { entity, id, setData, defaultValues } = props;
  const [loading, setLoading] = useState(false);
  const [fetchForginKey, setFetchForginKey] = useState(false);

  if (!entity) throw new Error("entity is required");

  const t = useMergedTranslations([
    "viewDetailsCard",
    entity,
    "dashboardLinks",
  ]);
  const form = formsConfig[entity];
  const alias = useMemo(
    () => (id ? form.partialUpdateAlias : form.createAlias),
    [id, form],
  );
  const fetchAlias = useMemo(() => form.retrieveAlias, [form]);
  const showResetButton = form.showResetButton ?? true;
  const showBackButton = form.showBackButton ?? true;
  const className = form.className || "";
  const relationConfig = relationshipConfigs[currentFieldName];
  const action = id ? "update" : "create";

  const submitText = useMemo(
    () => `${t(action)} ${t(entity)}`,
    [action, t, entity],
  );

  const successMessage = useMemo(
    () => `${t("success")} ${t(action)} ${t(entity)}`,
    [action, t, entity],
  );

  const errorMessage = useMemo(
    () => `${t("failed")} ${t(action)} ${t(entity)}`,
    [action, t, entity],
  );

  const title = useMemo(() => `${t(action)} ${t(entity)}`, [action, t, entity]);

  const userConfig: Record<string, any> = form.userConfig || {};
  const config = { ...defaultConfig, ...userConfig };

  // Guard against optional schemaName being undefined in some forms
  const schema = form.schemaName
    ? ((schemas as any)[form.schemaName] as z.ZodObject<any> | undefined)
    : undefined;
  const shape = (schema as any)?.shape || {};
  const effectiveIgnoredFields = useMemo(
    () => (id ? [...ignoredFields, "password"] : ignoredFields),
    [id],
  );

  const allFields = useMemo(
    () => Object.keys(shape).filter((f) => !effectiveIgnoredFields.includes(f)),
    [shape, effectiveIgnoredFields],
  );

  const visibleFields = config.fieldOrder || allFields;

  // Ensure alias and fetchAlias are always strings to satisfy type requirements
  const safeAlias: string = alias ?? "";
  const safeFetchAlias: string = fetchAlias ?? "";
  const canSubmit = Boolean(safeAlias);

  const formRequest = useApiForm({
    alias: safeAlias,
    defaultValues: defaultValues || {},
  });

  const fetchDefaultData = useApiForm({
    alias: safeFetchAlias,
    defaultValues: { id: id },
    enabled: !!id,
  });

  const onSubmit = async (data: any, e?: React.BaseSyntheticEvent) => {
    e?.preventDefault();
    const result = await formRequest.submitForm(data);
    if (result?.success) {
      safeToast(successMessage || "Submitted successfully", {
        type: "success",
      });

      if (setData) {
        setData(result.data);
        return;
      } else {
        formRequest?.reset(result.data);
        formRequest.setValue(currentFieldName, result.data.id);
      }
    } else if (errorMessage) {
      safeToast(errorMessage, { type: "error" });
    }
  };

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        setLoading(true);
        const result = await fetchDefaultData.query.refetch();
        formRequest?.reset(result.data);
        setLoading(false);
      };
      fetchData();
    }
  }, [id]);

  // 1. Loading State with Enhanced Skeleton
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl animate-pulse">
        <div className="bg-elevated/50 rounded-3xl p-8">
          <div className="space-y-4 mb-8">
            <Skeleton variant="title" width={300} />
            <Skeleton variant="text" width={200} />
          </div>
          <SkeletonGroup type="list-item" count={8} />
        </div>
      </div>
    );
  }

  // 2. Error State
  if (!schema) {
    return (
      <EmptyState
        type="error"
        title={t("thisFormDoesNotExist")}
        description={t("schemaNotFound")}
      />
    );
  }

  return (
    <div
      className={cn(
        className,
        "container mx-auto px-4 py-8 max-w-5xl animate-fade-in",
      )}
    >
      {/* Enhanced Header with Glassmorphism */}
      <div className="relative mb-6">
        {/* Gradient Background Glow */}
        <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 blur-2xl opacity-30 -z-10" />

        <GlassCard className="border-none overflow-visible" padding="sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Title Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <Sparkles className="w-7 h-7 text-primary" />
                  {title || form.schemaName}
                </h1>
                <Badge variant={id ? "warning" : "success"}>
                  {id ? t("editMode") : t("createMode")}
                </Badge>
              </div>

              <p className="text-sm text-secondary">
                {t(id ? "updateDescription" : "createDescription", {
                  entity: t(entity),
                }) ||
                  `Please fill in the details below to ${action} ${t(entity)}`}
              </p>
            </div>

            {/* Back Button */}
            {showBackButton && !setData && (
              <ActionButton
                variant="secondary"
                size="md"
                icon={<ArrowLeft size={20} />}
                onClick={() => router.back()}
                title={t("back")}
                className="rounded-xl"
              />
            )}
          </div>
        </GlassCard>
      </div>

      {/* Enhanced Form Card */}
      <div className="relative group">
        {/* Background Glow on Hover */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

        <GlassCard
          className="overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300"
          padding="none"
        >
          {/* Gradient Header Strip */}
          <div className="h-2 bg-gradient-to-r from-primary via-secondary to-primary animate-shimmer bg-[length:200%_100%]" />

          <div className="p-6 md:p-8">
            <Form {...formRequest}>
              <form
                onSubmit={formRequest.handleSubmit(onSubmit)}
                className={config.containerClasses}
              >
                {/* Form Fields */}
                {visibleFields.map((fieldName) => (
                  <RenderField
                    key={fieldName}
                    fieldName={fieldName}
                    fieldSchema={shape[fieldName]}
                    form={formRequest}
                    config={config}
                    mode={id ? "edit" : "create"}
                    setShowModal={(show: boolean) => {
                      if (show) setCurrentFieldName(fieldName);
                      setShowModal(show);
                    }}
                    fetchForginKey={fetchForginKey}
                    setFetchForginKey={setFetchForginKey}
                    t={t}
                  />
                ))}

                {/* Form Actions Footer */}
                <div className="col-span-1 md:col-span-2 flex flex-col sm:flex-row justify-end gap-3 pt-8 border-t border-border-main/50 mt-8">
                  {showResetButton && (
                    <ActionButton
                      type="button"
                      variant="ghost"
                      size="lg"
                      label={t("reset")}
                      onClick={() => formRequest.reset()}
                      disabled={formRequest.formState.isSubmitting}
                      icon={<RotateCcw size={20} />}
                      className="rounded-xl"
                    />
                  )}

                  <ActionButton
                    type="submit"
                    variant={id ? "warning" : "success"}
                    size="lg"
                    label={submitText || t("create")}
                    isLoading={formRequest.formState.isSubmitting}
                    disabled={!canSubmit}
                    icon={<Save size={20} />}
                    className="rounded-xl shadow-lg hover:shadow-xl min-w-[200px] sm:min-w-[240px]"
                    fullWidth={false}
                  />
                </div>
              </form>
            </Form>
          </div>
        </GlassCard>
      </div>

      {/* Modal Dialog */}
      {showModal && (
        <DynamicFormDialog
          entity={relationConfig?.entityName || ""}
          onClose={() => {
            setShowModal(false);
            setFetchForginKey(true);
          }}
        />
      )}
    </div>
  );
}

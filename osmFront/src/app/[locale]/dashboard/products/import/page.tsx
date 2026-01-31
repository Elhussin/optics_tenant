"use client";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { GlassCard } from "@/src/shared/components/ui/GlassCard";
import { Upload, FileText, CheckCircle, AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { formsConfig } from "@/src/features/formGenerator/constants/entityConfig";

export default function ProductImportPage() {
  const t = useTranslations("products.importCsv");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);

  const { submitForm, isBusy } = useApiForm({
    alias: formsConfig["products-import-csv"].createAlias,
    onSuccess: (data) => {
      setResult(data);
      toast.success(t("importSuccess"));
    },
    onError: (error) => {
      // Error is already formatted by useApiForm/handleServerErrors,
      // but we can extract more details if needed
      // If error structure matches { errors: [...] } we can set it
      console.error("Import Error:", error);
      // Fallback for visual display if result wasn't set by success
      if (error && typeof error === "object") {
        setResult({ errors: [error.message || t("unknownError")] });
      }
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null); // Reset result on new file
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    // Pass file directly to submitForm. useApiForm handles FormData conversion.
    await submitForm({ file });
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-8">
      {/* ... header ... */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          {t("importProducts")}
        </h1>
        <p className="text-muted-foreground">
          {t("importProductsDescription")}
        </p>
      </div>

      <GlassCard className="p-8 space-y-6">
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-primary/20 rounded-xl p-10 bg-primary/5 hover:bg-primary/10 transition-colors">
          <Upload className="w-12 h-12 text-primary mb-4" />
          <h3 className="text-xl font-semibold mb-2">{t("uploadCSV")}</h3>
          <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
            {t("uploadCSVDescription")}
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            title={t("uploadCSV")}
            onChange={handleFileChange}
            className="hidden"
            id="csv-upload"
          />

          <ActionButton
            onClick={triggerFileUpload}
            variant="secondary"
            icon={<FileText className="w-5 h-5" />}
            label={file ? file.name : t("selectFile")}
            type="button"
          />
        </div>

        {file && (
          <div className="flex justify-end">
            <ActionButton
              onClick={handleUpload}
              isLoading={isBusy}
              icon={<Upload className="w-5 h-5" />}
              label={t("startImport")}
            />
          </div>
        )}
      </GlassCard>

      {result && (
        <GlassCard className="p-6 space-y-4 animate-fade-in-up">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            {result.summary ? (
              <CheckCircle className="text-green-500" />
            ) : (
              <AlertTriangle className="text-red-500" />
            )}
            {t("importResult")}
          </h3>

          {result.summary && (
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {result.summary.created}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t("created")}
                </div>
              </div>
              <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {result.summary.updated_or_skipped}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t("skipped")}
                </div>
              </div>
              <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/20 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {result.summary.failed}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t("failed")}
                </div>
              </div>
            </div>
          )}

          {result.errors && result.errors.length > 0 && (
            <div className="bg-red-500/5 p-4 rounded-lg border border-red-500/20 max-h-60 overflow-y-auto">
              <h4 className="font-medium text-red-600 mb-2">{t("errorLog")}</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-red-600/80">
                {result.errors.map((error: string, idx: number) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </GlassCard>
      )}
    </div>
  );
}

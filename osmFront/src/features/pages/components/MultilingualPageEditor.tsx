"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import RichTextEditor from "./RichTextEditor";
import {
  CreatePageData,
  Language,
  PageTranslation,
  LANGUAGES,
} from "@/src/features/pages/types";
import { safeToast } from "@/src/shared/utils/safeToast";
import { defaultPublicPages } from "@/src/shared/constants/defaultPublicPages";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { getBaseUrl } from "@/src/shared/utils/getBaseUrl";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { GlassCard } from "@/src/shared/components/ui/GlassCard";
import { Badge } from "@/src/shared/components/ui/Badge";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { Skeleton, SkeletonGroup } from "@/src/shared/components/ui/Skeleton";
import { cn } from "@/src/shared/utils/cn";
import {
  Save,
  ArrowLeft,
  Globe,
  Check,
  AlertCircle,
  Link as LinkIcon,
  FileText,
  Search,
  Hash,
  Eye,
  EyeOff,
} from "lucide-react";
interface MultilingualPageEditorProps {
  pageId?: string;
  defaultPage?: string | null;
}
type FormError = {
  message: string;
};

const MultilingualPageEditor: React.FC<MultilingualPageEditorProps> = ({
  pageId,
  defaultPage,
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState<Language>("en");
  const t = useTranslations("MultilingualPageEditor");
  const locale = useLocale();
  const [formErrors, setFormErrors] = useState<{ [key: string]: FormError }>(
    {}
  );

  const [formData, setFormData] = useState<CreatePageData | null>(null);

  const pageRequest = useApiForm({
    alias: `users_pages_retrieve`,
    defaultValues: { id: pageId },
    enabled: !!pageId,
  });
  const createRequest = useApiForm({ alias: `users_pages_create` });
  const updateRequest = useApiForm({
    alias: `users_pages_partial_update`,
    onSuccess: () => {
      safeToast(t("PageUpdated"), { type: "success" });
      loadPage();
    },
    onError: () => {
      safeToast(t("errorUpdatingPage"), { type: "error" });
    },
  });

  // دالة لتوليد slug من العنوان
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  // تحديث ترجمة محددة
  const updateTranslation = (
    language: Language,
    field: keyof PageTranslation,
    value: string
  ) => {
    setFormData((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        translations: prev.translations.map((t) => {
          if (t.language === language) {
            const updated = { ...t, [field]: value };
            if (field === "title") {
              updated.seo_title = value;
            }
            return updated;
          }
          return t;
        }),
      };
    });
  };

  // الحصول على الترجمة الحالية للغة النشطة
  const getCurrentTranslation = () => {
    if (!formData) return null;
    return (
      formData.translations.find((t) => t.language === activeLanguage) ||
      formData.translations[0]
    );
  };

  const getTranslationCompleteness = (language: Language) => {
    if (!formData) return 0;

    const translation = formData.translations.find(
      (t) => t.language === language
    );
    if (!translation) return 0;

    const fields = ["title", "content", "seo_title"];
    const completedFields = fields.filter((field) =>
      translation[field as keyof PageTranslation]?.toString().trim()
    );
    return Math.round((completedFields.length / fields.length) * 100);
  };

  useEffect(() => {
    if (defaultPage) {
      const def = defaultPublicPages[defaultPage];
      if (def) {
        setFormData({
          default_language: def.default_language || "en",
          translations: Object.entries(LANGUAGES).map(([code]) => {
            const existing = def.translations.find((t) => t.language === code);
            return (
              existing || {
                language: code as Language,
                title: "",
                content: "",
                seo_title: "",
                meta_description: "",
                meta_keywords: "",
              }
            );
          }),
          is_published: def.is_published || false,
          slug: def.slug || "",
        });
      }
    } else if (!pageId) {
      setFormData({
        default_language: "en",
        translations: Object.entries(LANGUAGES).map(([code]) => ({
          language: code as Language,
          title: "",
          content: "",
          seo_title: "",
          meta_description: "",
          meta_keywords: "",
        })),
        is_published: false,
        slug: "",
      });
    }
  }, [pageId, defaultPage]);

  const loadPage = useCallback(async () => {
    try {
      setLoading(true);
      const res = await pageRequest.query.refetch();
      const page = res.data;

      // تأكد من وجود جميع اللغات المطلوبة
      const translations = Object.entries(LANGUAGES).map(([code]) => {
        const existing = page.translations.find(
          (t: PageTranslation) => t.language === code
        );
        return (
          existing || {
            language: code as Language,
            title: "",
            content: "",
            seo_title: "",
            meta_description: "",
            meta_keywords: "",
          }
        );
      });

      setFormData({
        ...page,
        translations,
      });
      setActiveLanguage(page.default_language);
    } catch (error) {
      safeToast(t("errorLoading"), { type: "error" });
    } finally {
      setLoading(false);
    }
  }, [pageId]);

  useEffect(() => {
    if (pageId) {
      loadPage();
    }
  }, [pageId]);

  const handleSave = async () => {
    try {
      setSaving(true);

      if (!formData) {
        safeToast(t("errorGetFormData"), { type: "error" });
        return;
      }
      // await updatePrescriptionApi.mutation.mutateAsync(data);
      // التحقق من وجود عنوان للغة الافتراضية
      const defaultTranslation = formData.translations.find(
        (t) => t.language === formData.default_language
      );
      if (!defaultTranslation?.title.trim()) {
        safeToast(
          `${t("pleaseProvideTitle")} (${
            LANGUAGES[formData.default_language].name
          })`,
          { type: "error" }
        );
        return;
      }

      // توليد slug للصفحات الجديدة فقط
      const finalFormData = { ...formData };
      if (!pageId && !finalFormData.slug.trim()) {
        finalFormData.slug = generateSlug(defaultTranslation.title);
      }

      let result;
      if (pageId) {
        result = await updateRequest.mutation.mutateAsync({
          id: pageId,
          formData: finalFormData,
        });
        setFormData(result.data);
      } else {
        result = await createRequest.submitForm(finalFormData);
        if (result?.success) {
          safeToast(t("PageCreated"), { type: "success" });
        } else {
          setFormErrors(createRequest.errors || {});
          safeToast(t("errorCreatingPage"), { type: "error" });
        }
      }
    } catch (error) {
      safeToast(t("errorSavingPage"), { type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const baseUrl = getBaseUrl();

  // Enhanced Loading State
  if (loading || !formData) {
    return (
      <div className="max-w-6xl mx-auto p-6 animate-fade-in">
        <GlassCard padding="lg">
          <div className="space-y-6">
            <Skeleton variant="title" width="40%" height={32} />
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} variant="button" width={120} height={40} />
              ))}
            </div>
            <Skeleton variant="text" width="100%" height={44} />
            <SkeletonGroup type="list-item" count={5} />
          </div>
        </GlassCard>
      </div>
    );
  }

  const currentTranslation = getCurrentTranslation();
  const currentLangInfo = LANGUAGES[activeLanguage];

  if (!currentTranslation) {
    return <div>{t("noTranslationFound")}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 animate-fade-in">
      {/* Background Glow */}
      <div className="relative group">
        <div className="absolute -inset-2 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

        <GlassCard
          className="overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300"
          padding="none"
        >
          {/* Gradient Header Strip */}
          <div className="h-1.5 bg-gradient-to-r from-primary via-secondary to-primary animate-shimmer bg-[length:200%_100%]" />

          {/* Header */}
          <div className="glass border-b border-border-main/50 p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-main flex items-center gap-3">
                <FileText className="w-8 h-8 text-primary" />
                {pageId ? t("editPage") : t("createNewPage")}
              </h1>

              {/* Default Language Selector */}
              <div className="glass px-4 py-2 rounded-xl border border-border-main shadow-soft flex items-center gap-3">
                <Globe size={16} className="text-primary" />
                <label className="text-sm font-medium text-secondary">
                  {t("defaultLanguage")}:
                </label>
                <select
                  value={formData.default_language}
                  onChange={(e) =>
                    setFormData((prev) =>
                      prev
                        ? {
                            ...prev,
                            default_language: e.target.value as Language,
                          }
                        : prev
                    )
                  }
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium",
                    "bg-elevated border border-border-main",
                    "focus:outline-none focus:ring-2 focus:ring-primary/20",
                    "cursor-pointer transition-all"
                  )}
                >
                  {Object.entries(LANGUAGES).map(([code, lang]) => (
                    <option className="bg-elevated" key={code} value={code}>
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Language Tabs */}
            <div className="flex gap-2 flex-wrap">
              {Object.entries(LANGUAGES).map(([code, lang]) => {
                const completeness = getTranslationCompleteness(
                  code as Language
                );
                const isActive = activeLanguage === code;
                return (
                  <button
                    key={code}
                    onClick={() => setActiveLanguage(code as Language)}
                    className={cn(
                      "px-4 py-3 rounded-xl transition-all duration-200",
                      "border-2 hover:scale-105 active:scale-95",
                      isActive
                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/30"
                        : "bg-elevated hover:bg-elevated/80 text-secondary border-border-main"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{lang.flag}</span>
                      <span className="font-semibold">{lang.name}</span>
                      {formData.default_language === code && (
                        <Badge variant="success" size="sm">
                          <Check size={10} />
                          {t("default")}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-16 h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-white transition-all duration-300"
                          style={{ width: `${completeness}%` }}
                        />
                      </div>
                      <span className="text-xs opacity-90">
                        {completeness}%
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Page URL Field */}
            <div className="mt-6 space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-main">
                <LinkIcon size={16} className="text-primary" />
                {t("pageURL")}
              </label>
              <p className="text-xs text-secondary">{t("pageURLDesc")}</p>
              <div className="relative">
                <input
                  type="text"
                  value={pageId ? `${baseUrl}/${formData.slug}` : formData.slug}
                  onChange={(e) => {
                    if (!pageId) {
                      setFormData((prev) =>
                        prev ? { ...prev, slug: e.target.value } : prev
                      );
                    }
                  }}
                  disabled={!!pageId}
                  className={cn(
                    "w-full px-4 py-3 rounded-xl transition-all duration-200",
                    "border-2 bg-white dark:bg-gray-800",
                    "focus:outline-none focus:ring-2 focus:ring-offset-1",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    formErrors?.slug
                      ? "border-danger/50 focus:border-danger focus:ring-danger/20"
                      : "border-border-main focus:border-primary focus:ring-primary/20"
                  )}
                  placeholder={t("pageURLDesc")}
                  dir={currentLangInfo.dir}
                />
                {formErrors?.slug?.message && (
                  <p className="text-sm text-danger flex items-center gap-1.5 mt-2 animate-fade-in">
                    <AlertCircle size={14} />
                    {formErrors.slug.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Content for active language */}
          <div
            className={`p-6 ${locale === "ar" ? "text-right" : "text-left"}`}
            dir={locale === "ar" ? "rtl" : "ltr"}
          >
            <div className="space-y-6">
              {/* Page Title */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-main">
                  <FileText size={16} className="text-primary" />
                  {t("pageTitle")} ({currentLangInfo.name})
                </label>
                <input
                  type="text"
                  value={currentTranslation.title}
                  onChange={(e) =>
                    updateTranslation(activeLanguage, "title", e.target.value)
                  }
                  className={cn(
                    "w-full px-4 py-3 rounded-xl transition-all duration-200",
                    "border-2 bg-white dark:bg-gray-800",
                    "focus:outline-none focus:ring-2 focus:ring-offset-1",
                    formErrors?.title
                      ? "border-danger/50 focus:border-danger focus:ring-danger/20"
                      : "border-border-main focus:border-primary focus:ring-primary/20"
                  )}
                  placeholder={`${t("pageTitleDesc")} ${currentLangInfo.name}`}
                  dir={currentLangInfo.dir}
                />
                {formErrors?.title && (
                  <p className="text-sm text-danger flex items-center gap-1.5 animate-fade-in">
                    <AlertCircle size={14} />
                    {formErrors.title.message as string}
                  </p>
                )}
              </div>

              {/* Content Editor */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-main">
                  <FileText size={16} className="text-primary" />
                  {t("content")} ({currentLangInfo.name})
                </label>
                <RichTextEditor
                  content={currentTranslation.content}
                  onChange={(content) =>
                    updateTranslation(activeLanguage, "content", content)
                  }
                  language={activeLanguage}
                  placeholder={`${t("contentDesc")} ${currentLangInfo.name}...`}
                />
                {formErrors?.content && (
                  <p className="text-sm text-danger flex items-center gap-1.5 animate-fade-in">
                    <AlertCircle size={14} />
                    {formErrors.content.message as string}
                  </p>
                )}
              </div>

              {/* SEO Section */}
              <div className="pt-6 border-t border-border-main/50">
                <h3 className="text-xl font-bold text-main mb-4 flex items-center gap-2">
                  <Search size={20} className="text-primary" />
                  {t("seoSettings")} ({currentLangInfo.name})
                </h3>

                <div className="space-y-4">
                  {/* SEO Title */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-main">
                      {t("seoTitle")}
                    </label>
                    <input
                      type="text"
                      value={currentTranslation.seo_title}
                      onChange={(e) =>
                        updateTranslation(
                          activeLanguage,
                          "seo_title",
                          e.target.value
                        )
                      }
                      className={cn(
                        "w-full px-4 py-3 rounded-xl transition-all duration-200",
                        "border-2 bg-white dark:bg-gray-800",
                        "focus:outline-none focus:ring-2 focus:ring-offset-1",
                        "border-border-main focus:border-primary focus:ring-primary/20"
                      )}
                      placeholder={`${t("seoTitleDesc")} ${
                        currentLangInfo.name
                      }`}
                      dir={currentLangInfo.dir}
                    />
                  </div>

                  {/* Meta Description */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-main">
                      {t("metaDescription")}
                    </label>
                    <textarea
                      value={currentTranslation.meta_description}
                      onChange={(e) =>
                        updateTranslation(
                          activeLanguage,
                          "meta_description",
                          e.target.value
                        )
                      }
                      rows={3}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl transition-all duration-200",
                        "border-2 bg-white dark:bg-gray-800",
                        "focus:outline-none focus:ring-2 focus:ring-offset-1",
                        "border-border-main focus:border-primary focus:ring-primary/20"
                      )}
                      placeholder={t("metaDescription")}
                      dir={currentLangInfo.dir}
                    />
                  </div>

                  {/* Meta Keywords */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-main flex items-center gap-2">
                      <Hash size={14} className="text-primary" />
                      {t("metaKeywords")}
                    </label>
                    <input
                      type="text"
                      value={currentTranslation.meta_keywords}
                      onChange={(e) =>
                        updateTranslation(
                          activeLanguage,
                          "meta_keywords",
                          e.target.value
                        )
                      }
                      className={cn(
                        "w-full px-4 py-3 rounded-xl transition-all duration-200",
                        "border-2 bg-white dark:bg-gray-800",
                        "focus:outline-none focus:ring-2 focus:ring-offset-1",
                        "border-border-main focus:border-primary focus:ring-primary/20"
                      )}
                      placeholder="keyword1, keyword2, keyword3"
                      dir={currentLangInfo.dir}
                    />
                  </div>
                </div>
              </div>

              {/* Publication Settings */}
              <div className="pt-6 border-t border-border-main/50">
                <div
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl",
                    "border-2 transition-all duration-200",
                    formData.is_published
                      ? "border-success/30 bg-success/5"
                      : "border-border-main bg-elevated/30"
                  )}
                >
                  <input
                    type="checkbox"
                    id="is_published"
                    checked={formData.is_published}
                    onChange={(e) =>
                      setFormData((prev) =>
                        prev
                          ? { ...prev, is_published: e.target.checked }
                          : prev
                      )
                    }
                    className="h-5 w-5 text-primary focus:ring-2 focus:ring-primary/20 rounded cursor-pointer"
                  />
                  <label
                    htmlFor="is_published"
                    className="text-sm font-semibold text-main flex items-center gap-2 cursor-pointer flex-1"
                  >
                    {formData.is_published ? (
                      <Eye size={16} className="text-success" />
                    ) : (
                      <EyeOff size={16} className="text-secondary" />
                    )}
                    {t("publish")}
                  </label>
                  {formData.is_published && (
                    <Badge variant="success" size="sm">
                      <Check size={12} />
                      Published
                    </Badge>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-6 border-t border-border-main/50">
                <ActionButton
                  onClick={() => router.back()}
                  variant="ghost"
                  size="lg"
                  icon={<ArrowLeft size={20} />}
                  label={t("cancel")}
                  className="rounded-xl"
                />

                <ActionButton
                  onClick={handleSave}
                  disabled={saving || !currentTranslation.title.trim()}
                  variant={pageId ? "warning" : "success"}
                  size="lg"
                  icon={<Save size={20} />}
                  label={
                    saving
                      ? `${t("save")}...`
                      : pageId
                      ? t("update")
                      : t("create")
                  }
                  isLoading={saving}
                  className="rounded-xl shadow-lg hover:shadow-xl min-w-[200px]"
                />
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default MultilingualPageEditor;

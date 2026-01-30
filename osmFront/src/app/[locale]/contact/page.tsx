"use client";
import { contact } from "@/src/shared/constants/conteact";
import { socialLinks } from "@/src/shared/constants/url";
import { useTranslations } from "next-intl";
import { Link } from "@/src/app/i18n/navigation";
import { motion } from "framer-motion";
import { useUser } from "@/src/features/auth/hooks/UserContext";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  Sparkles,
  AlertCircle,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  MessageCircle,
  Video,
} from "lucide-react";
import { GlassCard } from "@/src/shared/components/ui/GlassCard";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { safeToast } from "@/src/shared/utils/safeToast";
import { cn } from "@/src/shared/utils/cn";
import { useTenant } from "@/src/shared/contexts/TenantContext";
import { formsConfig } from "@/src/features/formGenerator/constants/entityConfig";
export default function ContactPage() {
  const t = useTranslations("contact");
  const { user } = useUser();
  const { tenantSettings, loading } = useTenant();

  /* Form Logic */
  const { handleSubmit, submitForm, errors, isBusy, register, reset } =
    useApiForm({ alias: formsConfig["contact-us"].createAlias! });

  const onSubmit = async (data: any) => {
    const result = await submitForm(data);
    console.log("result", result);
    if (result?.success) {
      safeToast(t("successMessage"), { type: "success" });
      reset(); // Clear form on success
    } else {
      safeToast(t("errorMessage"), { type: "error" });
    }
  };
  if (loading) return "....";
  console.log("tenantSettings", tenantSettings);
  // Function to map dynamic settings to UI
  const getSocialLinks = () => {
    if (!tenantSettings || loading) return socialLinks;

    const links = [];
    if (tenantSettings.facebook)
      links.push({
        name: "Facebook",
        url: tenantSettings.facebook,
        icon: Facebook,
      });
    if (tenantSettings.twitter)
      links.push({
        name: "Twitter",
        url: tenantSettings.twitter,
        icon: Twitter,
      });
    if (tenantSettings.instagram)
      links.push({
        name: "Instagram",
        url: tenantSettings.instagram,
        icon: Instagram,
      });
    if (tenantSettings.linkedin)
      links.push({
        name: "LinkedIn",
        url: tenantSettings.linkedin,
        icon: Linkedin,
      });
    if (tenantSettings.whatsapp)
      links.push({
        name: "WhatsApp",
        url: `https://wa.me/${tenantSettings.whatsapp}`,
        icon: MessageCircle,
      });
    if (tenantSettings.tiktok)
      links.push({ name: "TikTok", url: tenantSettings.tiktok, icon: Video });

    return links.length > 0 ? links : socialLinks;
  };

  const activeSocialLinks = getSocialLinks();

  // Address logic
  const addressParts = [
    tenantSettings?.address,
    tenantSettings?.city,
    tenantSettings?.state,
    tenantSettings?.country,
  ].filter(Boolean);

  const displayAddress =
    addressParts.length > 0 ? addressParts.join(", ") : contact.address;

  return (
    <div className="min-h-screen bg-surface py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto text-center mb-16"
      >
        <span className="text-primary font-semibold tracking-wider uppercase text-sm flex items-center justify-center gap-2">
          <MessageSquare size={16} />
          {t("subtitle") || "Contact Support"}
        </span>
        <h1 className="mt-4 text-4xl font-bold text-main sm:text-5xl flex items-center justify-center gap-3">
          <Sparkles className="w-10 h-10 text-primary" />
          {t("title")}
        </h1>
        <p className="mt-4 text-lg text-secondary max-w-2xl mx-auto">
          {t("description")}
        </p>
      </motion.div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        {/* Contact Information Column */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Contact Info Card */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

            <GlassCard className="shadow-xl" padding="lg">
              <h3 className="text-xl font-semibold text-main mb-6 flex items-center gap-2">
                <Mail className="text-primary" size={20} />
                {t("contactInfo") || "Contact Information"}
              </h3>

              <div className="space-y-4">
                {/* Email */}
                <div className="flex items-start gap-4 p-3 rounded-xl bg-elevated border border-border-main/30 hover:border-primary/50 transition-colors">
                  <div className="bg-primary/10 p-3 rounded-lg text-primary shrink-0">
                    <Mail size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-main">{t("email")}</p>
                    <a
                      href={`mailto:${tenantSettings?.email || contact.email}`}
                      className="text-secondary hover:text-primary transition truncate block"
                    >
                      {tenantSettings?.email || contact.email}
                    </a>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4 p-3 rounded-xl bg-elevated border border-border-main/30 hover:border-success/50 transition-colors">
                  <div className="bg-success/10 p-3 rounded-lg text-success shrink-0">
                    <Phone size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-main">{t("phone")}</p>
                    <a
                      href={`tel:${tenantSettings?.phone || contact.phone}`}
                      className="text-secondary hover:text-success transition"
                    >
                      {tenantSettings?.phone || contact.phone}
                    </a>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-4 p-3 rounded-xl bg-elevated border border-border-main/30 hover:border-secondary/50 transition-colors">
                  <div className="bg-secondary/10 p-3 rounded-lg text-secondary shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-main">{t("address")}</p>
                    <p className="text-secondary">{displayAddress}</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Social Links Card */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

            <GlassCard className="shadow-xl" padding="lg">
              <h3 className="text-xl font-semibold text-main mb-6">
                {t("followUs") || "Follow Us"}
              </h3>
              <div className="flex flex-wrap gap-3">
                {activeSocialLinks.map(({ url, icon: Icon, name }) => (
                  <Link
                    key={name}
                    href={url}
                    target="_blank"
                    title={name}
                    className="w-12 h-12 flex items-center justify-center rounded-xl bg-elevated border border-border-main text-secondary hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 hover:scale-110 active:scale-95"
                  >
                    <Icon size={20} />
                  </Link>
                ))}
              </div>
            </GlassCard>
          </div>
        </motion.div>

        {/* Contact Form Column */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

            <GlassCard className="shadow-xl" padding="none">
              {/* Gradient strip */}
              <div className="h-1.5 bg-gradient-to-r from-primary via-secondary to-primary animate-shimmer bg-[length:200%_100%]" />

              <div className="p-8">
                {/* Form Header */}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-main flex items-center gap-2">
                    <Send className="text-primary" size={24} />
                    {t("sendMessage") || "Send us a Message"}
                  </h3>
                  <p className="text-secondary mt-2">
                    {t("formDescription") ||
                      "Have a question or feedback? Fill out the form below and we'll get back to you shortly."}
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  {/* Name & Email Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Name */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-main ml-1">
                        {t("name") || t("fullName")}
                      </label>
                      <input
                        {...register("name")}
                        type="text"
                        className={cn(
                          "w-full px-4 py-3 rounded-xl transition-all duration-200",
                          " bg-white dark:bg-gray-800",
                          "focus:outline-none focus:ring-2 focus:ring-offset-1",
                          errors.name
                            ? "border-danger/50 focus:border-danger focus:ring-danger/20"
                            : "border-border-main focus:border-primary focus:ring-primary/20",
                        )}
                        placeholder="John Doe"
                      />
                      {errors.name && (
                        <p className="text-sm text-danger flex items-center gap-1.5 ml-1 animate-fade-in">
                          <AlertCircle size={14} />
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-main ml-1">
                        {t("phone")}
                      </label>
                      <input
                        {...register("phone")}
                        type="text"
                        className={cn(
                          "w-full px-4 py-3 rounded-xl transition-all duration-200",
                          " bg-white dark:bg-gray-800",
                          "focus:outline-none focus:ring-2 focus:ring-offset-1",
                          errors.phone
                            ? "border-danger/50 focus:border-danger focus:ring-danger/20"
                            : "border-border-main focus:border-primary focus:ring-primary/20",
                        )}
                        placeholder="01000000000"
                      />
                      {errors.phone && (
                        <p className="text-sm text-danger flex items-center gap-1.5 ml-1 animate-fade-in">
                          <AlertCircle size={14} />
                          {errors.phone.message}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-main ml-1">
                        {t("email")}
                      </label>
                      <input
                        {...register("email")}
                        type="email"
                        className={cn(
                          "w-full px-4 py-3 rounded-xl transition-all duration-200",
                          " bg-white dark:bg-gray-800",
                          "focus:outline-none focus:ring-2 focus:ring-offset-1",
                          errors.email
                            ? "border-danger/50 focus:border-danger focus:ring-danger/20"
                            : "border-border-main focus:border-primary focus:ring-primary/20",
                        )}
                        placeholder="john@example.com"
                      />
                      {errors.email && (
                        <p className="text-sm text-danger flex items-center gap-1.5 ml-1 animate-fade-in">
                          <AlertCircle size={14} />
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-main ml-1 flex items-center gap-2">
                      <MessageSquare size={14} className="text-primary" />
                      {t("subject")}
                    </label>
                    <input
                      {...register("subject")}
                      type="text"
                      className={cn(
                        "w-full px-4 py-3 rounded-xl transition-all duration-200",
                        " bg-white dark:bg-gray-800",
                        "focus:outline-none focus:ring-2 focus:ring-offset-1",
                        errors.subject
                          ? "border-danger/50 focus:border-danger focus:ring-danger/20"
                          : "border-border-main focus:border-primary focus:ring-primary/20",
                      )}
                      placeholder={t("subjectPlaceholder")}
                    />
                    {errors.subject && (
                      <p className="text-sm text-danger flex items-center gap-1.5 ml-1 animate-fade-in">
                        <AlertCircle size={14} />
                        {errors.subject.message}
                      </p>
                    )}
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-main ml-1">
                      {t("message")}
                    </label>
                    <textarea
                      {...register("message")}
                      rows={4}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl transition-all duration-200",
                        " bg-white dark:bg-gray-800",
                        "focus:outline-none focus:ring-2 focus:ring-offset-1 resize-none",
                        errors.message
                          ? "border-danger/50 focus:border-danger focus:ring-danger/20"
                          : "border-border-main focus:border-primary focus:ring-primary/20",
                      )}
                      placeholder={t("messagePlaceholder")}
                    />
                    {errors.message && (
                      <p className="text-sm text-danger flex items-center gap-1.5 ml-1 animate-fade-in">
                        <AlertCircle size={14} />
                        {errors.message.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <ActionButton
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isBusy}
                    disabled={isBusy}
                    icon={<Send size={18} />}
                    label={t("submit") || "Send Message"}
                    className="w-full rounded-xl shadow-lg hover:shadow-xl"
                  />
                </form>
              </div>
            </GlassCard>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

"use client";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/src/features/auth/hooks/UserContext";
import PricingPlans from "@/src/features/payment/components/PricingPlans";
import {
  Users,
  Store,
  CreditCard,
  Calendar,
  AlertTriangle,
  Check,
  Settings,
  UserCircle,
  Mail,
  Shield,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { FetchData } from "@/src/shared/api/api";
import { motion } from "framer-motion";
import { GlassCard } from "@/src/shared/components/ui/GlassCard";
import { Badge } from "@/src/shared/components/ui/Badge";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { cn } from "@/src/shared/utils/cn";
import { EmptyState } from "@/src/shared/components/ui/EmptyState";

const fetcher = (url: string) => FetchData({ url });

export default function Profile() {
  const { user } = useUser();
  const t = useTranslations("profilePage");

  // Check if user has TenantOwner role (supports both single object and multiple roles array)
  const isOwner = useMemo(() => {
    const roles = user?.roles || [];
    const primaryRoleName = user?.role?.name;

    // Normalize everything into an array of names safely
    const allRoleNames: string[] = [];

    if (primaryRoleName) allRoleNames.push(primaryRoleName);

    roles.forEach((r: any) => {
      if (typeof r === "string") {
        allRoleNames.push(r);
      } else if (r && typeof r.name === "string") {
        allRoleNames.push(r.name);
      }
    });

    return allRoleNames.some((name) => name.toLowerCase() === "tenantowner");
  }, [user]);

  const shouldFetch = isOwner && !!user?.client;

  const {
    data: clientData,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["tenant_client", user?.client],
    queryFn: () => fetcher(`/api/tenants/clients/${user.client}`),
    enabled: !!shouldFetch,
    refetchOnWindowFocus: false,
    staleTime: 60000,
  });

  const { daysLeft, statusVariant, progressWidth, statusText, statusIcon } =
    useMemo(() => {
      if (!clientData)
        return {
          daysLeft: null,
          statusVariant: "neutral" as const,
          progressWidth: "0%",
          statusText: "",
          statusIcon: null,
        };

      const today = new Date();
      const paidUntil = new Date(clientData.paid_until);
      const timeDiff = paidUntil.getTime() - today.getTime();
      const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

      let variant: "success" | "warning" | "danger" | "info" = "success";
      let text = t("subscriptionActive");
      let icon = <Check size={14} />;

      if (clientData.plans?.name === "trial") {
        variant = "info";
        text = "Trial Period";
        icon = <Calendar size={14} />;
      } else if (days <= 0) {
        variant = "danger";
        text = t("subscriptionExpired");
        icon = <AlertTriangle size={14} />;
      } else if (days <= 7) {
        variant = "warning";
        text = t("subscriptionAboutToExpire");
        icon = <AlertTriangle size={14} />;
      }

      const widthPercentage = days > 0 ? Math.min((days / 30) * 100, 100) : 0;
      const width = `${widthPercentage}%`;

      return {
        daysLeft: days,
        statusVariant: variant,
        progressWidth: width,
        statusText: text,
        statusIcon: icon,
      };
    }, [clientData, t]);

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <EmptyState
          type="default"
          title={t("failedToLoad")}
          description="Unable to load profile data"
        />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border-main/50"
      >
        <div>
          <h1 className="text-3xl font-bold text-main flex items-center gap-3">
            <span className="bg-primary/10 p-2 rounded-xl text-primary">
              <UserCircle size={32} />
            </span>
            {t("welcomeMessage")}, {user.username}
          </h1>
          <p className="text-secondary mt-1 ml-14">
            {t("welcomeMessageDescription")}
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: User Profile */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="relative group">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

            <GlassCard
              className="overflow-hidden sticky top-6 shadow-xl"
              padding="none"
            >
              {/* Gradient header */}
              <div className="h-1.5 bg-gradient-to-r from-primary via-secondary to-primary animate-shimmer bg-[length:200%_100%]" />
              <div className="bg-gradient-to-r from-primary to-secondary h-24"></div>

              <div className="px-6 pb-6 relative">
                {/* Avatar */}
                <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-full border-4 border-white dark:border-gray-800 -mt-10 flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold text-primary">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* User info */}
                <div className="mt-3">
                  <h2 className="text-xl font-bold text-main capitalize">
                    {user.username}
                  </h2>
                  <Badge variant="primary" size="sm" className="mt-2">
                    <Shield size={12} />
                    {user?.role?.name}
                  </Badge>
                </div>

                {/* Details */}
                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3 text-secondary p-3 bg-elevated rounded-xl border border-border-main/30">
                    <Mail size={18} className="text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-secondary font-medium uppercase">
                        {t("email")}
                      </p>
                      <p className="text-sm font-medium text-main truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {isOwner && (
                    <div className="flex items-center gap-3 text-secondary p-3 bg-elevated rounded-xl border border-border-main/30">
                      <Store size={18} className="text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-secondary font-medium uppercase">
                          {t("clientId")}
                        </p>
                        <p className="text-sm font-medium text-main truncate">
                          {user.client}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Settings button */}
                {isOwner && (
                  <div className="mt-6 pt-6 border-t border-border-main/30">
                    <Link href="/dashboard/tenant-settings">
                      <ActionButton
                        variant="ghost"
                        size="md"
                        icon={<Settings size={16} />}
                        label={t("tenantSettings")}
                        className="w-full rounded-xl"
                      />
                    </Link>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
        </motion.div>

        {/* Right Column: Subscription & Stats */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 space-y-6"
        >
          {isOwner && (
            <div className="relative group">
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

              <GlassCard className="shadow-xl" padding="none">
                {/* Gradient strip */}
                <div className="h-1.5 bg-gradient-to-r from-primary via-secondary to-primary animate-shimmer bg-[length:200%_100%]" />

                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-main flex items-center gap-2">
                      <CreditCard size={20} className="text-primary" />
                      {t("clientInformation")}
                    </h3>
                    {clientData && (
                      <Badge variant={statusVariant || "neutral"} size="sm">
                        {statusIcon}
                        {statusText}
                      </Badge>
                    )}
                  </div>

                  {isLoading ? (
                    <div className="space-y-4 animate-pulse">
                      <div className="h-4 bg-elevated rounded w-3/4"></div>
                      <div className="h-4 bg-elevated rounded w-1/2"></div>
                      <div className="h-20 bg-elevated rounded-xl"></div>
                    </div>
                  ) : clientData ? (
                    <>
                      {/* Stats Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Users size={16} className="text-primary" />
                            <p className="text-sm text-primary font-medium">
                              {t("maxUsers")}
                            </p>
                          </div>
                          <p className="text-2xl font-bold text-main">
                            {clientData.max_users}
                          </p>
                        </div>

                        <div className="p-4 rounded-xl bg-secondary/5 border border-secondary/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Store size={16} className="text-secondary" />
                            <p className="text-sm text-secondary font-medium">
                              {t("maxProducts")}
                            </p>
                          </div>
                          <p className="text-2xl font-bold text-main">
                            {clientData.max_products}
                          </p>
                        </div>

                        <div className="p-4 rounded-xl bg-info/5 border border-info/20">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp size={16} className="text-info" />
                            <p className="text-sm text-info font-medium">
                              {t("maxBranches")}
                            </p>
                          </div>
                          <p className="text-2xl font-bold text-main">
                            {clientData.max_branches}
                          </p>
                        </div>
                      </div>

                      {/* Subscription Details */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-elevated rounded-xl mb-6 border border-border-main/30">
                        <div className="mb-4 sm:mb-0">
                          <p className="text-sm text-secondary font-medium uppercase mb-1">
                            {t("plan")}
                          </p>
                          <p className="text-lg font-bold text-main capitalize flex items-center gap-2">
                            <Sparkles size={16} className="text-primary" />
                            {clientData.plans?.name}
                          </p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-sm text-secondary font-medium uppercase mb-1">
                            {t("paidUntil")}
                          </p>
                          <p className="text-lg font-bold text-main flex items-center sm:justify-end gap-2">
                            <Calendar size={16} className="text-primary" />
                            {new Date(
                              clientData.paid_until,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                          <Badge variant="primary" size="sm">
                            {t("subscriptionCycle")}
                          </Badge>
                          <span className="text-xs font-semibold text-secondary">
                            {daysLeft && daysLeft > 0
                              ? `${daysLeft} days left`
                              : "Expired"}
                          </span>
                        </div>
                        <div className="overflow-hidden h-2.5 mb-4 rounded-full bg-elevated border border-border-main/30">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: progressWidth }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            style={{ width: progressWidth }}
                            className={cn(
                              "h-full rounded-full transition-all",
                              daysLeft && daysLeft <= 7
                                ? "bg-danger"
                                : "bg-success",
                            )}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <EmptyState
                      type="default"
                      title={t("noClientData")}
                      description="No subscription data available"
                    />
                  )}
                </div>
              </GlassCard>
            </div>
          )}

          {/* Pricing Section */}
          {isOwner &&
            clientData &&
            (clientData.plans?.name === "trial" ||
              (daysLeft !== null && daysLeft <= 15)) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="relative group">
                  {/* Glow effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

                  <GlassCard
                    className="shadow-xl bg-gradient-to-br from-primary/5 to-secondary/5"
                    padding="lg"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <span className="p-3 bg-primary/10 rounded-xl">
                        <CreditCard size={24} className="text-primary" />
                      </span>
                      <div>
                        <h3 className="text-lg font-bold text-main">
                          {t("upgradePlan")}
                        </h3>
                        <p className="text-sm text-secondary">
                          {t("unlockMoreFeatures")}
                        </p>
                      </div>
                    </div>
                    <PricingPlans clientId={String(clientData.uuid)} />
                  </GlassCard>
                </div>
              </motion.div>
            )}
        </motion.div>
      </div>
    </div>
  );
}

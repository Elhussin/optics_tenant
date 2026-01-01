"use client";
import { useMemo } from "react";
import useSWR from "swr";
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
  Shield
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { FetchData } from "@/src/shared/api/api";
import { motion } from "framer-motion";

const fetcher = (url: string) => FetchData({ url });

export default function Profile() {
  const { user } = useUser();
  const t = useTranslations("profilePage");
  // console.log(user);

  const shouldFetch =
    user?.role?.name?.toLowerCase() === "owner" && !!user?.client;

  const {
    data: clientData,
    error,
    isLoading,
  } = useSWR(
    shouldFetch ? `/api/tenants/clients/${user.client}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  const { daysLeft, statusColor, progressWidth, statusText, statusIcon } = useMemo(() => {
    if (!clientData)
      return { daysLeft: null, statusColor: "", progressWidth: "0%", statusText: "", statusIcon: null };

    const today = new Date();
    const paidUntil = new Date(clientData.paid_until);
    const timeDiff = paidUntil.getTime() - today.getTime();
    const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    let color = "bg-green-100 text-green-700 border-green-200";
    let text = t("subscriptionActive");
    let icon = <Check className="w-4 h-4" />;

    if (clientData.plans?.name === "trial") {
      color = "bg-blue-50 text-blue-700 border-blue-200";
      text = "Trial Period";
      icon = <Calendar className="w-4 h-4" />;
      // Force trial to look active but distinct
    } else if (days <= 0) {
      color = "bg-red-50 text-red-700 border-red-200";
      text = t("subscriptionExpired");
      icon = <AlertTriangle className="w-4 h-4" />;
    } else if (days <= 7) {
      color = "bg-amber-50 text-amber-700 border-amber-200";
      text = t("subscriptionAboutToExpire");
      icon = <AlertTriangle className="w-4 h-4" />;
    }

    // Calculate width ensuring it is between 0 and 100
    const widthPercentage = days > 0 ? Math.min((days / 30) * 100, 100) : 0;
    const width = `${widthPercentage}%`;

    return { daysLeft: days, statusColor: color, progressWidth: width, statusText: text, statusIcon: icon };
  }, [clientData, t]);

  if (error) {
    return (
      <div className="flex items-center justify-center p-12 text-red-500 bg-red-50 rounded-xl border border-red-100">
        <AlertTriangle className="mr-2" />
        {t("failedToLoad")}
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-gray-800"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 flex items-center gap-3">
            <span className="bg-primary/10 p-2 rounded-xl text-primary">
              <UserCircle size={32} />
            </span>
            {t("welcomeMessage")}, {user.username}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 ml-14">
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
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden sticky top-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-24"></div>
            <div className="px-6 pb-6 relative">
              <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-full border-4 border-white dark:border-gray-800 -mt-10 flex items-center justify-center shadow-md">
                <span className="text-2xl font-bold text-primary">{user.username.charAt(0).toUpperCase()}</span>
              </div>

              <div className="mt-3">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white capitalize">{user.username}</h2>
                <span className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 capitalize">
                  <Shield className="w-3 h-3" />
                  {user?.role?.name}
                </span>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 font-medium uppercase">{t("email")}</p>
                    <p className="text-sm font-medium truncate">{user.email}</p>
                  </div>
                </div>

                {user?.role?.name?.toLowerCase() === "owner" && (
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <Store className="w-5 h-5 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 font-medium uppercase">{t("clientId")}</p>
                      <p className="text-sm font-medium truncate">{user.client}</p>
                    </div>
                  </div>
                )}
              </div>

              {user?.role?.name?.toLowerCase() === "owner" && (
                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                  <Link
                    href={`/dashboard/tenant-settings`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 text-gray-700 font-medium transition-colors dark:bg-transparent dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                  >
                    <Settings className="w-4 h-4" />
                    <span>{t("tenantSettings")}</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Right Column: Subscription & Stats */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 space-y-6"
        >
          {user?.role?.name?.toLowerCase() === "owner" && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  {t("clientInformation")}
                </h3>
                {clientData && (
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${statusColor}`}>
                    {statusIcon}
                    {statusText}
                  </div>
                )}
              </div>

              {isLoading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-20 bg-gray-100 rounded-xl"></div>
                </div>
              ) : clientData ? (
                <>
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30">
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">{t("maxUsers")}</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{clientData.max_users}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-900/30">
                      <p className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-1">{t("maxProducts")}</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{clientData.max_products}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30">
                      <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mb-1">{t("maxBranches")}</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{clientData.max_branches}</p>
                    </div>
                  </div>

                  {/* Subscription Details */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-surface dark:bg-elevated rounded-xl mb-6">
                    <div className="mb-4 sm:mb-0">
                      <p className="text-sm text-gray-500 font-medium uppercase mb-1">{t("plan")}</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white capitalize">{clientData.plans?.name}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-sm text-gray-500 font-medium uppercase mb-1">{t("paidUntil")}</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white flex items-center sm:justify-end gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(clientData.paid_until).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-gray-600 bg-gray-200 dark:text-gray-300 dark:bg-gray-700">
                          {t("subscriptionCycle")}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold inline-block text-gray-600 dark:text-gray-400">
                          {daysLeft && daysLeft > 0 ? `${daysLeft} days left` : "Expired"}
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: progressWidth }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        style={{ width: progressWidth }}
                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${(daysLeft && daysLeft <= 7) ? "bg-red-500" : "bg-green-500"
                          }`}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  {t("noClientData")}
                </div>
              )}
            </div>
          )}

          {/* Pricing Section (shown if expired or trial) */}
          {user?.role?.name?.toLowerCase() === "owner" &&
            clientData &&
            (clientData.plans?.name === "trial" ||
              (daysLeft !== null && daysLeft <= 15)) && ( // Show upgrade options earlier (e.g., 15 days before expiry)
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div id="pricingSection" className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl p-6 border border-indigo-100 dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                      <CreditCard className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t("upgradePlan")}</h3>
                      <p className="text-sm text-gray-500">{t("unlockMoreFeatures")}</p>
                    </div>
                  </div>
                  <PricingPlans clientId={String(clientData.uuid)} />
                </div>
              </motion.div>
            )}
        </motion.div>
      </div>
    </div>
  );
}

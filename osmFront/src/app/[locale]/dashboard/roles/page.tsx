"use client";
import React from "react";
import { RolesManager } from "@/src/features/roles/components/RolesManager";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Shield, Sparkles } from "lucide-react";

const RolesPage = () => {
  const t = useTranslations("rolesPage");

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
          <div className="flex items-center gap-2 text-primary font-bold tracking-wider uppercase text-sm mb-1">
            <Sparkles size={16} />
            User Management
          </div>
          <h1 className="text-3xl font-bold text-main flex items-center gap-3">
            <span className="bg-primary/10 p-2 rounded-xl text-primary">
              <Shield size={32} />
            </span>
            Roles & Permissions
          </h1>
          <p className="text-secondary mt-1 ml-14">
            Manage your organization access control and role-based permissions.
          </p>
        </div>
      </motion.div>

      <RolesManager />
    </div>
  );
};

export default RolesPage;

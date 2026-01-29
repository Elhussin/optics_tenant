/**
 * ✨ Footer Component - محسّن مع Glassmorphism و UI/UX Enhancements
 * @description Footer محسّن مع theme colors، animations، و enhanced social icons
 */

"use client";

import { navUrl, socialLinks, otherLinks } from "@/src/shared/constants/url";
import { Link } from "@/src/app/i18n/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Heart, Sparkles } from "lucide-react";
import { cn } from "@/src/shared/utils/cn";

export default function Footer() {
  const t = useTranslations("footer");
  const t2 = useTranslations("aside");

  return (
    <footer
      className={cn(
        "relative mt-auto",
        "bg-elevated/50 backdrop-blur-md",
        "border-t-2 border-primary/20",
        "py-12",
      )}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ✨ Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {/* ✨ Column 1: Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h4
              className={cn(
                "text-lg font-bold mb-4 pb-3",
                "text-foreground",
                "border-b-2 border-primary/20",
                "flex items-center gap-2",
              )}
            >
              <span className="w-1 h-6 bg-primary rounded-full" />
              {t("quickLinks")}
            </h4>
            <ul className="space-y-2.5">
              {navUrl.map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={item.path}
                    className={cn(
                      "group flex items-center gap-2",
                      "text-muted-foreground hover:text-primary",
                      "transition-all duration-200",
                      "text-sm font-medium",
                    )}
                  >
                    <span
                      className={cn(
                        "w-0 h-0.5 bg-primary rounded-full",
                        "group-hover:w-4 transition-all duration-200",
                      )}
                    />
                    {t2(item.name)}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* ✨ Column 2: Other Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h4
              className={cn(
                "text-lg font-bold mb-4 pb-3",
                "text-foreground",
                "border-b-2 border-primary/20",
                "flex items-center gap-2",
              )}
            >
              <span className="w-1 h-6 bg-primary rounded-full" />
              {t("more")}
            </h4>
            <ul className="space-y-2.5">
              {otherLinks.map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={item.path}
                    className={cn(
                      "group flex items-center gap-2",
                      "text-muted-foreground hover:text-primary",
                      "transition-all duration-200",
                      "text-sm font-medium",
                    )}
                  >
                    <span
                      className={cn(
                        "w-0 h-0.5 bg-primary rounded-full",
                        "group-hover:w-4 transition-all duration-200",
                      )}
                    />
                    {t(item.name)}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* ✨ Column 3: Social Icons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h4
              className={cn(
                "text-lg font-bold mb-4 pb-3",
                "text-foreground",
                "border-b-2 border-primary/20",
                "flex items-center gap-2",
              )}
            >
              <span className="w-1 h-6 bg-primary rounded-full" />
              {t("followUs")}
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {socialLinks.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={item.name}
                      className={cn(
                        "flex items-center justify-center",
                        "w-12 h-12 rounded-xl",
                        "bg-primary/10 hover:bg-primary/20",
                        "text-primary hover:text-primary-foreground",
                        "border-2 border-primary/20 hover:border-primary",
                        "transition-all duration-200",
                        "hover:scale-110 hover:shadow-lg",
                        "group",
                      )}
                    >
                      <Icon
                        size={20}
                        className="transition-transform duration-200 group-hover:scale-110"
                      />
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* ✨ Enhanced Footer Bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className={cn(
            "mt-12 pt-8",
            "border-t-2 border-primary/20",
            "text-center",
          )}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap justify-center">
              <span className="font-semibold text-foreground">
                {t("footer")}
              </span>
              <span className="hidden sm:inline text-border">•</span>
              <span className="flex items-center gap-1.5">
                {t("madesmart")}
                <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse-slow" />
                {t("foryou")}
              </span>
            </div>

            <p className="text-xs text-muted-foreground/60">
              &copy; {new Date().getFullYear()} {t("allRightsReserved")}
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}

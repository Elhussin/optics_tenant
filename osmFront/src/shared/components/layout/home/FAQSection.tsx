/**
 * ✨ FAQSection - محسّن مع Animations و UI/UX Enhancements
 * @description FAQ section مع enhanced accordion و smooth animations
 */

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/src/shared/utils/cn";

export default function FAQSection() {
  const t = useTranslations("faqSection");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: t("faq.0.question"),
      answer: t("faq.0.answer"),
    },
    {
      question: t("faq.1.question"),
      answer: t("faq.1.answer"),
    },
    {
      question: t("faq.2.question"),
      answer: t("faq.2.answer"),
    },
    {
      question: t("faq.3.question"),
      answer: t("faq.3.answer"),
    },
  ];

  return (
    <section
      className={cn("relative py-24 lg:py-32 overflow-hidden", "bg-background")}
    >
      {/* ✨ Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-grid-primary/[0.02] bg-[size:32px_32px]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl relative z-10">
        {/* ✨ Enhanced Section Header */}
        <div className="text-center mb-16 lg:mb-20">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 mb-6",
              "rounded-full border-2 border-primary/20",
              "bg-primary/10 backdrop-blur-sm"
            )}
          >
            <HelpCircle className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold uppercase tracking-wider text-primary">
              FAQ
            </span>
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className={cn(
              "text-4xl sm:text-5xl lg:text-6xl font-black mb-6",
              "text-foreground"
            )}
          >
            {t("title") || "Frequently Asked Questions"}
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg lg:text-xl text-muted-foreground"
          >
            {t("subtitle") || "Everything you need to know about our platform."}
          </motion.p>
        </div>

        {/* ✨ Enhanced FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "rounded-2xl overflow-hidden",
                  "border-2 transition-all duration-300",
                  isOpen
                    ? "border-primary/50 shadow-lg"
                    : "border-border hover:border-primary/30"
                )}
              >
                {/* ✨ Enhanced Question Button */}
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className={cn(
                    "w-full flex items-center justify-between gap-4",
                    "p-6 text-left",
                    "bg-elevated",
                    "transition-all duration-300",
                    "group"
                  )}
                  aria-expanded={isOpen}
                >
                  {/* Question text */}
                  <span
                    className={cn(
                      "font-bold text-base sm:text-lg",
                      "transition-colors",
                      isOpen
                        ? "text-primary"
                        : "text-foreground group-hover:text-primary"
                    )}
                  >
                    {faq.question}
                  </span>

                  {/* ✨ Enhanced Icon */}
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      "shrink-0 transition-all duration-300",
                      isOpen
                        ? "bg-primary text-primary-foreground rotate-180"
                        : "bg-primary/10 text-primary group-hover:bg-primary/20"
                    )}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>

                {/* ✨ Enhanced Answer */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        duration: 0.3,
                        ease: [0.4, 0, 0.2, 1],
                      }}
                      className="overflow-hidden"
                    >
                      <div
                        className={cn(
                          "px-6 pb-6 pt-2",
                          "text-muted-foreground leading-relaxed",
                          "bg-elevated/50",
                          "border-t-2 border-border"
                        )}
                      >
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ✨ Bottom accent line (when open) */}
                {isOpen && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    className={cn(
                      "h-1 bg-gradient-to-r from-primary via-blue-500 to-primary",
                      "origin-left"
                    )}
                  />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* ✨ Optional CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <p className="text-muted-foreground mb-4">Still have questions?</p>
          <button
            className={cn(
              "inline-flex items-center gap-2 px-6 py-3",
              "rounded-xl border-2 border-border",
              "bg-background hover:bg-elevated",
              "text-foreground font-semibold",
              "transition-all hover:scale-105",
              "hover:border-primary/50"
            )}
          >
            <Sparkles className="w-4 h-4" />
            <span><Link href="/contact">Contact Support</Link></span>
          </button>
        </motion.div>
      </div>
    </section>
  );
}

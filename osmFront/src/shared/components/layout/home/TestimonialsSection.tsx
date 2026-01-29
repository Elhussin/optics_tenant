/**
 * ✨ TestimonialsSection - محسّن مع Animations و UI/UX Enhancements
 * @description Testimonials section مع enhanced cards و gradient effects
 */

"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Star, Quote, Sparkles } from "lucide-react";
import { cn } from "@/src/shared/utils/cn";

export default function TestimonialsSection() {
  const t = useTranslations("testimonialsSection");

  // Testimonials data
  const testimonials = [
    {
      name: t("testimonials.0.name"),
      role: t("testimonials.0.role"),
      content: t("testimonials.0.content"),
      rating: 5,
    },
    {
      name: t("testimonials.1.name"),
      role: t("testimonials.1.role"),
      content: t("testimonials.1.content"),
      rating: 5,
    },
    {
      name: t("testimonials.2.name"),
      role: t("testimonials.2.role"),
      content: t("testimonials.2.content"),
      rating: 4,
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

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* ✨ Enhanced Section Header */}
        <div className="text-center mb-16 lg:mb-20 max-w-3xl mx-auto">
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
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold uppercase tracking-wider text-primary">
              {t("TESTIMONIALS") || "TESTIMONIALS"}
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
            {t("title") || "Trusted by Optical Professionals"}
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg lg:text-xl text-muted-foreground"
          >
            {t("subtitle") ||
              "See what our clients say about their experience."}
          </motion.p>
        </div>

        {/* ✨ Enhanced Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {testimonials.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className={cn(
                "relative p-8 rounded-3xl",
                "bg-elevated border-2 border-border",
                "hover:border-primary/30",
                "transition-all duration-300",
                "hover:shadow-xl hover:-translate-y-1",
                "group"
              )}
            >
              {/* ✨ Quote Icon */}
              <div
                className={cn(
                  "absolute -top-4 -left-4",
                  "w-12 h-12 rounded-2xl",
                  "bg-gradient-to-br from-primary to-blue-500",
                  "flex items-center justify-center",
                  "shadow-lg shadow-primary/20",
                  "rotate-6 group-hover:rotate-12",
                  "transition-transform duration-300"
                )}
              >
                <Quote className="w-6 h-6 text-white" />
              </div>

              {/* ✨ Rating Stars */}
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "w-5 h-5 transition-all duration-300",
                      i < item.rating
                        ? "text-yellow-400 fill-yellow-400 group-hover:scale-110"
                        : "text-border"
                    )}
                    style={{ transitionDelay: `${i * 50}ms` }}
                  />
                ))}
              </div>

              {/* ✨ Testimonial Content */}
              <p
                className={cn(
                  "text-muted-foreground leading-relaxed mb-8",
                  "text-base italic"
                )}
              >
                &ldquo;{item.content}&rdquo;
              </p>

              {/* ✨ Enhanced Author Info */}
              <div className="flex items-center gap-4">
                {/* ✨ Gradient Avatar */}
                <div
                  className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center",
                    "bg-gradient-to-br from-primary via-blue-500 to-purple-500",
                    "text-white font-black text-xl",
                    "shadow-lg group-hover:shadow-xl",
                    "transition-all duration-300",
                    "group-hover:scale-110"
                  )}
                >
                  {item.name.charAt(0)}
                </div>

                <div>
                  <h4 className="font-bold text-foreground text-base mb-1">
                    {item.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">{item.role}</p>
                </div>
              </div>

              {/* ✨ Bottom accent line */}
              <div
                className={cn(
                  "absolute bottom-0 left-0 right-0 h-1",
                  "bg-gradient-to-r from-primary via-blue-500 to-purple-500",
                  "rounded-b-3xl",
                  "scale-x-0 group-hover:scale-x-100",
                  "transition-transform duration-300 origin-left"
                )}
              />
            </motion.div>
          ))}
        </div>

        {/* ✨ Optional Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-16 flex flex-wrap justify-center gap-8 lg:gap-12"
        >
          {[
            { value: "500+", label: "Happy Clients" },
            { value: "98%", label: "Satisfaction Rate" },
            { value: "4.9/5", label: "Average Rating" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-4xl font-black text-foreground mb-2">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground font-medium">
                {t(stat.label)}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

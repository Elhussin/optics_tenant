"use client";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Star, User } from "lucide-react";
import Image from "next/image";

export default function TestimonialsSection() {
    const t = useTranslations("testimonialsSection");

    // Fallback data if translations aren't ready, usually we would map over t.raw('items')
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
        }
    ];

    return (
        <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16 max-w-2xl mx-auto">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl font-bold text-gray-900 dark:text-white mb-4"
                    >
                        {t("title") || "Trusted by Optical Professionals"}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-gray-600 dark:text-gray-300"
                    >
                        {t("subtitle") || "See what our clients say about their experience."}
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonials.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative"
                        >
                            <div className="flex gap-1 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-5 h-5 ${i < item.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
                                    />
                                ))}
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 mb-6 italic">&ldquo;{item.content}&rdquo;</p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                    <User className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white">{item.name}</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

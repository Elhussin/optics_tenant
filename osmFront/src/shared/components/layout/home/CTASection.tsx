"use client";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
    const t = useTranslations("ctaSection");

    return (
        <section className="py-24 bg-gradient-to-br from-primary to-blue-600 relative overflow-hidden">
            {/* Decorative background shapes */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

            <div className="container mx-auto px-4 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-3xl mx-auto"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        {t("title") || "Ready to Streamline Your Optical Store?"}
                    </h2>
                    <p className="text-xl text-blue-100 mb-10">
                        {t("description") || "Join hundreds of optical shops managing their inventory and patients with ease."}
                    </p>
                    <Link
                        href="/auth/register"
                        className="inline-flex items-center gap-2 bg-white text-primary font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all transform hover:-translate-y-1"
                    >
                        {t("button") || "Get Started Now"}
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}

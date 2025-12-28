"use client";
import { contact } from "@/src/shared/constants/conteact";
import { socialLinks } from "@/src/shared/constants/url";
import { useTranslations } from "next-intl";
import { Link } from "@/src/app/i18n/navigation";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react";

export default function ContactPage() {
  const t = useTranslations("contact");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto text-center mb-16"
      >
        <span className="text-primary font-semibold tracking-wider uppercase text-sm">
          {t("subtitle") || "Contact Support"}
        </span>
        <h1 className="mt-2 text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {t("description")}
        </p>
      </motion.div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

        {/* Contact Information Column */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-8"
        >
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              {t("contactInfo") || "Contact Information"}
            </h3>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-blue-600 dark:text-blue-400">
                  <Mail size={24} />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{t("email")}</p>
                  <a href={`mailto:${contact.email}`} className="text-gray-600 dark:text-gray-400 hover:text-primary transition">
                    {contact.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-green-600 dark:text-green-400">
                  <Phone size={24} />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{t("phone")}</p>
                  <a href={`tel:${contact.phone}`} className="text-gray-600 dark:text-gray-400 hover:text-primary transition">
                    {contact.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg text-purple-600 dark:text-purple-400">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{t("address")}</p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {contact.address}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              {t("followUs") || "Follow Us"}
            </h3>
            <div className="flex flex-wrap gap-4">
              {socialLinks.map(({ url, icon: Icon, name }) => (
                <Link
                  key={name}
                  href={url}
                  target="_blank"
                  title={name}
                  className="w-12 h-12 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-primary hover:text-white transition-all duration-300"
                >
                  <Icon size={24} />
                </Link>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Contact Form Column */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-800"
        >
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t("sendMessage") || "Send us a Message"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {t("formDescription") || "Have a question or feedback? Fill out the form below and we'll get back to you shortly."}
            </p>
          </div>

          <form className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("fullName") || "Full Name"}
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 border-transparent focus:border-primary focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("emailLabel") || "Email Address"}
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 border-transparent focus:border-primary focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("subject") || "Subject"}
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-4 top-3.5 text-gray-400" size={18} />
                <input
                  type="text"
                  className="w-full pl-11 pr-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 border-transparent focus:border-primary focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  placeholder="How can we help?"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("messageLabel") || "Message"}
              </label>
              <textarea
                rows={4}
                className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 border-transparent focus:border-primary focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none"
                placeholder="Tell us more about your inquiry..."
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-4 rounded-lg hover:bg-primary-dark transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-primary/30"
            >
              <Send size={18} />
              {t("submit") || "Send Message"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

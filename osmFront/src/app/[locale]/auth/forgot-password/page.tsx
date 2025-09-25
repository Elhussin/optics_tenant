"use client";
import { useState } from "react";
import { useFormRequest } from "@/src/shared/hooks/useFormRequest";
import { useTranslations } from "next-intl";
export default function ForgotPasswordPage() {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error" | "invalid"
  >("idle");
  const [message, setMessage] = useState<string>("");
  const t = useTranslations("forgotPassword");
  const alias = "users_password_reset_create";

  const formRequest = useFormRequest({
    alias,
    onSuccess: async (res) => {
      setStatus("success");
      setMessage(t("SuccessMessage"));
    },
    onError: async (err) => {
      const detail =
        err.response?.data?.detail ||
        "Password reset failed. Please try again.";
      setStatus("error");
      setMessage(t("ErrorMessage"));
    },
  });

  const onSubmit = async (data: any) => {
    if (!data.email) {
      setStatus("invalid");
      setMessage(t("emailRequired"));
      return;
    }
    setStatus("loading");
    setMessage(t("Resetting"));
    formRequest.submitForm({ data });
  };

  return (
    <div className="h-screen">
      <header className="">
        <h1 className="title">{t("title")}</h1>
        <p className="subtitle">{t("description")}</p>
      </header>
      <form onSubmit={formRequest.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label" htmlFor="email">
            {t("email")}
          </label>
          <input
            type="email"
            required
            {...formRequest.register("email")}
            className="input-text"
            placeholder="Enter email"
          />
          {formRequest.errors.email && (
            <p className="error-text">
              {formRequest.errors.email.message as string}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={formRequest.isSubmitting || formRequest.isLoading}
          className="btn btn-primary"
        >
          {formRequest.isSubmitting || formRequest.isLoading
            ? t("sending")
            : t("button")}
        </button>

        {status !== "idle" && (
          <div className={`status-text ${status}`}>{message}</div>
        )}
      </form>
    </div>
  );
}

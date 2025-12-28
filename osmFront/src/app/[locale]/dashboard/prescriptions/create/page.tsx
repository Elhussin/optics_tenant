"use client";
import EyeTest from "@/src/features/prescription/components/EyeTest";
import { formsConfig } from "@/src/features/formGenerator/constants/entityConfig";
import { useTranslations } from "next-intl";

export default function CreatePrescriptionPage() {
    const t = useTranslations("formsConfig");
    const entity = "prescriptions";
    const config = formsConfig[entity];

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">{t(config.createTitle || "createTitle")}</h1>
            <div className="bg-elevated rounded-xl shadow-lg p-6">
                <EyeTest
                    alias={config.createAlias!}
                    title={t("create")}
                    submitText={t("save")}
                    message={t("success")}
                />
            </div>
        </div>
    );
}

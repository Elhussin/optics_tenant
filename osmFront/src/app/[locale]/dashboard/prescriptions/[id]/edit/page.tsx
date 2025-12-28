"use client";
import EyeTest from "@/src/features/prescription/components/EyeTest";
import { formsConfig } from "@/src/features/formGenerator/constants/entityConfig";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

export default function EditPrescriptionPage() {
    const t = useTranslations("formsConfig");
    const params = useParams();
    const id = params.id as string;
    const entity = "prescriptions";
    const config = formsConfig[entity];

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">{t(config.updateTitle || "updateTitle")}</h1>
            <div className="bg-white rounded-xl shadow-lg p-6">
                <EyeTest
                    alias={config.updateAlias!}
                    id={id}
                    title={t("update")}
                    submitText={t("save")}
                    message={t("success")}
                />
            </div>
        </div>
    );
}

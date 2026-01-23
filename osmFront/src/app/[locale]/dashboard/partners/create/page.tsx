"use client";

import DynamicFormGenerator from "@/src/features/formGenerator/components/DynamicFormGenerator";

export default function CreatePartnerPage() {
  return <DynamicFormGenerator entity="partners" mode="create" />;
}

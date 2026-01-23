"use client";

import DynamicFormGenerator from "@/src/features/formGenerator/components/DynamicFormGenerator";
import { useParams } from "next/navigation";

export default function EditPartnerPage() {
  const { id } = useParams();

  return <DynamicFormGenerator entity="partners" mode="edit" id={Number(id)} />;
}

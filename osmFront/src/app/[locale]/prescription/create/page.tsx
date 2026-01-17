"use client";
import EyeTest from "@/src/features/prescription/components/EyeTest";

export default function CreatePrescriptionPage() {
  return (
    <EyeTest
      alias="prescriptions_prescription_create"
      title="Create Prescription"
      message="Successfully created Prescription"
      showContactLens={true}
      isView={false}

    />
  );
}


"use client";
import EyeTest from '@/components/forms/EyeTest';

export default function Prescription() {

  return (
          <EyeTest
            alias="prescriptions_prescription_create"
            className="container"
            title="create Prescription"
            message="Sucussfully created Prescription"
            submitText="Save Prescription"
          />
  );
}

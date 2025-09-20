
"use client";
import PrescriptionForm from '@/components/eyeTest/archive/PrescriptionForm0';

export default function Prescription() {

  return (
          <PrescriptionForm
            alias="prescriptions_prescription_create"
            className="container"
            title="create Prescription"
            message="Sucussfully created Prescription"
            submitText="Save Prescription"
          />
  );
}

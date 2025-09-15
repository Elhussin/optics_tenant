
"use client";
import PrescriptionForm from '@/components/forms/PrescriptionForm';

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

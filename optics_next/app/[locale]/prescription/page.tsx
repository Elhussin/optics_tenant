
"use client";
import EyeTest from '@/components/forms/EyeTest';
// import PrescriptionForm from '@/components/eyeTest/PrescriptionForm';
export default function Prescription() {

  return (
          <EyeTest
            alias="prescriptions_prescription_create"
            className="container"
            title="create Prescription"
            message="Sucussfully created Prescription"
            submitText="Save Prescription"
          />
          // <PrescriptionForm
          //   alias="prescriptions_prescription_create"
          //   className="container"
          //   title="create Prescription"
          //   message="Sucussfully created Prescription"
          //   submitText="Save Prescription"
          // />
  );
}

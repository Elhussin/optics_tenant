
"use client";
import PrescriptionForm from '@/components/forms/PrescriptionForm';
import { useParams } from "next/navigation";
import EyeTest from '@/components/forms/EyeTest';
export default function EditPrescription() {
  const params = useParams();
  const pageId = params?.id as string;
  return (
          <EyeTest
            alias="prescriptions_prescription_update"
            className="container"
            title="Edit Prescription"
            message="Sucussfully edited Prescription"
            submitText="Save Prescription"
            id={pageId}
          />
  );
}

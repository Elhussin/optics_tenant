
"use client";
import PrescriptionForm from '@/components/forms/PrescriptionForm';
import { useParams } from "next/navigation";
export default function EditPrescription() {
  const params = useParams();
  const pageId = params?.id as string;
  return (
          <PrescriptionForm
            alias="prescriptions_prescription_update"
            className="container"
            title="Edit Prescription"
            message="Sucussfully edited Prescription"
            submitText="Save Prescription"
            id={pageId}
          />
  );
}

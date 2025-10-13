// Dialog.tsx (بقي كما هو — مجرد تذكير أنه يستخدم setValue(currentFieldName, String(data.id)))
"use client";
import DynamicFormDialog from "@/src/shared/components/ui/dialogs/DynamicFormDialog";
import { useProductFormStore } from "../store/useProductFormStore";

interface Props {
  setValue: (fieldName: string, value: string) => void;
}

export const Dialog = ({ setValue }: Props) => {
  const { isShowModal, entityName, setShowModal, currentFieldName, setData } = useProductFormStore();

  return (
    <>
      {isShowModal && (

    <DynamicFormDialog
      entity={entityName}
      onClose={(newItem: any) => {
        setShowModal(false);
        if (newItem) {
          setValue(currentFieldName, String(newItem.id));
          // تحديث البيانات في store بشكل عام
          setData(entityName, newItem);
        }
      }}
      title={`Add ${entityName.charAt(0).toUpperCase() + entityName.slice(1)}`}
    />
      )}
    </>
  )
}

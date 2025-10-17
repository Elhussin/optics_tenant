"use client";
import DynamicFormDialog from "@/src/shared/components/ui/dialogs/DynamicFormDialog";
import { useProductFormStore } from "../store/useProductFormStore";

interface Props {
  setValue: (fieldName: string, value: string,) => void;
  getValues: () => any;
}

export const Dialog = ({ setValue, getValues }: Props) => {
  const { isShowModal, entityName, setShowModal, currentFieldName, setData,  } = useProductFormStore();

  return (
    <>
      {isShowModal && (

      <DynamicFormDialog
        entity={entityName}
        onClose={(newItem) => {
            if (newItem) {
              setData(entityName, newItem);
              setValue(currentFieldName, String(newItem.id));
              setShowModal(false);
            }
          }}
        title={`Add ${entityName.charAt(0).toUpperCase() + entityName.slice(1)}`}
      />

      )}
    </>
  )
}


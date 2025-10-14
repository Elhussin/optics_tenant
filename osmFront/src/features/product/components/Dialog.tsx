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

const onClose = (newItem: any , getValues: any, setValue: any, entityName: string, setShowModal: any, currentFieldName: string, setData: any) => {

          // onClose={(newItem: any) =>  onClose(newItem, getValues, setValue, entityName, setShowModal, currentFieldName, setData, )}

  if (!newItem || !currentFieldName) return;

  setData(entityName, newItem);
  const values = getValues();

  let targetField = currentFieldName;

  const variantIndex = values.variants?.findIndex((variant: any) =>
    Object.keys(variant).includes(currentFieldName)
  );

  if (variantIndex !== -1 && variantIndex !== undefined) {
    targetField = `variants.${variantIndex}.${currentFieldName}`;
  }

  setTimeout(() => {
    setValue(targetField, String(newItem.id), {
      shouldValidate: true,
      shouldDirty: true,
    });

  }, 10);
  setShowModal(false);
}



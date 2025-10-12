import DynamicFormDialog from "@/src/shared/components/ui/dialogs/DynamicFormDialog";
import { useProductFormStore } from "../store/useProductFormStore";
interface Props {
  setValue: (fieldName: string, value: string) => void;
}


export const Dialog = ({ setValue }: Props) => {
  const { isShowModal, entityName, setShowModal, currentFieldName } = useProductFormStore();

  return (
    <>
      {isShowModal && (
        <DynamicFormDialog
          entity={entityName}
          onClose={(data: any) => {
            setShowModal(false);
            if (data) {
              setValue(currentFieldName, String(data.id));
            }
          }}
          title="Add Attribute Value"
        />
      )}
    </>
  )
}

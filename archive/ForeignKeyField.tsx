import { useEffect } from "react";
import { RHFSelect } from "@/src/features/formGenerator/components/RHFSelect";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { CirclePlus } from "lucide-react";
import { useUser } from "../osmFront/src/features/auth/hooks/UserContext";
import { useProductFormStore } from "../osmFront/src/features/product/store/useProductFormStore";
export const ForeignKeyField = ({ data, control, item }: any) => {
  const { setShowModal, setEntityName, setCurrentFieldName , setVariantField ,variants , openVariantIndex } = useProductFormStore();

  const { user } = useUser();
  const handleClick = (entity: string, fieldName: string) => {
    setEntityName(entity);
    setCurrentFieldName(fieldName);
    setShowModal(true);

  };

  return (
    <div>
      {item.filter && (
        <label htmlFor={item.name} className="block font-medium text-sm m-1" title={item.hint!}>
          {item.filter}
          {item.required ? <span className="text-red-500"> *</span> : ''}
        </label>
      )}
      <div className={`flex items-center gap-2`}>
        <RHFSelect
          name={item.name}
          control={control}
          parsedOptions={data}
          label={item.filter}
          required={item.required}
          placeholder="Select..."
          className="flex-1"
        />
        {/* {user?.role === "OWNER" && ( */}
          <ActionButton
            onClick={() => handleClick(item.entityName, item.name)}
            variant="outline"
            className="px-4 py-2" // padding مناسب للزر
            icon={<CirclePlus size={18} color="green" />}
            title="Add"
          />
        {/* )} */}
      </div>
    </div>
  )
}

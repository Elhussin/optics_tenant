import { useEffect } from "react";
import { RHFSelect } from "@/src/features/formGenerator/components/RHFSelect";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { CirclePlus } from "lucide-react";

export const ForeignKeyField = ({ data, control, name, setShowModal, setEntity, entityName, setCurrentFieldName, filter, hent, required = false, isFilter = true }: any) => {

  const handleClick = (entity: string, fieldName: string) => {
    setEntity(entity);
    setCurrentFieldName(fieldName);
    setShowModal(true);
  };
  

    return (
      <div>
        {filter && (
          <label htmlFor={name} className="block font-medium text-sm m-1">
            {filter}
            {required ? <span className="text-red-500"> *</span> : ''}
          </label>
        )}
        <div className={`flex items-center gap-2`}>
          <RHFSelect
            name={name}
            control={control}
            parsedOptions={data}
            label={filter}
            required={required}
            placeholder="Select..."
            className="flex-1"
          />
          <ActionButton
            // name={name}
            // entity={entityName}
            // onClick={handleClick}
            onClick={() => handleClick(entityName, name)}

            variant="outline"
            className="px-4 py-2" // padding مناسب للزر
            icon={<CirclePlus size={18} color="green" />}
            title="Add"
          />
        </div>
      </div>
    )
  }
  
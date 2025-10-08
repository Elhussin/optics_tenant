import {RHFSelect} from "@/src/features/formGenerator/components/RHFSelect";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { CirclePlus } from "lucide-react";
export const FilterOtian = ({data,control, name,setShowModal,setEntity ,entityName,setCureantAttribute,filter,hent}:any) => {
    const filterData = data?.filter((v:any)=> v.attribute_name === filter).map((v:any)=> ({ label: v.value, value: v.id })) || [];

    setCureantAttribute(name)
    return (
        <div>
            <label title={hent} htmlFor={name}>{name}</label>
        <RHFSelect
        name={name}
        control={control}
        parsedOptions={filterData}
        label={name}
        required
        placeholder={`Select ${name}`}
        className="flex-1"
        // title={hent}
      />
           <ActionButton
          onClick={() => setShowModal(true) && setEntity(entityName) && setCureantAttribute(name)}
          variant="outline"
          className="px-4 py-2" // padding مناسب للزر
          icon={<CirclePlus size={18} color="green" />}
          title="Add"
        />
      </div>
    )
}
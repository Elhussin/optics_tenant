import { RHFSelect } from "@/src/features/formGenerator/components/RHFSelect";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { CirclePlus } from "lucide-react";
import { useEffect } from "react";


export const parsedOptions= (data:any,filter:string ,mapOnly=false)=>{

  if(mapOnly){
    return data.map((v: any) => ({ label: v.name, value: v.id })) || []
  }
  return data?.filter((v: any) => v.attribute_name === filter).map((v: any) => ({ label: v.value, value: v.id })) || []

}




export const RenderForeignKeyField = ({ data, control, name, setShowModal, setEntity, entityName, setCurrentFieldName, filter, hent, required = false, isFilter = true }: any) => {
  useEffect(() => {
    setEntity(entityName);
  }, [entityName])


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
          placeholder={`Select ${filter}`}
          className="flex-1"

        // title={hent}
        />
        <ActionButton
          name={name}
          entity={entityName}
          onClick={(e: any) => {
            setEntity(entityName);
            setCurrentFieldName(e.currentTarget.name as string);
            setShowModal(true);
            setEntity(e.currentTarget.entity as string);
          }}
          variant="outline"
          className="px-4 py-2" // padding مناسب للزر
          icon={<CirclePlus size={18} color="green" />}
          title="Add"
        />
      </div>
    </div>
  )
}

import {RHFSelect} from "@/src/features/formGenerator/components/RHFSelect";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { CirclePlus } from "lucide-react";
export const FilterOtian = ({data,control, name,setShowModal,setEntity ,entityName,setCurrentFieldName,filter,hent,required=false}:any) => {
    const filterData = data?.filter((v:any)=> v.attribute_name === filter).map((v:any)=> ({ label: v.value, value: v.id })) || [];


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
        parsedOptions={filterData}
        label={filter}
        required={required}
        placeholder={`Select ${filter}`}
        className="flex-1"
        // title={hent}
      />
           <ActionButton
           name={name}
             onClick={(e:any) => {
              setEntity(entityName);
              setCurrentFieldName(e.currentTarget.name as string);
              setShowModal(true);
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


// <>
// {label && (
//   <label htmlFor={fieldName} className="block font-medium text-sm m-1">
//     {label}
//     {required ? <span className="text-red-500"> *</span> : ''}
//   </label>
// )}
// <div className={`flex items-center gap-2 ${config.spacing}`}>

//   <RHFSelect
//     name={fieldName}
//     control={form.control}
//     parsedOptions={parsedOptions}
//     label={label}
//     required={required}
//     placeholder="Select a country"
//     className="flex-1"
//   />

//   <ActionButton
//     onClick={() => setShowModal(true)}
//     variant="outline"
//     className="px-4 py-2" // padding مناسب للزر
//     icon={<CirclePlus size={18} color="green" />}
//     title="Add"
//   />
// </div>
// </>
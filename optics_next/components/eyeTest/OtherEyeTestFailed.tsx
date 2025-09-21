import {OtherFailedProps} from "@/types/eyeTestType";

import { ActionButton } from "@/components/ui/buttons";
import { CirclePlus } from "lucide-react";
export const OtherEyeTestFailed=(props:OtherFailedProps)=>{
  const {register,customers,setShowModal,errors,} = props;
  return(
  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
  {/* Notes */}
  <div className="grid grid-cols-[80px_repeat(4,1fr)] gap-2 mt-4">
    <div className="flex items-center">
      <label className="">Notes</label>
    </div>
    <div className="col-span-3 md:col-span-4">
      <textarea
        {...register("notes")}
        className="input-text resize-none p-2 rounded-md border border-gray-300 w-full"
        rows={1}
        placeholder="Notes..."
        title="Notes"
      />
    </div>
  </div>

  {/* Customer */}
  <div className="grid grid-cols-[80px_repeat(4,1fr)] md:grid-cols-5 gap-2 mt-4 ">
    <div className="flex items-center">
      <label className="p-">
        Customer<span className="text-red-500">*</span>
      </label>
    </div>
    <div className="col-span-3 md:col-span-2 flex">

      <select
        // {...register("customer")}
        {...register("customer", { required: "Customer is required" })}
        className="input-text rounded-md border border-gray-300 w-full p-2 appearance-none"
        title="Customer (Required)"
      >
            <option className="option" value="">Select Customer</option>
            {customers?.map((customer) => (
            <option key={customer.id} value={String(customer.id)} className="option">
                {customer.first_name} {customer.last_name}
            </option>
            ))}
      </select>
      <ActionButton
        onClick={() => setShowModal(true)}
        variant="outline"
        // className="absolute right-2 top-1 p-2"
        icon={<CirclePlus size={18} color="green" />}
        title="Add"
      />
    </div>

    {errors.customer && <p className="text-red-500 mt-1">{errors.customer.message}</p>}
  </div>
</div>
  )
}

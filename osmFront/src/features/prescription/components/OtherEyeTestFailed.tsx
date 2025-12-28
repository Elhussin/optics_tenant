import { OtherFailedProps } from "../types";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { CirclePlus, User, FileText } from "lucide-react";

export const OtherEyeTestFailed = (props: OtherFailedProps) => {
  const { register, customers, setShowModal, errors, isView } = props;

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 space-y-6">
      <div className="flex items-center gap-2 mb-2">
         <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Additional Details</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Customer Selection */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <User className="w-4 h-4 text-primary" />
            Customer <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <select
                {...register("customer", { required: "Customer is required" })}
                disabled={isView}
                className={`w-full appearance-none bg-surface border ${errors?.customer ? 'border-red-500 ring-2 ring-red-500/10' : 'border-gray-200 dark:border-gray-700'} rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer`}
              >
                <option value="" title="Select Customer" className="select__option">Select Customer</option>
                {customers?.map((customer) => (
                  <option key={customer.id} value={String(customer.id)} title={customer.first_name + " " + customer.last_name}>
                    {customer.first_name ||"N/A"} {customer.last_name ||"N/A"} {customer.email ||"N/A"} {customer.phone ||"N/A"}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>

            {!isView && (
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="flex items-center justify-center w-11 h-11 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-colors"
                title="Add New Customer"
              >
                <CirclePlus className="w-5 h-5" />
              </button>
            )}
          </div>
          {errors?.customer && <p className="text-xs text-red-500 mt-1">{String(errors.customer.message)}</p>}
        </div>

        {/* Notes Section */}
        <div className="space-y-2">
           <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <FileText className="w-4 h-4 text-primary" />
            Notes
          </label>
          <textarea
            {...register("notes")}
            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-gray-300 min-h-[46px] resize-none"
            rows={2}
            placeholder="Add any additional notes here..."
            disabled={isView}
          />
        </div>

      </div>
    </div>
  );
};


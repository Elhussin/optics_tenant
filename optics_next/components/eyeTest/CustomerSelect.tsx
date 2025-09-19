import Modal from "@/components/view/Modal";
import { ActionButton } from "@/components/ui/buttons";
import { CirclePlus } from "lucide-react";

export const CustomerSelect = ({ register, errors, customers, showModal, setShowModal, setCustomers , isView }: { register: any; errors: any; customers: any; showModal: boolean; setShowModal: (show: boolean) => void; setCustomers: (customers: any) => void; isView: boolean }) => {

return (
        <div className="grid grid-cols-[80px_repeat(4,1fr)] md:grid-cols-5 gap-2 mt-4 relative">
          <div className="flex items-center">
            <label className="">
              Customer<span className="text-red-500">*</span>
            </label>
          </div>
          <div className="col-span-3 md:col-span-2">
            <select
              {...register("customer")}
              disabled={isView}
              className="input-text rounded-md border border-gray-300 w-full p-2 appearance-none"
            >
              <option value="">Select Customer</option>
              {customers?.map((customer: any) => (
                <option key={customer.id} value={customer.id}>
                  {customer.first_name} {customer.last_name}
                </option>
              ))}
            </select>
            <ActionButton
              onClick={() => setShowModal(true)}
              variant="outline"
              className="absolute right-2 top-1 p-2"
              icon={<CirclePlus size={18} color="green" />}
              title="Add"
            />
          </div>
          {showModal && (
            <Modal
              url={"dashboard/customer/create"}
              onClose={() => setShowModal(false)}
            //   onSuccess={(newCustomer: any) => setCustomers((prev: any) => [...prev, newCustomer])}
            />
          )}
          {errors.customer && <p className="text-red-500 mt-1">{errors.customer.message}</p>}
        </div>
)
}

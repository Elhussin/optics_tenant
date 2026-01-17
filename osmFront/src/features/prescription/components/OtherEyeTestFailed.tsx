import { OtherFailedProps } from "../types";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { CirclePlus, User, FileText, Sparkles } from "lucide-react";
import { GlassCard } from "@/src/shared/components/ui/GlassCard";
import { cn } from "@/src/shared/utils/cn";

export const OtherEyeTestFailed = (props: OtherFailedProps) => {
  const { register, customers, setShowModal, errors, isView } = props;

  return (
    <div className="relative group">
      {/* Glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

      <GlassCard className="shadow-xl" padding="none">
        {/* Gradient strip */}
        <div className="h-1 bg-gradient-to-r from-primary via-secondary to-primary" />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-main">
              Additional Details
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Selection */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-main ml-1">
                <User size={14} className="text-primary" />
                Customer
                <span className="text-danger ml-0.5">*</span>
              </label>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <select
                    {...register("customer", {
                      required: "Customer is required",
                    })}
                    disabled={isView}
                    className={cn(
                      "w-full appearance-none rounded-xl px-4 py-3 text-sm outline-none transition-all cursor-pointer",
                      "border-2 bg-white dark:bg-gray-800",
                      "focus:ring-2 focus:ring-offset-1",
                      errors?.customer
                        ? "border-danger/50 focus:border-danger focus:ring-danger/20"
                        : "border-border-main focus:border-primary focus:ring-primary/20"
                    )}
                  >
                    <option value="" title="Select Customer">
                      Select Customer
                    </option>
                    {customers?.map((customer) => (
                      <option
                        key={customer.id}
                        value={String(customer.id)}
                        title={`${customer.first_name} ${customer.last_name}`}
                      >
                        {customer.first_name || "N/A"}{" "}
                        {customer.last_name || "N/A"} {customer.email || "N/A"}{" "}
                        {customer.phone || "N/A"}
                      </option>
                    ))}
                  </select>

                  {/* Dropdown arrow */}
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <svg
                      className="w-4 h-4 text-secondary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>

                {!isView && (
                  <button
                    type="button"
                    onClick={() => setShowModal(true)}
                    className="flex items-center justify-center w-11 h-11 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-all hover:scale-105 active:scale-95"
                    title="Add New Customer"
                  >
                    <CirclePlus size={20} />
                  </button>
                )}
              </div>

              {errors?.customer && (
                <p className="text-sm text-danger ml-1 flex items-center gap-1.5 animate-fade-in">
                  <span className="w-1 h-1 rounded-full bg-danger" />
                  {String(errors.customer.message)}
                </p>
              )}
            </div>

            {/* Notes Section */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-main ml-1">
                <FileText size={14} className="text-primary" />
                Notes
              </label>

              <textarea
                {...register("notes")}
                className={cn(
                  "w-full rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none",
                  "border-2 bg-white dark:bg-gray-800",
                  "focus:ring-2 focus:ring-offset-1",
                  "border-border-main focus:border-primary focus:ring-primary/20",
                  "placeholder:text-secondary/50",
                  "min-h-[100px]"
                )}
                rows={3}
                placeholder="Add any additional notes here..."
                disabled={isView}
              />
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

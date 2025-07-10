// components/forms/UserRequestForm.tsx
import React from 'react';
import { toast } from 'sonner';
import { formRequestProps } from '@/types';
import { cn } from '@/lib/utils/utils';
import { useCrudHandlers } from '@/lib/hooks/useCrudHandlers';
import { useCrudFormRequest } from "@/lib/hooks/useCrudFormRequest";

export default function CreateTenantForm(props: formRequestProps) {
  const { handleCancel } = useCrudHandlers('/tenants');
  const {alias, onSuccess, className, submitText, showCancelButton, defaultValues, mode} = props;

  const { form, onSubmit } = useCrudFormRequest({alias: alias!,defaultValues,
    onSuccess: (res) => { onSuccess?.(res);  toast.success("Tenant created successfully");}
  });

  return (
    <div className={`${className}`}>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

        <div className="mb-4">
          <label htmlFor="username" className="label">
            Username *
          </label>
          <input
            id="username"
            {...form.register("username", { required: true })}
            placeholder="Username..."
            disabled={mode === 'edit'}
            className={cn("input-text", mode === "edit" && "input-disabled")}
          />
          {form.formState.errors.username && (
            <p className="error-text">
              {form.formState.errors.username?.message as string}
            </p>
          )}
        </div>
        
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={form.formState.isSubmitting}
            className={`btn btn-primary ${form.formState.isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
          >
            {form.formState.isSubmitting ? 'Saving...' : submitText}
          </button>

          {showCancelButton && (
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          )}
        </div>
        {form.formState.errors.root && (
        <p className="error-text">
          {form.formState.errors.root.message as string}
        </p>
      )}
      </form>
    </div>
  );
}
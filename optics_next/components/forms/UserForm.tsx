// components/forms/UserRequestForm.tsx
import React from 'react';
import { toast } from 'sonner';
import { formRequestProps } from '@/types';
import { cn } from '@/lib/utils/utils';
import { useCrudHandlers } from '@/lib/hooks/useCrudHandlers';
import { useCrudFormRequest } from "@/lib/hooks/useCrudFormRequest";

export default function CreateUserForm(props: formRequestProps) {
  const { handleCancel } = useCrudHandlers('/users');
  const {alias, onSuccess, className, submitText, showCancelButton, defaultValues, mode} = props;

  const { form, onSubmit } = useCrudFormRequest({alias: alias!,defaultValues,
    onSuccess: (res) => { onSuccess?.(res);  toast.success("User created successfully");}
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


        <div className="mb-4">
          <label htmlFor="email" className="label">
            Email *
          </label>
          <input
            id="email"
            type="email"
            {...form.register("email")}

            className={cn("input-text", mode === "edit" && "input-disabled")}
            placeholder="Email..."
            disabled={mode === 'edit'}
          />
          {form.formState.errors.email && (
            <p className="error-text">{form.formState.errors.email?.message as string}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="first_name" className="label">
            First name
          </label>
          <input
            id="first_name"
            {...form.register("first_name")}
            className={cn("input-text")}
            placeholder="First name..."
          />
          {form.formState.errors.first_name && (
            <p className="error-text">{form.formState.errors.first_name?.message as string}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="last_name" className="label">
            Last name
          </label>
          <input
            id="last_name"
            {...form.register("last_name")}
            className={cn("input-text")}
            placeholder="Last name..."
          />
          {form.formState.errors.last_name && (
            <p className="error-text">{form.formState.errors.last_name?.message as string}</p>
          )}
        </div>

        <div className="mb-4">
          <div className="flex items-center space-x-2">
            <input
              id="is_active"
              type="checkbox"
              {...form.register("is_active")}
              className="input-checkbox"
            />
            <label htmlFor="is_active" className="label">
              Is active
            </label>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center space-x-2">
            <input
              id="is_staff"
              type="checkbox"
              {...form.register("is_staff")}
              className={cn("input-checkbox")}
            />
            <label htmlFor="is_staff" className="label">
              Is staff
            </label>
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="role" className="label">
            Role
          </label>
          <select
            id="role"
            {...form.register("role")}
            className="input-text"
          >
            <option value="">Select...</option>
            <option value="ADMIN">ADMIN</option>
            <option value="BRANCH_MANAGER">BRANCH_MANAGER</option>
            <option value="TECHNICIAN">TECHNICIAN</option>
            <option value="SALESPERSON">SALESPERSON</option>
            <option value="ACCOUNTANT">ACCOUNTANT</option>
            <option value="INVENTORY_MANAGER">INVENTORY_MANAGER</option>
            <option value="RECEPTIONIST">RECEPTIONIST</option>
            <option value="CRM">CRM</option>
          </select>
          {form.formState.errors.role && (
            <p className="error-text">{form.formState.errors.role?.message as string}</p>
          )}
        </div>

        {/* Password فقط في وضع الإنشاء */}
        {mode === 'create' && (
          <div className="mb-4">
            <label htmlFor="password" className="label">
              Password *
            </label>
            <input
              id="password"
              type="password"
              {...form.register("password")}
              className="input-text"
              placeholder="Password..."
            />
            {form.formState.errors.password && (
              <p className="error-text">{form.formState.errors.password?.message as string}</p>
            )}
          </div>
        )}

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


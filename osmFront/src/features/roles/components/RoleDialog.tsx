"use client";
import React, { useEffect } from "react";
import { Role } from "../types";
import { useApiForm } from "@/src/shared/hooks/useApiForm";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { X, Save, Shield } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/shared/components/shadcn/ui/form";

interface RoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  onSuccess: () => void;
}

export const RoleDialog = ({
  isOpen,
  onClose,
  role,
  onSuccess,
}: RoleDialogProps) => {
  const isEdit = !!role;

  const form = useApiForm({
    alias: isEdit ? "users_roles_update" : "users_roles_create",
    defaultValues: {
      name: role?.name || "",
      description: role?.description || "",
      is_active: role?.is_active ?? true,
      permission_ids: role?.permissions?.map((p) => p.id) || [],
      id: role?.id,
    },
    onSuccess: () => {
      onSuccess();
      onClose();
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: role?.name || "",
        description: role?.description || "",
        is_active: role?.is_active ?? true,
        permission_ids: role?.permissions?.map((p) => p.id) || [],
        id: role?.id,
      });
    }
  }, [role, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await form.submitForm();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-elevated w-full max-w-md rounded-2xl border border-border-main/50 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-border-main/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-primary/10 rounded-lg text-primary">
              <Shield size={20} />
            </span>
            <h3 className="text-xl font-bold text-main">
              {role ? "Edit Role" : "Create New Role"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-elevated-hover rounded-lg transition-colors"
          >
            <X size={20} className="text-secondary" />
          </button>
        </div>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-secondary uppercase">
                    Role Name
                  </FormLabel>
                  <FormControl>
                    <input
                      {...field}
                      required
                      className="w-full px-4 py-2 bg-main-bg border border-border-main/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-main transition-all"
                      placeholder="e.g. Sales Manager"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-secondary uppercase">
                    Description
                  </FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      className="w-full px-4 py-2 bg-main-bg border border-border-main/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-main transition-all min-h-[100px]"
                      placeholder="What can this role do?"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-3 space-y-0 pt-2">
                  <FormControl>
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={field.value}
                      onChange={field.onChange}
                      className="w-4 h-4 rounded border-border-main/50 text-primary focus:ring-primary"
                    />
                  </FormControl>
                  <FormLabel
                    htmlFor="is_active"
                    className="text-sm font-medium text-main cursor-pointer"
                  >
                    Is Active
                  </FormLabel>
                </FormItem>
              )}
            />

            <div className="pt-6 flex gap-3">
              <ActionButton
                type="button"
                variant="ghost"
                label="Cancel"
                className="flex-1"
                onClick={onClose}
              />
              <ActionButton
                type="submit"
                variant="primary"
                label={form.isBusy ? "Saving..." : "Save Role"}
                icon={<Save size={18} />}
                className="flex-3"
                disabled={form.isBusy}
              />
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

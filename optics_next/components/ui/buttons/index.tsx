"use client";
import React from "react";
import { cn } from "@/lib/utils/cn"; 
import { ButtonProps } from "@/types";
import { useRouter } from "@/app/i18n/navigation";
/**
 * Renders a customizable action button that can perform CRUD operations or navigation.
 *
 * @remarks
 * This component is useful for triggering actions such as delete, edit, or navigation within your application.
 * You can provide an icon, label, and optionally an `onCrud` function for CRUD logic, or a `navigateTo` path for navigation.
 *
 * @example
 * // Example: Delete action with CRUD logic
 * <ActionButton
 *   label="Delete"
 *   icon={<TrashIcon />}
 *   onCrud={() =>
 *     crud.submit(
 *       'softDeleteAlias',
 *       'Item deleted',
 *       'Failed to delete',
 *       { id: page.id, is_deleted: true }
 *     )
 *   }
 * />
 *
 * // Example: Edit action with navigation
 * <ActionButton
 *   label="Edit"
 *   icon={<EditIcon />}
 *   navigateTo={`/pages?id=${page.id}&action=edit`}
 * />
 *
 * @param label - The button text label.
 * @param icon - The icon element to display in the button.
 * @param className - Additional CSS classes for styling.
 * @param type - The button type (default is "button").
 * @param title - The tooltip text for the button.
 * @param disabled - Whether the button is disabled.
 * @param onCrud - Optional callback for CRUD operations.
 * @param navigateTo - Optional path for navigation on click.
 */

  const variantClasses = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    danger: "btn-danger",
    success: "btn-success",
    info: "btn-info",
    outline: "btn-outline",
    link: "btn-link",
    reset: "btn-reset",
    cancel: "btn-cancel",
    close: "btn-close",

  };
export function ActionButton({
  label,
  icon,
  variant = "primary",
  className = "",
  type = "button",
  title,
  disabled,
  onCrud,      // دالة CRUD
  navigateTo,  // path للـ navigation
}: ButtonProps & {
  onCrud?: () => void;
  navigateTo?: string;
}) {
  const router = useRouter();
  const handleClick = async () => {
    if (onCrud) await onCrud();
    if (navigateTo) router.push(navigateTo);
  };

  return (
    <button
      onClick={handleClick}
      type={type}
      title={title}
      disabled={disabled}
      className={cn("btn cursor-pointer", variantClasses[variant], className)}
    >
      {icon}
      {label}
    </button>
  );
}



{/* <ActionButton
  label="Delete"
  icon={<TrashIcon />}
  onCrud={() =>
    crud.submit(
      'softDeleteAlias',
      'Item deleted',
      'Failed to delete',
      { id: page.id, is_deleted: true }
    )
  }
/> */}

{/* <ActionButton
  label="Edit"
  icon={<EditIcon />}
  navigateTo={`/pages?id=${page.id}&action=edit`}
/> */}

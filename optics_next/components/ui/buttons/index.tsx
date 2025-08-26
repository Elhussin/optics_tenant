// "use client";
// import React from "react";
// import { cn } from "@/lib/utils/cn"; 
// import { ButtonProps } from "@/types";
// import { useRouter } from "@/app/i18n/navigation";
// /**
//  * Renders a customizable action button that can perform CRUD operations or navigation.
//  *
//  * @remarks
//  * This component is useful for triggering actions such as delete, edit, or navigation within your application.
//  * You can provide an icon, label, and optionally an `onCrud` function for CRUD logic, or a `navigateTo` path for navigation.
//  *
//  * @example
//  * // Example: Delete action with CRUD logic
//  * <ActionButton
//  *   label="Delete"
//  *   icon={<TrashIcon />}
//  *   onCrud={() =>
//  *     crud.submit(
//  *       'softDeleteAlias',
//  *       'Item deleted',
//  *       'Failed to delete',
//  *       { id: page.id, is_deleted: true }
//  *     )
//  *   }
//  * />
//  *
//  * // Example: Edit action with navigation
//  * <ActionButton
//  *   label="Edit"
//  *   icon={<EditIcon />}
//  *   navigateTo={`/pages?id=${page.id}&action=edit`}
//  * />
//  *
//  * @param label - The button text label.
//  * @param icon - The icon element to display in the button.
//  * @param className - Additional CSS classes for styling.
//  * @param type - The button type (default is "button").
//  * @param title - The tooltip text for the button.
//  * @param disabled - Whether the button is disabled.
//  * @param onCrud - Optional callback for CRUD operations.
//  * @param navigateTo - Optional path for navigation on click.
//  */

//   const variantClasses = {
//     primary: "btn-primary",
//     secondary: "btn-secondary",
//     danger: "btn-danger",
//     success: "btn-success",
//     info: "btn-info",
//     outline: "btn-outline",
//     link: "btn-link",
//     reset: "btn-reset",
//     cancel: "btn-cancel",
//     close: "btn-close",
//     warning: "btn-warning",

//   };
// // export function ActionButton({
// //   label,
// //   icon,
// //   variant = "primary",
// //   className = "",
// //   type = "button",
// //   title,
// //   disabled,
// //   onCrud,
// //   navigateTo,
// // }: ButtonProps) {
// //   const router = useRouter();

// //   const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
// //     // لو onCrud متعرفة ننفذها ونمرر أي event
// //     if (onCrud) await onCrud(e);

// //     // لو في navigation
// //     if (navigateTo) router.push(navigateTo);
// //   };

// //   return (
// //     <button
// //       onClick={handleClick}
// //       type={type}
// //       title={title}
// //       disabled={disabled}
// //       className={cn("btn cursor-pointer", variantClasses[variant], className)}
// //     >
// //       {icon}
// //       {label}
// //     </button>
// //   );
// // }

// export function ActionButton({
//   label,
//   icon,
//   variant = "primary",
//   className = "",
//   type = "button",
//   title,
//   disabled,
//   onCrud,
//   navigateTo,
// }: ButtonProps) {
//   const router = useRouter();

//   const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
//     // لو مش زر submit ننفذ الكليك عادي
//     if (type === "submit") return;

//     if (onCrud) await onCrud(e);
//     if (navigateTo) router.push(navigateTo);
//   };

//   return (
//     <button
//       onClick={handleClick}
//       type={type}
//       title={title}
//       disabled={disabled}
//       className={cn("btn cursor-pointer", variantClasses[variant], className)}
//     >
//       {icon}
//       {label}
//     </button>
//   );
// }


// {/* <ActionButton
//   label="Delete"
//   icon={<TrashIcon />}
//   onCrud={() =>
//     crud.submit(
//       'softDeleteAlias',
//       'Item deleted',
//       'Failed to delete',
//       { id: page.id, is_deleted: true }
//     )
//   }
// /> */}

// {/* <ActionButton
//   label="Edit"
//   icon={<EditIcon />}
//   navigateTo={`/pages?id=${page.id}&action=edit`}
// /> */}

"use client";
import React from "react";
import { cn } from "@/lib/utils/cn"; 
import { ButtonProps } from "@/types";
import { useRouter } from "@/app/i18n/navigation";
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
    warning: "btn-warning",

  };



export function ActionButton({
  label,
  icon,
  variant = "primary",
  className = "",
  type = "button",
  title,
  disabled,
  onClick,
  onCrud,
  navigateTo,
}: ButtonProps) {
  const router = useRouter();

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    // لو الزر submit → نسيب التحكم للفورم (preventDefault هيتعامل معه هناك)
    if (type === "submit") {
      if (onClick) await onClick(e); // لو حابب تضيف extra logic مع submit
      return;
    }

    // لو onClick موجود → ننفذه
    if (onClick) await onClick(e);

    // لو onCrud موجود → ننفذه
    if (onCrud) await onCrud(e);

    // لو في navigation → ننفذه
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



{/* <form onSubmit={handleSubmit}>
  <ActionButton 
    label="Search" 
    icon={<Search size={16} />} 
    type="submit" 
  />
</form>
<ActionButton
  label="Delete"
  icon={<TrashIcon />}
  onCrud={() =>
    crud.submit("softDeleteAlias", "Item deleted", "Failed to delete", {
      id: page.id,
      is_deleted: true,
    })
  }
/>
<ActionButton 
  label="Go to Home" 
  navigateTo="/home" 
  icon={<HomeIcon />} 
/>
<ActionButton 
  label="Click me" 
  onClick={() => console.log("Clicked!")} 
/> */}

// import { toast } from "sonner";


// const shownToasts = new Set<string>();

// /**
//  *  SHOWN TOAST WITH UNIQUE ID
//  *
//  * @param message - message to show
//  * @param options - options for toast
//  */
// export function safeToast(
//   message: string,
//   options?: {
//     id?: string;
//     description?: string;
//     duration?: number;
//     type?: "success" | "error" | "warning" | "info";
//   }
// ) {
//   const id = options?.id || message;

//   if (shownToasts.has(id)) return;

//   shownToasts.add(id);

//   toast(message, {
//     id,
//     description: options?.description,
//     duration: options?.duration || 4000,
//   });

//   setTimeout(() => {
//     shownToasts.delete(id);
//   }, options?.duration || 4000);
// }


// import { toast } from "sonner";
// const typeClasses: Record<string, string> = {
//   success: "bg-green-600 text-white",
//   error: "bg-red-600 text-white",
//   warning: "bg-yellow-500 text-black",
//   info: "bg-blue-500 text-white",
// };

// const shownToasts = new Set<string>();
// const timeouts = new Map<string, NodeJS.Timeout>();

// export function safeToast(
//   message: string,
//   options?: {
//     id?: string;
//     description?: string;
//     duration?: number;
//     type?: "success" | "error" | "warning" | "info";
//    className?: string;
//   }
// ) {
//   const id = options?.id || message || `${Date.now()}-${Math.random()}`;

//   if (shownToasts.has(id)) return;
//   shownToasts.add(id);

//   const duration = options?.duration ?? 50000;

//   const className =
//     options?.className || (options?.type ? typeClasses[options.type] : "");
  
//   toast(message, {
//     id,
//     description: options?.description,
//     duration,
//     className, 
//   });
//   // ⏲ تنظيف بعد انتهاء المدة
//   const timeout = setTimeout(() => {
//     shownToasts.delete(id);
//     timeouts.delete(id);
//   }, duration);

//   timeouts.set(id, timeout);
// }

// export function clearToasts() {
//   // نمسح IDs كلها من الـ Set
//   shownToasts.clear();

//   // نوقف كل التايمرز
//   for (const timeout of timeouts.values()) {
//     clearTimeout(timeout);
//   }
//   timeouts.clear();

//   // نمسح كل التوستات من sonner
//   toast.dismiss(); // دي built-in من sonner
// }

import { toast } from "sonner";

const shownToasts = new Set<string>();
const timeouts = new Map<string, NodeJS.Timeout>();

export function safeToast(
  message: string,
  options?: {
    id?: string;
    description?: string;
    duration?: number;
    type?: "success" | "error" | "warning" | "info";
  }
) {
  const id = options?.id || message || `${Date.now()}-${Math.random()}`;

  if (shownToasts.has(id)) return;
  shownToasts.add(id);

  const duration = options?.duration ?? 5000; 
  clearToasts();
  toast(message, {
    id,
    description: options?.description,
    duration,
    ...options, 
  });

  const timeout = setTimeout(() => {
    shownToasts.delete(id);
    timeouts.delete(id);
  }, duration);

  timeouts.set(id, timeout);
}

export function clearToasts() {
  shownToasts.clear();

  for (const timeout of timeouts.values()) {
    clearTimeout(timeout);
  }
  timeouts.clear();

  toast.dismiss();
}

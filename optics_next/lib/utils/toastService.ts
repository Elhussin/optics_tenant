import { toast } from "sonner";


const shownToasts = new Set<string>();

/**
 *  SHOWN TOAST WITH UNIQUE ID
 *
 * @param message - message to show
 * @param options - options for toast
 */
export function safeToast(
  message: string,
  options?: {
    id?: string;
    description?: string;
    duration?: number;
    type?: "success" | "error" | "warning" | "info";
  }
) {
  const id = options?.id || message;

  if (shownToasts.has(id)) return;

  shownToasts.add(id);

  toast(message, {
    id,
    description: options?.description,
    duration: options?.duration || 4000,
  });

  setTimeout(() => {
    shownToasts.delete(id);
  }, options?.duration || 4000);
}

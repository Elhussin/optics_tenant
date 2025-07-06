import { clsx } from "clsx";

// أو غلفها باسم cn
export const cn = (...args: Parameters<typeof clsx>) => clsx(...args);


// lib/utils.ts
// export function cn(...classes: (string | false | null | undefined)[]) {
//     return classes.filter(Boolean).join(" ");
//   }
  
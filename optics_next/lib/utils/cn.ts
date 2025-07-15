import { clsx } from "clsx";

// أو غلفها باسم cn
export const cn = (...args: Parameters<typeof clsx>) => clsx(...args);


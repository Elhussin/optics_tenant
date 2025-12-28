import { Cairo, Inter } from "next/font/google";

export const cairo = Cairo({
    subsets: ["arabic"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-alt",
    display: "swap",
});

export const inter = Inter({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-main",
    display: "swap",
});

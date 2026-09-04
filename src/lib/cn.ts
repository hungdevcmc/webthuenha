import { twMerge } from "tailwind-merge";

/**
 * Nối class Tailwind. Dùng tailwind-merge để class truyền từ ngoài
 * ghi đè đúng class mặc định của component (ví dụ w-32 thắng w-full).
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return twMerge(classes.filter(Boolean).join(" "));
}

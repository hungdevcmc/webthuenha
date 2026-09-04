import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "accent" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 disabled:bg-brand-300",
  accent:
    "bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-700 disabled:bg-accent-500/50",
  secondary:
    "bg-white text-ink border border-stone-300 hover:bg-stone-50 active:bg-stone-100 disabled:text-stone-400",
  ghost: "bg-transparent text-ink hover:bg-stone-100 active:bg-stone-200 disabled:text-stone-400",
  danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:bg-red-300",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-11 px-4 text-sm gap-2",
  lg: "h-12 px-5 text-base gap-2",
};

export const buttonClasses = (variant: ButtonVariant = "primary", size: ButtonSize = "md", extra?: string) =>
  cn(
    "inline-flex items-center justify-center rounded-xl font-semibold whitespace-nowrap transition-colors disabled:cursor-not-allowed select-none",
    variantClass[variant],
    sizeClass[size],
    extra,
  );

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", size = "md", className, type = "button", ...props },
  ref,
) {
  return <button ref={ref} type={type} className={buttonClasses(variant, size, className)} {...props} />;
});

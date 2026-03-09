/* Minimal shadcn-style Button */
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "default" | "outline" | "ghost" | "destructive" | "secondary";
type ButtonSize = "default" | "sm" | "lg" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  children?: ReactNode;
}

export function Button({
  className = "",
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

  const variants: Record<ButtonVariant, string> = {
    default: "bg-emerald-600 text-white hover:bg-emerald-700",
    outline:
      "border border-slate-600 bg-transparent text-slate-100 hover:bg-slate-800 hover:text-white",
    ghost:
      "bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800",
    destructive: "bg-red-500 text-white hover:bg-red-600",
    secondary:
      "bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200",
  };

  const sizes: Record<ButtonSize, string> = {
    default: "h-9 px-4 py-2",
    sm: "h-8 px-3 text-xs",
    lg: "h-10 px-6",
    icon: "h-9 w-9",
  };

  const variantClass = variants[variant] ?? variants.default;
  const sizeClass = sizes[size] ?? sizes.default;

  return (
    <button
      className={`${base} ${variantClass} ${sizeClass} ${className}`}
      {...props}
    />
  );
}


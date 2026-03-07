/* Minimal shadcn-style Label */
import type { LabelHTMLAttributes, ReactNode } from "react";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  className?: string;
  children?: ReactNode;
}

export function Label({ className = "", ...props }: LabelProps) {
  const base =
    "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700 dark:text-slate-200";

  return <label className={`${base} ${className}`} {...props} />;
}


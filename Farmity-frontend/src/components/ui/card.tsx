/* Minimal shadcn-style Card */
import type { HTMLAttributes, ReactNode } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: ReactNode;
}

export function Card({ className = "", ...props }: CardProps) {
  const base =
    "rounded-xl bg-[#0F172A] text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50";
  return <div className={`${base} ${className}`} {...props} />;
}

export interface CardSectionProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: ReactNode;
}

export function CardHeader({ className = "", ...props }: CardSectionProps) {
  return (
    <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props} />
  );
}

export function CardTitle({ className = "", ...props }: CardSectionProps) {
  return (
    <h3
      className={`text-xl font-semibold leading-none tracking-tight ${className}`}
      {...props}
    />
  );
}

export function CardDescription({
  className = "",
  ...props
}: CardSectionProps) {
  return (
    <p
      className={`text-sm text-slate-500 dark:text-slate-400 ${className}`}
      {...props}
    />
  );
}

export function CardContent({ className = "", ...props }: CardSectionProps) {
  return <div className={`${className}`} {...props} />;
}


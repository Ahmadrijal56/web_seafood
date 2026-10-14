import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "coral" | "wa" | "brand" | "outline" | "ghost" | "white" | "navy";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  coral: "bg-coral text-white shadow-lg shadow-coral/25 hover:bg-coral-600",
  wa: "bg-wa text-white shadow-lg shadow-wa/25 hover:bg-wa-600",
  brand: "bg-brand-600 text-white hover:bg-brand-700",
  navy: "bg-navy text-white hover:bg-navy-950",
  outline: "border border-slate-200 bg-white text-navy hover:border-brand-300 hover:bg-brand-50",
  ghost: "text-navy hover:bg-brand-50",
  white: "bg-white text-navy shadow-lg hover:bg-brand-50",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-13 px-6 text-base gap-2",
};

export function buttonClass(variant: Variant = "coral", size: Size = "md", className?: string) {
  return cn(
    "inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none",
    variants[variant],
    sizes[size],
    className,
  );
}

export function Button({
  variant,
  size,
  className,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}

export function ButtonLink({
  variant,
  size,
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  action,
  dark,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  action?: ReactNode;
  dark?: boolean;
}) {
  return (
    <div className={cn("mb-8 flex flex-col gap-4 sm:mb-10", align === "center" ? "items-center text-center" : "sm:flex-row sm:items-end sm:justify-between")}>
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow && (
          <p className={cn("mb-2 text-xs font-bold uppercase tracking-[0.18em]", dark ? "text-cyan" : "text-brand-600")}>{eyebrow}</p>
        )}
        <h2 className={cn("text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl lg:text-4xl", dark ? "text-white" : "text-navy")}>
          {title}
        </h2>
        {description && <p className={cn("mt-3 text-base leading-relaxed", dark ? "text-brand-100/80" : "text-slate-600")}>{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold leading-none", className)}>
      {children}
    </span>
  );
}

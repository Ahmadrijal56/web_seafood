"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function QtyStepper({
  value,
  onChange,
  min,
  step,
  unit,
  size = "md",
}: {
  value: number;
  onChange: (value: number) => void;
  min: number;
  step: number;
  unit: string;
  size?: "sm" | "md";
}) {
  const btn = cn(
    "grid cursor-pointer place-items-center rounded-full bg-white text-navy shadow-sm ring-1 ring-slate-200 transition hover:bg-brand-50 disabled:opacity-40",
    size === "sm" ? "size-7" : "size-9",
  );
  return (
    <div className={cn("inline-flex items-center gap-1 rounded-full bg-slate-100 p-1", size === "sm" ? "text-sm" : "text-base")}>
      <button type="button" className={btn} onClick={() => onChange(Math.max(min, value - step))} disabled={value <= min} aria-label="Kurangi">
        <Minus className="size-3.5" strokeWidth={3} />
      </button>
      <span className={cn("text-center font-bold tabular-nums text-navy", size === "sm" ? "min-w-14" : "min-w-16")}>
        {value.toLocaleString("id-ID", { maximumFractionDigits: 2 })} {unit}
      </span>
      <button type="button" className={btn} onClick={() => onChange(value + step)} aria-label="Tambah">
        <Plus className="size-3.5" strokeWidth={3} />
      </button>
    </div>
  );
}

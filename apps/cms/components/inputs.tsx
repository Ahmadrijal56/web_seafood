"use client";

import { cn } from "@/lib/utils";

export function RupiahInput({ value, onChange, placeholder, suffix }: { value: string; onChange: (v: string) => void; placeholder?: string; suffix?: string }) {
  const display = value ? Number(value).toLocaleString("id-ID") : "";
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
      <input
        className={cn("input pl-9", suffix && "pr-10")}
        inputMode="numeric"
        value={display}
        placeholder={placeholder ?? "0"}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
      />
      {suffix && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">{suffix}</span>}
    </div>
  );
}

export function Segmented<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <div className="flex rounded-xl bg-slate-100 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn("flex-1 whitespace-nowrap rounded-lg px-2 py-1.5 text-sm font-bold transition", value === o.value ? "bg-white text-navy shadow-sm" : "text-slate-500")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

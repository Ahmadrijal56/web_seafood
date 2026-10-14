"use client";

import { openStatus, type OpeningHours } from "@sfs/shared";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function OpenStatus({ hours, className, dark }: { hours: OpeningHours; className?: string; dark?: boolean }) {
  const [status, setStatus] = useState<ReturnType<typeof openStatus> | null>(null);

  useEffect(() => {
    const update = () => setStatus(openStatus(hours));
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [hours]);

  if (!status) return <span className={cn("inline-block h-6 w-40 animate-pulse rounded-full bg-current/10", className)} />;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold",
        status.isOpen
          ? dark
            ? "bg-emerald-400/15 text-emerald-300"
            : "bg-emerald-50 text-emerald-700"
          : dark
            ? "bg-white/10 text-brand-100"
            : "bg-slate-100 text-slate-600",
        className,
      )}
    >
      <span className="relative flex size-2">
        {status.isOpen && <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />}
        <span className={cn("relative inline-flex size-2 rounded-full", status.isOpen ? "bg-emerald-500" : "bg-slate-400")} />
      </span>
      {status.label}
    </span>
  );
}

"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

function diff(target: number) {
  const ms = Math.max(0, target - Date.now());
  return {
    d: Math.floor(ms / 86_400_000),
    h: Math.floor((ms / 3_600_000) % 24),
    m: Math.floor((ms / 60_000) % 60),
    s: Math.floor((ms / 1000) % 60),
    done: ms === 0,
  };
}

export function Countdown({ endsAt, className }: { endsAt: string; className?: string }) {
  const target = new Date(endsAt).getTime();
  const [left, setLeft] = useState<ReturnType<typeof diff> | null>(null);

  useEffect(() => {
    setLeft(diff(target));
    const id = setInterval(() => setLeft(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const units = left
    ? [
        { v: left.d, l: "hari" },
        { v: left.h, l: "jam" },
        { v: left.m, l: "mnt" },
        { v: left.s, l: "dtk" },
      ]
    : [];

  if (left?.done) return <span className={cn("text-sm font-bold", className)}>Promo berakhir</span>;

  return (
    <div className={cn("flex items-center gap-1.5", className)} aria-label="Sisa waktu promo">
      {(left ? units : Array.from({ length: 4 }, () => ({ v: 0, l: "" }))).map((u, i) => (
        <div key={i} className="min-w-12 rounded-lg bg-white/15 px-2 py-1 text-center backdrop-blur">
          <div className="text-lg font-extrabold tabular-nums leading-tight">{String(u.v).padStart(2, "0")}</div>
          <div className="text-[10px] uppercase tracking-wide opacity-80">{u.l || "\u00a0"}</div>
        </div>
      ))}
    </div>
  );
}

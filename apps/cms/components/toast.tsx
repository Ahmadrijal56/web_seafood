"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type ToastItem = { id: number; message: string; tone: "success" | "error" };
type ToastFn = (message: string, tone?: ToastItem["tone"]) => void;

const ToastContext = createContext<ToastFn>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const toast = useCallback<ToastFn>((message, tone = "success") => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), tone === "error" ? 6000 : 3000);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4">
        {items.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cn(
              "pointer-events-auto flex max-w-md animate-slide-up items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-xl",
              t.tone === "success" ? "bg-navy" : "bg-rose-600",
            )}
          >
            {t.tone === "success" ? <CheckCircle2 className="size-5 text-emerald-300" /> : <XCircle className="size-5" />}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

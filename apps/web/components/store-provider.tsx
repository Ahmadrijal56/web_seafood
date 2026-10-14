"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { StoreSettings } from "@sfs/shared";
import type { ProductSummary } from "@/lib/product";

interface StoreContextValue {
  settings: StoreSettings;
  suggestions: ProductSummary[];
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ value, children }: { value: StoreContextValue; children: ReactNode }) {
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore harus di dalam StoreProvider");
  return ctx;
}

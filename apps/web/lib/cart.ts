"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { unitPriceFor } from "@sfs/shared";

export interface CartLine {
  key: string;
  kind: "product" | "bundle";
  id: string;
  slug: string;
  name: string;
  sizeLabel: string | null;
  image: string | null;
  /** kg untuk produk, jumlah paket untuk bundle */
  qty: number;
  minQty: number;
  processingId: string | null;
  processingLabel: string | null;
  extraPrice: number;
  notes: string;
  showPrice: boolean;
  pricePerKg: number | null;
  tiers: { min_kg: number; price_per_kg: number }[];
}

interface CartState {
  lines: CartLine[];
  open: boolean;
  lastAddedKey: string | null;
  add: (line: Omit<CartLine, "key">) => void;
  update: (key: string, patch: Partial<Pick<CartLine, "qty" | "notes">>) => void;
  remove: (key: string) => void;
  clear: () => void;
  setOpen: (open: boolean) => void;
}

function lineKey(line: Pick<CartLine, "kind" | "id" | "processingId">) {
  return `${line.kind}:${line.id}:${line.processingId ?? "-"}`;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      open: false,
      lastAddedKey: null,
      add: (input) =>
        set((state) => {
          const key = lineKey(input);
          const existing = state.lines.find((l) => l.key === key);
          const lines = existing
            ? state.lines.map((l) => (l.key === key ? { ...l, qty: roundQty(l.qty + input.qty), notes: input.notes || l.notes } : l))
            : [...state.lines, { ...input, key }];
          return { lines, lastAddedKey: key };
        }),
      update: (key, patch) =>
        set((state) => ({
          lines: state.lines.map((l) =>
            l.key === key ? { ...l, ...patch, qty: patch.qty != null ? Math.max(l.minQty, roundQty(patch.qty)) : l.qty } : l,
          ),
        })),
      remove: (key) => set((state) => ({ lines: state.lines.filter((l) => l.key !== key) })),
      clear: () => set({ lines: [] }),
      setOpen: (open) => set({ open }),
    }),
    {
      name: "sfs-cart",
      version: 1,
      partialize: (state) => ({ lines: state.lines }),
    },
  ),
);

export function roundQty(value: number) {
  return Math.round(value * 100) / 100;
}

export function lineUnitPrice(line: CartLine, globalShowPrices: boolean): number | null {
  if (!globalShowPrices || !line.showPrice || line.pricePerKg == null) return null;
  if (line.kind === "bundle") return line.pricePerKg;
  return unitPriceFor({ show_price: true, price_per_kg: line.pricePerKg }, line.tiers, line.qty);
}

export function lineTotal(line: CartLine, globalShowPrices: boolean): number | null {
  const unit = lineUnitPrice(line, globalShowPrices);
  if (unit == null) return null;
  return Math.round((unit + (line.kind === "product" ? line.extraPrice : 0)) * line.qty);
}

export function cartSummary(lines: CartLine[], globalShowPrices: boolean) {
  let subtotal = 0;
  let unpriced = 0;
  for (const line of lines) {
    const total = lineTotal(line, globalShowPrices);
    if (total == null) unpriced++;
    else subtotal += total;
  }
  return { subtotal, unpriced, count: lines.length };
}

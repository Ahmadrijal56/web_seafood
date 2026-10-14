import type { PriceTier, Product } from "./types";

type Priced = Pick<Product, "show_price" | "price_per_kg">;

export function hasPrice(product: Priced, globalShowPrices = true): boolean {
  return globalShowPrices && product.show_price && product.price_per_kg != null;
}

/** Harga per kg sesuai tingkat grosir untuk berat tertentu. */
export function unitPriceFor(
  product: Priced,
  tiers: Pick<PriceTier, "min_kg" | "price_per_kg">[] | undefined,
  qtyKg: number,
): number | null {
  if (product.price_per_kg == null) return null;
  const tier = [...(tiers ?? [])]
    .sort((a, b) => b.min_kg - a.min_kg)
    .find((t) => t.min_kg <= qtyKg);
  return tier ? tier.price_per_kg : product.price_per_kg;
}

/** Tingkat harga lengkap termasuk harga dasar, urut dari berat terkecil. */
export function priceLadder(
  product: Priced,
  tiers: Pick<PriceTier, "min_kg" | "price_per_kg">[] | undefined,
): { minKg: number; maxKg: number | null; price: number }[] {
  if (product.price_per_kg == null) return [];
  const sorted = [...(tiers ?? [])].sort((a, b) => a.min_kg - b.min_kg);
  if (sorted.length === 0) return [];
  const steps = [{ min_kg: 0, price_per_kg: product.price_per_kg }, ...sorted.filter((t) => t.min_kg > 0)];
  return steps.map((step, i) => {
    const next = steps[i + 1];
    return {
      minKg: i === 0 ? 0 : step.min_kg,
      maxKg: next ? next.min_kg : null,
      price: step.price_per_kg,
    };
  });
}

export function lowestPrice(
  product: Priced,
  tiers: Pick<PriceTier, "min_kg" | "price_per_kg">[] | undefined,
): number | null {
  if (product.price_per_kg == null) return null;
  return Math.min(product.price_per_kg, ...(tiers ?? []).map((t) => t.price_per_kg));
}

export function discountPercent(price: number | null, compare: number | null): number | null {
  if (!price || !compare || compare <= price) return null;
  return Math.round(((compare - price) / compare) * 100);
}

export interface FreeShippingProgress {
  threshold: number;
  remaining: number;
  percent: number;
  reached: boolean;
}

export function freeShippingProgress(subtotal: number, threshold: number | null | undefined): FreeShippingProgress | null {
  if (!threshold || threshold <= 0) return null;
  const remaining = Math.max(0, threshold - subtotal);
  return {
    threshold,
    remaining,
    percent: Math.min(100, Math.round((subtotal / threshold) * 100)),
    reached: remaining === 0,
  };
}

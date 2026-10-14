import { lowestPrice, type Badge, type ProductWithRelations, type StockStatus, type ProductType } from "@sfs/shared";

/** Data ringkas produk untuk kartu, keranjang, dan filter katalog (aman dikirim ke client). */
export interface ProductSummary {
  id: string;
  slug: string;
  name: string;
  sizeLabel: string | null;
  shortDescription: string | null;
  categorySlug: string | null;
  categoryName: string | null;
  type: ProductType;
  image: string | null;
  image2: string | null;
  showPrice: boolean;
  pricePerKg: number | null;
  comparePrice: number | null;
  lowestPrice: number | null;
  tiers: { min_kg: number; price_per_kg: number }[];
  minOrderKg: number;
  stockStatus: StockStatus;
  badges: Badge[];
  isFeatured: boolean;
  soldCount: number;
  defaultProcessing: { id: string; label: string; extra: number } | null;
  updatedAt: string;
}

export function toSummary(p: ProductWithRelations): ProductSummary {
  const proc = p.product_options?.find((o) => o.kind === "processing");
  const tiers = (p.price_tiers ?? []).map((t) => ({ min_kg: Number(t.min_kg), price_per_kg: t.price_per_kg }));
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    sizeLabel: p.size_label,
    shortDescription: p.short_description,
    categorySlug: p.category?.slug ?? null,
    categoryName: p.category?.name ?? null,
    type: p.type,
    image: p.product_images?.[0]?.url ?? null,
    image2: p.product_images?.[1]?.url ?? null,
    showPrice: p.show_price,
    pricePerKg: p.price_per_kg,
    comparePrice: p.compare_price,
    lowestPrice: tiers.length ? lowestPrice(p, tiers) : null,
    tiers,
    minOrderKg: Number(p.min_order_kg),
    stockStatus: p.stock_status,
    badges: p.badges ?? [],
    isFeatured: p.is_featured,
    soldCount: p.sold_count,
    defaultProcessing: proc ? { id: proc.id, label: proc.label, extra: proc.extra_price } : null,
    updatedAt: p.updated_at,
  };
}

export function defaultQty(minOrderKg: number) {
  return Math.max(1, minOrderKg);
}

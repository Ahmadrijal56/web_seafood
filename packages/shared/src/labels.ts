import type { Badge, OrderStatus, ProductType, StockStatus } from "./types";

export const BADGE_LABELS: Record<Badge, string> = {
  today_catch: "Tangkapan Hari Ini",
  best_seller: "Best Seller",
  promo: "Promo",
  limited: "Stok Terbatas",
};

export const STOCK_LABELS: Record<StockStatus, string> = {
  available: "Tersedia",
  limited: "Terbatas",
  out: "Habis",
};

export const TYPE_LABELS: Record<ProductType, string> = {
  fresh: "Fresh",
  frozen: "Frozen",
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: "Baru",
  confirmed: "Dikonfirmasi",
  shipped: "Dikirim",
  done: "Selesai",
  cancelled: "Batal",
};

export const DEFAULT_WEIGHTS = [0.5, 1, 2, 5];

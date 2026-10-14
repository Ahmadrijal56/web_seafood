import type { OpeningHours } from "./hours";

export interface StoreSettings {
  store_name: string;
  tagline: string;
  whatsapp: string;
  address: string;
  maps_url: string;
  maps_embed_url: string;
  hours: OpeningHours;
  socials: { instagram: string; youtube: string; tiktok: string };
  guarantee: { fresh: string; weight: string };
  trust: { since: number; customers: string; partners: string; rating: string };
  show_prices: boolean;
  free_shipping_min: number | null;
  today_price_note: string;
  legal: { nib: string; halal: string; other: string };
  pixels: { ga4: string; meta: string; tiktok: string };
  announcement: string;
}

export const DEFAULT_SETTINGS: StoreSettings = {
  store_name: "Syauqi Fresh Seafood",
  tagline: "Seafood segar langsung dari TPI Muara Angke",
  whatsapp: "6287734112384",
  address: "TPI Muara Angke Blok A No. 67–70, Pluit, Penjaringan, Jakarta Utara",
  maps_url: "https://maps.google.com/?q=TPI+Muara+Angke+Jakarta+Utara",
  maps_embed_url: "https://maps.google.com/maps?q=TPI%20Muara%20Angke%2C%20Pluit%2C%20Jakarta%20Utara&z=16&output=embed",
  hours: { open: "04:00", close: "16:00", days: [0, 1, 2, 3, 4, 5, 6] },
  socials: {
    instagram: "https://www.instagram.com/syauqifreshseafood/",
    youtube: "https://youtube.com/@syauqifreshseafood",
    tiktok: "https://www.tiktok.com/@syauqifreshseafood",
  },
  guarantee: {
    fresh: "Tidak segar saat diterima? Kami ganti baru atau uang kembali.",
    weight: "Berat bersih sesuai pesanan — ditimbang & divideokan sebelum dikirim.",
  },
  trust: { since: 2021, customers: "5.000+", partners: "120+", rating: "4,9" },
  show_prices: true,
  free_shipping_min: 300000,
  today_price_note: "Harga mengikuti hasil lelang TPI pagi ini",
  legal: { nib: "NIB 91200xxxxxxx (contoh)", halal: "", other: "" },
  pixels: { ga4: "", meta: "", tiktok: "" },
  announcement: "🚚 Order sebelum jam 12.00 — dikirim hari ini se-Jabodetabek",
};

export type SettingKey = keyof StoreSettings;

export function mergeSettings(rows: { key: string; value: unknown }[] | null | undefined): StoreSettings {
  const result: StoreSettings = structuredClone(DEFAULT_SETTINGS);
  for (const row of rows ?? []) {
    if (!(row.key in result)) continue;
    const key = row.key as SettingKey;
    const fallback = result[key];
    if (fallback && typeof fallback === "object" && !Array.isArray(fallback) && row.value && typeof row.value === "object") {
      (result as unknown as Record<string, unknown>)[key] = { ...fallback, ...(row.value as object) };
    } else {
      (result as unknown as Record<string, unknown>)[key] = row.value;
    }
  }
  return result;
}

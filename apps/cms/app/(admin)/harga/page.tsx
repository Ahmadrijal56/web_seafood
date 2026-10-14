import { mergeSettings, type Category, type ProductWithRelations } from "@sfs/shared";
import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/supabase/server";
import { PriceBoard } from "./price-board";

export const metadata: Metadata = { title: "Update Harga" };

export default async function PricesPage() {
  const { supabase } = await requireAdmin();
  const [{ data: products }, { data: categories }, { data: settingsRows }] = await Promise.all([
    supabase.from("products").select("*, product_images(url, sort_order), price_tiers(*)").order("sort_order").order("name"),
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("settings").select("key, value").in("key", ["show_prices", "today_price_note"]),
  ]);
  const settings = mergeSettings(settingsRows);

  return (
    <div>
      <PageHeader
        title="Update Harga Hari Ini"
        description="Ubah harga, harga grosir & stok semua produk dalam satu layar — cocok dilakukan dari HP setelah lelang pagi."
      />
      <PriceBoard
        products={(products ?? []) as ProductWithRelations[]}
        categories={(categories ?? []) as Category[]}
        showPrices={settings.show_prices}
        note={settings.today_price_note}
      />
    </div>
  );
}

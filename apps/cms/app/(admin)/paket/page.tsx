import type { BundleWithItems, Product } from "@sfs/shared";
import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/supabase/server";
import { BundleManager } from "./bundle-manager";

export const metadata: Metadata = { title: "Paket Hemat" };

export default async function BundlesPage() {
  const { supabase } = await requireAdmin();
  const [{ data: bundles }, { data: products }] = await Promise.all([
    supabase.from("bundles").select("*, bundle_items(*)").order("sort_order").order("created_at"),
    supabase.from("products").select("id, name, size_label, price_per_kg, show_price").order("name"),
  ]);
  return (
    <div>
      <PageHeader title="Paket Hemat" description="Kombinasi produk dengan harga paket — menaikkan nilai belanja per pesanan." />
      <BundleManager
        bundles={(bundles ?? []) as BundleWithItems[]}
        products={(products ?? []) as Pick<Product, "id" | "name" | "size_label" | "price_per_kg" | "show_price">[]}
      />
    </div>
  );
}

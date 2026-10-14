import type { Category, ProductWithRelations } from "@sfs/shared";
import { Plus } from "lucide-react";
import type { Metadata } from "next";
import { ButtonLink, PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/supabase/server";
import { ProductList } from "./product-list";

export const metadata: Metadata = { title: "Produk" };

export default async function ProductsPage() {
  const { supabase } = await requireAdmin();
  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase
      .from("products")
      .select("*, category:categories(id, name, slug), product_images(id, url, sort_order), price_tiers(id)")
      .order("sort_order")
      .order("name"),
    supabase.from("categories").select("*").order("sort_order"),
  ]);

  return (
    <div>
      <PageHeader
        title="Produk"
        description={`${products?.length ?? 0} produk · klik produk untuk mengubah foto, harga, dan detail.`}
        actions={
          <ButtonLink href="/produk/baru">
            <Plus className="size-4" /> Tambah Produk
          </ButtonLink>
        }
      />
      <ProductList products={(products ?? []) as ProductWithRelations[]} categories={(categories ?? []) as Category[]} />
    </div>
  );
}

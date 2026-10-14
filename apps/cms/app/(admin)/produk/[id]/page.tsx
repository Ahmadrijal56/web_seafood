import type { Category, ProductWithRelations } from "@sfs/shared";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/supabase/server";
import { ProductForm } from "../product-form";

export const metadata: Metadata = { title: "Edit Produk" };

export default async function EditProductPage({ params }: PageProps<"/produk/[id]">) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const isNew = id === "baru";
  const [{ data: categories }, product] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    isNew
      ? Promise.resolve(null)
      : supabase
          .from("products")
          .select("*, product_images(*), price_tiers(*), product_options(*)")
          .eq("id", id)
          .maybeSingle()
          .then(({ data }) => data as ProductWithRelations | null),
  ]);
  if (!isNew && !product) notFound();

  return (
    <div>
      <PageHeader back={{ href: "/produk", label: "Semua produk" }} title={product?.name ?? "Tambah produk"} />
      <ProductForm key={product?.updated_at ?? "new"} product={product} categories={(categories ?? []) as Category[]} />
    </div>
  );
}

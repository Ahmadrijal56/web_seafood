import type { Metadata } from "next";
import { CategoryManager } from "@/components/managers";
import { PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Kategori" };

export default async function Page() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("categories").select("*").order("sort_order").order("created_at");
  const { data: products } = await supabase.from("products").select("category_id");
  const counts: Record<string, number> = {};
  for (const p of products ?? []) if (p.category_id) counts[p.category_id] = (counts[p.category_id] ?? 0) + 1;
  return (
    <div>
      <PageHeader title="Kategori" description="Kelompok produk di katalog & beranda. Urutan di sini = urutan tampil di website." />
      <CategoryManager items={data ?? []} counts={counts} />
    </div>
  );
}

import type { Metadata } from "next";
import { ArticleManager } from "@/components/managers";
import { PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Artikel & Berita" };

export default async function Page() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("articles").select("*").order("sort_order").order("published_at", { ascending: false });
  return (
    <div>
      <PageHeader
        title="Artikel & Berita"
        description="Upload berita, resep, dan tips. Artikel aktif tampil di /artikel; yang unggulan muncul di beranda."
      />
      <ArticleManager items={data ?? []} />
    </div>
  );
}

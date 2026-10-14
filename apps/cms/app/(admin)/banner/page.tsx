import type { Metadata } from "next";
import { BannerManager } from "@/components/managers";
import { PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Banner & Promo" };

export default async function Page() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("banners").select("*").order("sort_order").order("created_at");
  return (
    <div>
      <PageHeader title="Banner & Promo" description="Slider promo di beranda. Atur jadwal tampil & hitung mundur untuk promo terbatas." />
      <BannerManager items={data ?? []} />
    </div>
  );
}

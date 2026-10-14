import type { Metadata } from "next";
import { AreaManager } from "@/components/managers";
import { PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Area & Ongkir" };

export default async function Page() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("shipping_areas").select("*").order("sort_order").order("id");
  return (
    <div>
      <PageHeader title="Area & Ongkir" description="Pilihan area di checkout beserta ongkir & batas gratis ongkir." />
      <AreaManager items={data ?? []} />
    </div>
  );
}

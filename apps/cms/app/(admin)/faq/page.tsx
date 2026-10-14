import type { Metadata } from "next";
import { FaqManager } from "@/components/managers";
import { PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "FAQ" };

export default async function Page() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("faqs").select("*").order("sort_order").order("id");
  return (
    <div>
      <PageHeader title="FAQ" description="Pertanyaan yang sering ditanyakan. 5 teratas tampil di beranda." />
      <FaqManager items={data ?? []} />
    </div>
  );
}

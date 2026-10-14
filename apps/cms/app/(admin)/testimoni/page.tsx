import type { Metadata } from "next";
import { TestimonialManager } from "@/components/managers";
import { PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Testimoni" };

export default async function Page() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("testimonials").select("*").order("sort_order").order("created_at");
  return (
    <div>
      <PageHeader title="Testimoni" description="Ulasan pelanggan yang tampil di beranda & halaman Testimoni." />
      <TestimonialManager items={data ?? []} />
    </div>
  );
}

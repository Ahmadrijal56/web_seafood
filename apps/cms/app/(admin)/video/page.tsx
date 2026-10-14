import type { Metadata } from "next";
import { VideoManager } from "@/components/managers";
import { PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Video" };

export default async function Page() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("videos").select("*").order("sort_order").order("created_at");
  return (
    <div>
      <PageHeader title="Video" description="Video YouTube/TikTok/Instagram — bukti nyata kesegaran produk." />
      <VideoManager items={data ?? []} />
    </div>
  );
}

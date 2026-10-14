import { mergeSettings } from "@sfs/shared";
import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/supabase/server";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = { title: "Pengaturan Toko" };

export default async function SettingsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("settings").select("key, value");
  return (
    <div>
      <PageHeader title="Pengaturan Toko" description="Informasi yang tampil di seluruh website: kontak, jam buka, ongkir, sosial media, dan lainnya." />
      <SettingsForm settings={mergeSettings(data)} />
    </div>
  );
}

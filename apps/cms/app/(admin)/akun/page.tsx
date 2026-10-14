import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/supabase/server";
import { AccountPanel, type AdminRow } from "./account-panel";

export const metadata: Metadata = { title: "Akun & Admin" };

export default async function AccountPage() {
  const { supabase, userId } = await requireAdmin();
  const { data } = await supabase.from("admin_users").select("user_id, email, name, created_at").order("created_at");
  return (
    <div>
      <PageHeader title="Akun & Admin" description="Ganti password Anda dan kelola siapa saja yang bisa masuk ke panel admin." />
      <AccountPanel admins={(data ?? []) as AdminRow[]} currentUserId={userId} />
    </div>
  );
}

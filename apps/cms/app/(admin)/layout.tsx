import { Shell } from "@/components/shell";
import { requireAdmin } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: LayoutProps<"/">) {
  const { supabase, email } = await requireAdmin();
  const { count } = await supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "new");
  return (
    <Shell email={email} newOrders={count ?? 0}>
      {children}
    </Shell>
  );
}

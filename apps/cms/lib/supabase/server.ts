import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Dipanggil dari Server Component: sesi sudah di-refresh oleh proxy.
        }
      },
    },
  });
}

/** Pastikan user login & terdaftar sebagai admin; kalau tidak, arahkan ke /login. */
export const requireAdmin = cache(async () => {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims.sub;
  if (!userId) redirect("/login");
  const { data: admin } = await supabase.from("admin_users").select("user_id, name").eq("user_id", userId).maybeSingle();
  if (!admin) redirect("/login?error=forbidden");
  return { supabase, userId, email: (claims.claims.email as string | undefined) ?? "", name: admin.name as string | null };
});

"use server";

import { createClient as createSupabase } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "./supabase/server";

type Result = { ok: true } | { ok: false; message: string };

function serviceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return null;
  return createSupabase(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function createAdmin(input: { email: string; password: string; name: string }): Promise<Result> {
  await requireAdmin();
  const email = input.email.trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) return { ok: false, message: "Email tidak valid" };
  if (input.password.length < 8) return { ok: false, message: "Password minimal 8 karakter" };
  const admin = serviceClient();
  if (!admin) return { ok: false, message: "SUPABASE_SERVICE_ROLE_KEY belum diatur di server CMS" };

  const { data, error } = await admin.auth.admin.createUser({ email, password: input.password, email_confirm: true });
  if (error) {
    return { ok: false, message: error.message.includes("already") ? "Email sudah terdaftar" : error.message };
  }
  const { error: insertError } = await admin.from("admin_users").insert({ user_id: data.user.id, email, name: input.name.trim() || null });
  if (insertError) {
    await admin.auth.admin.deleteUser(data.user.id);
    return { ok: false, message: insertError.message };
  }
  revalidatePath("/akun");
  return { ok: true };
}

export async function removeAdmin(userId: string): Promise<Result> {
  const me = await requireAdmin();
  if (me.userId === userId) return { ok: false, message: "Tidak bisa menghapus akun sendiri" };
  const admin = serviceClient();
  if (!admin) return { ok: false, message: "SUPABASE_SERVICE_ROLE_KEY belum diatur di server CMS" };
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/akun");
  return { ok: true };
}

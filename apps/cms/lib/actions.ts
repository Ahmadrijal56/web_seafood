"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "./supabase/server";

/**
 * Minta website toko membuang cache supaya perubahan langsung tampil.
 * Dipanggil setiap kali admin menyimpan data.
 */
export async function publishChanges(paths: string[] = []): Promise<{ ok: boolean; message?: string }> {
  await requireAdmin();
  for (const p of paths) revalidatePath(p);
  const webUrl = process.env.WEB_URL;
  const secret = process.env.REVALIDATE_SECRET;
  if (!webUrl || !secret) return { ok: false, message: "WEB_URL / REVALIDATE_SECRET belum diatur" };
  try {
    const res = await fetch(`${webUrl.replace(/\/$/, "")}/api/revalidate`, {
      method: "POST",
      headers: { "x-revalidate-secret": secret },
      cache: "no-store",
    });
    return res.ok ? { ok: true } : { ok: false, message: `Website membalas ${res.status}` };
  } catch {
    return { ok: false, message: "Website tidak dapat dihubungi" };
  }
}

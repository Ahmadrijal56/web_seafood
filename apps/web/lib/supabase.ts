import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const CACHE_TAG = "sfs";

/** Klien baca: hasil di-cache Next.js dan di-invalidate oleh CMS lewat /api/revalidate. */
export const supabaseCached = createClient(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
  global: {
    fetch: (input, init) => fetch(input, { ...init, next: { revalidate: 300, tags: [CACHE_TAG] } }),
  },
});

/** Klien tanpa cache untuk menulis (pesanan, event). */
export const supabaseLive = createClient(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
  global: {
    fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
  },
});

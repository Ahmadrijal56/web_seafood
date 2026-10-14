/**
 * Reset & isi ulang seluruh data demo (aman dijalankan berkali-kali).
 *   pnpm seed
 * Membutuhkan supabase/seed/.env (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL, ADMIN_PASSWORD).
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { DEFAULT_SETTINGS, unitPriceFor } from "@sfs/shared";
import { config } from "dotenv";
import { banners, bundles, categories, faqs, products, shippingAreas, testimonials, videos } from "./data";

const here = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(here, ".env"), quiet: true });

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib diisi di supabase/seed/.env");
  process.exit(1);
}

const db = createClient(url, serviceKey, { auth: { persistSession: false } });
const BUCKET = "media";

function check<T>(result: { data: T; error: { message: string } | null }, label: string): T {
  if (result.error) throw new Error(`${label}: ${result.error.message}`);
  return result.data;
}

const uploaded = new Map<string, string>();
async function upload(rel: string): Promise<string> {
  const cached = uploaded.get(rel);
  if (cached) return cached;
  const file = await readFile(path.join(here, "images", `${rel}.webp`));
  const objectPath = `seed/${rel}.webp`;
  const { error } = await db.storage.from(BUCKET).upload(objectPath, file, {
    contentType: "image/webp",
    upsert: true,
    cacheControl: "31536000",
  });
  if (error) throw new Error(`upload ${rel}: ${error.message}`);
  const publicUrl = db.storage.from(BUCKET).getPublicUrl(objectPath).data.publicUrl;
  uploaded.set(rel, publicUrl);
  return publicUrl;
}

async function wipe() {
  const steps: [string, (q: any) => any][] = [
    ["events", (q) => q.gte("id", 0)],
    ["order_items", (q) => q.not("id", "is", null)],
    ["orders", (q) => q.not("id", "is", null)],
    ["bundle_items", (q) => q.not("bundle_id", "is", null)],
    ["bundles", (q) => q.not("id", "is", null)],
    ["product_options", (q) => q.not("id", "is", null)],
    ["price_tiers", (q) => q.not("id", "is", null)],
    ["product_images", (q) => q.not("id", "is", null)],
    ["products", (q) => q.not("id", "is", null)],
    ["categories", (q) => q.not("id", "is", null)],
    ["banners", (q) => q.not("id", "is", null)],
    ["testimonials", (q) => q.not("id", "is", null)],
    ["videos", (q) => q.not("id", "is", null)],
    ["faqs", (q) => q.not("id", "is", null)],
    ["shipping_areas", (q) => q.not("id", "is", null)],
    ["settings", (q) => q.neq("key", "")],
  ];
  for (const [table, filter] of steps) {
    check(await filter(db.from(table).delete()), `hapus ${table}`);
  }
}

async function ensureAdmin() {
  const email = process.env.ADMIN_EMAIL ?? "admin@syauqifreshseafood.com";
  const password = process.env.ADMIN_PASSWORD ?? "syauqi2026";
  const { data: list } = await db.auth.admin.listUsers({ perPage: 200 });
  let user = list?.users.find((u) => u.email === email);
  if (!user) {
    const created = await db.auth.admin.createUser({ email, password, email_confirm: true });
    if (created.error) throw new Error(`buat admin: ${created.error.message}`);
    user = created.data.user!;
  } else {
    await db.auth.admin.updateUserById(user.id, { password });
  }
  check(
    await db.from("admin_users").upsert({ user_id: user.id, email, name: "Admin Syauqi" }),
    "admin_users",
  );
  return { email, password };
}

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 3_600_000);
}

function jakartaDate(date: Date) {
  return date.toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
}

function orderCode(date: Date, seq: number) {
  const d = jakartaDate(date).slice(2).replace(/-/g, "");
  return `SFS-${d}-${String(seq).padStart(3, "0")}`;
}

async function main() {
  console.log("• Menghapus data lama…");
  await wipe();

  console.log("• Mengunggah foto & mengisi katalog…");
  const categoryIds = new Map<string, string>();
  for (const [i, c] of categories.entries()) {
    const row = check(
      await db
        .from("categories")
        .insert({ name: c.name, slug: c.slug, icon: c.icon, description: c.description, image_url: await upload(c.image), sort_order: i })
        .select("id")
        .single(),
      `kategori ${c.slug}`,
    );
    categoryIds.set(c.slug, row.id);
  }

  const productIds = new Map<string, string>();
  const productMeta = new Map<string, (typeof products)[number] & { id: string; processingIds: string[] }>();
  for (const [i, p] of products.entries()) {
    const row = check(
      await db
        .from("products")
        .insert({
          category_id: categoryIds.get(p.category),
          name: p.name,
          slug: p.slug,
          type: p.type,
          size_label: p.size ?? null,
          short_description: p.short,
          description: p.description,
          cooking_tips: p.tips,
          show_price: p.showPrice ?? true,
          price_per_kg: p.price,
          compare_price: p.compare ?? null,
          min_order_kg: p.minOrder ?? 0.5,
          stock_status: p.stock ?? "available",
          badges: p.badges ?? [],
          is_featured: p.featured ?? false,
          sort_order: i,
          sold_count: p.sold,
          seo_title: `${p.name}${p.size ? ` ${p.size}` : ""} Segar — Syauqi Fresh Seafood`,
          seo_description: p.short,
        })
        .select("id")
        .single(),
      `produk ${p.slug}`,
    );
    productIds.set(p.slug, row.id);

    const images = await Promise.all(p.images.map((img) => upload(img)));
    check(
      await db.from("product_images").insert(
        images.map((imgUrl, idx) => ({ product_id: row.id, url: imgUrl, path: `seed/${p.images[idx]}.webp`, sort_order: idx })),
      ),
      `foto ${p.slug}`,
    );

    if (p.tiers?.length) {
      check(
        await db.from("price_tiers").insert(p.tiers.map(([min, price]) => ({ product_id: row.id, min_kg: min, price_per_kg: price }))),
        `tier ${p.slug}`,
      );
    }

    const options = [
      ...p.processing.map((o, idx) => ({ product_id: row.id, kind: "processing", label: o.label, value: null, extra_price: o.extra, sort_order: idx })),
      ...(p.weights ?? []).map((w, idx) => ({ product_id: row.id, kind: "weight", label: `${w} kg`, value: w, extra_price: 0, sort_order: idx })),
    ];
    const inserted = check(await db.from("product_options").insert(options).select("id, kind"), `opsi ${p.slug}`);
    productMeta.set(p.slug, {
      ...p,
      id: row.id,
      processingIds: inserted.filter((o: { kind: string }) => o.kind === "processing").map((o: { id: string }) => o.id),
    });
  }

  for (const [i, b] of bundles.entries()) {
    const row = check(
      await db
        .from("bundles")
        .insert({ name: b.name, slug: b.slug, description: b.description, price: b.price, compare_price: b.compare, image_url: await upload(b.image), sort_order: i })
        .select("id")
        .single(),
      `paket ${b.slug}`,
    );
    check(
      await db.from("bundle_items").insert(b.items.map(([slug, qty]) => ({ bundle_id: row.id, product_id: productIds.get(slug), qty_kg: qty }))),
      `isi paket ${b.slug}`,
    );
  }

  console.log("• Konten: banner, testimoni, FAQ, video, ongkir, pengaturan…");
  check(
    await db.from("banners").insert(
      await Promise.all(
        banners.map(async (b, i) => ({
          title: b.title,
          subtitle: b.subtitle,
          image_url: await upload(b.image),
          link: b.link,
          cta_label: b.cta,
          starts_at: hoursAgo(24).toISOString(),
          ends_at: b.endsInHours ? new Date(Date.now() + b.endsInHours * 3_600_000).toISOString() : null,
          show_countdown: b.countdown,
          sort_order: i,
        })),
      ),
    ),
    "banner",
  );

  check(await db.from("testimonials").insert(testimonials.map((t, i) => ({ ...t, sort_order: i }))), "testimoni");
  check(await db.from("faqs").insert(faqs.map((f, i) => ({ question: f.q, answer: f.a, sort_order: i }))), "faq");
  check(
    await db.from("videos").insert(
      await Promise.all(
        videos.map(async (v, i) => ({
          platform: v.platform,
          url: v.thumb.startsWith("wide/") ? `https://www.youtube.com/watch?v=${v.id}` : `https://www.youtube.com/shorts/${v.id}`,
          title: v.title,
          thumbnail_url: await upload(v.thumb),
          sort_order: i,
        })),
      ),
    ),
    "video",
  );
  const areas = check(
    await db
      .from("shipping_areas")
      .insert(shippingAreas.map((a, i) => ({ name: a.name, fee: a.fee, min_free_shipping: a.minFree, eta: a.eta, sort_order: i })))
      .select("id, name, fee, min_free_shipping"),
    "ongkir",
  );
  check(
    await db.from("settings").insert(Object.entries(DEFAULT_SETTINGS).map(([key, value]) => ({ key, value }))),
    "pengaturan",
  );

  console.log("• Pesanan contoh & statistik…");
  const customers = [
    ["Budi Santoso", "081234567801", "Jl. Kemang Raya No. 10, Mampang", "Jakarta Selatan"],
    ["Rina Wulandari", "081298765402", "Jl. Boulevard Raya Blok QA, Kelapa Gading", "Jakarta Utara"],
    ["Resto Bahari (Chef Dimas)", "081377788803", "Jl. Fatmawati No. 45, Cilandak", "Jakarta Selatan"],
    ["Hendra Wijaya", "081511122204", "Perumahan Pluit Karang, Penjaringan", "Jakarta Utara"],
    ["Sari Puspita", "085711223305", "Jl. Ahmad Yani, Bekasi Selatan", "Bodetabek"],
    ["Katering Barokah", "081266699906", "Jl. Imam Bonjol, Karawaci, Tangerang", "Bodetabek"],
    ["Andi Pratama", "081822233307", "Jl. Tanjung Duren Raya, Grogol", "Jakarta Barat"],
    ["Yanti Rahayu", "087788899908", "Jl. Margonda Raya, Depok", "Bodetabek"],
    ["Rizky Ramadhan", "081344455509", "Jl. Danau Sunter Utara", "Jakarta Utara"],
    ["Dewi Lestari", "081933344410", "Jl. Cikini Raya No. 20, Menteng", "Jakarta Pusat"],
    ["Hotel Pesona (Purchasing)", "02129998811", "Jl. Gunung Sahari Raya, Pademangan", "Jakarta Utara"],
    ["Fajar Nugroho", "081277766612", "Jl. Pemuda, Rawamangun", "Jakarta Timur"],
  ] as const;
  const baskets: [string, number, number][][] = [
    [["udang-vaname", 2, 2], ["kepiting-bakau", 1, 0]],
    [["kakap-merah", 1.5, 1], ["cumi-segar", 1, 2]],
    [["udang-vaname", 10, 0], ["cumi-segar", 8, 1], ["kakap-merah", 5, 3]],
    [["kerang-hijau", 3, 1], ["selar-kuning", 2, 1]],
    [["kepiting-bakau", 2, 0], ["udang-windu", 1, 0], ["lobster-bambu", 1, 0]],
    [["tongkol", 15, 1], ["kembung", 15, 1]],
    [["udang-vaname", 1, 2], ["sotong", 1, 0]],
    [["kerang-hijau", 2, 0], ["kerang-dara", 1, 1]],
    [["udang-tiger-jumbo", 2, 0]],
    [["bawal-putih", 1, 1], ["kakap-merah", 1, 2]],
    [["udang-windu", 10, 1], ["kerapu", 5, 1], ["cumi-jumbo", 10, 1]],
    [["selar-kuning", 3, 1], ["kembung", 2, 1], ["udang-vaname", 1, 0]],
  ];
  const statuses = ["new", "new", "confirmed", "confirmed", "shipped", "done", "done", "done", "done", "done", "cancelled", "done"];
  const offsets = [1, 3, 5, 9, 20, 28, 45, 70, 96, 120, 140, 160];
  const seqByDay = new Map<string, number>();
  const ordersSorted = offsets.map((h, i) => ({ h, i })).sort((a, b) => b.h - a.h);

  for (const { h, i } of ordersSorted) {
    const [name, phone, address, areaName] = customers[i]!;
    const created = hoursAgo(h);
    const day = jakartaDate(created);
    const seq = (seqByDay.get(day) ?? 0) + 1;
    seqByDay.set(day, seq);
    const area = areas.find((a: { name: string }) => a.name === areaName)!;

    let subtotal = 0;
    let hasUnpriced = false;
    const items = baskets[i]!.map(([slug, qty, procIdx]) => {
      const p = productMeta.get(slug)!;
      const proc = p.processing[procIdx] ?? p.processing[0]!;
      const priced = (p.showPrice ?? true) && p.price != null;
      const unit = priced ? unitPriceFor({ show_price: true, price_per_kg: p.price }, p.tiers?.map(([min_kg, price_per_kg]) => ({ min_kg, price_per_kg })), qty) : null;
      const line = unit != null ? Math.round((unit + proc.extra) * qty) : null;
      if (line != null) subtotal += line;
      else hasUnpriced = true;
      return {
        product_id: p.id,
        name_snapshot: p.size ? `${p.name} (${p.size})` : p.name,
        qty_kg: qty,
        processing: proc.label,
        unit_price: unit,
        extra_price: proc.extra,
        line_total: line,
      };
    });
    const freeMin = area.min_free_shipping ?? DEFAULT_SETTINGS.free_shipping_min;
    const shipping = freeMin && subtotal >= freeMin ? 0 : area.fee;

    const order = check(
      await db
        .from("orders")
        .insert({
          order_code: orderCode(created, seq),
          customer_name: name,
          customer_phone: phone,
          method: i === 3 ? "pickup" : "delivery",
          address: i === 3 ? null : address,
          area_id: i === 3 ? null : area.id,
          area_name: i === 3 ? null : area.name,
          delivery_date: jakartaDate(new Date(created.getTime() + 3_600_000 * 6)),
          notes: i === 0 ? "Tolong es batu tambahan" : i === 2 ? "Kirim jam 7 pagi ke pintu belakang dapur" : null,
          subtotal,
          shipping_fee: i === 3 ? 0 : shipping,
          total: subtotal + (i === 3 ? 0 : shipping),
          has_unpriced: hasUnpriced,
          status: statuses[i],
          created_at: created.toISOString(),
        })
        .select("id")
        .single(),
      `pesanan ${i}`,
    );
    check(await db.from("order_items").insert(items.map((it) => ({ ...it, order_id: order.id }))), `item pesanan ${i}`);
  }

  const featured = products.slice(0, 12).map((p) => productIds.get(p.slug)!);
  const events = Array.from({ length: 140 }, (_, n) => ({
    type: n % 3 === 0 ? "add_to_cart" : "wa_click",
    product_id: featured[n % featured.length],
    created_at: hoursAgo((n * 37) % 160).toISOString(),
  }));
  check(await db.from("events").insert(events), "event");

  const admin = await ensureAdmin();
  console.log(`\n✔ Seed selesai: ${categories.length} kategori, ${products.length} produk, ${bundles.length} paket, ${offsets.length} pesanan, ${uploaded.size} gambar`);
  console.log(`  Akun CMS demo → ${admin.email} / ${admin.password}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

"use client";

import {
  BADGE_LABELS,
  formatKg,
  formatRupiah,
  priceLadder,
  slugify,
  STOCK_LABELS,
  type Badge,
  type Category,
  type ProductType,
  type ProductWithRelations,
  type StockStatus,
} from "@sfs/shared";
import { ExternalLink, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { GalleryField, type GalleryImage } from "@/components/gallery-field";
import { SaveBar } from "@/components/save-bar";
import { useToast } from "@/components/toast";
import { RupiahInput, Segmented } from "@/components/inputs";
import { Button, buttonClass, Card, Field, Toggle } from "@/components/ui";
import { publishChanges } from "@/lib/actions";
import { supabaseBrowser } from "@/lib/supabase/client";
import { removeImages } from "@/lib/upload";
import { cn, toNumberOrNull, WEB_URL } from "@/lib/utils";

type Tier = { min_kg: string; price: string };
type Processing = { label: string; extra: string };

type FormState = {
  name: string;
  slug: string;
  category_id: string;
  type: ProductType;
  size_label: string;
  short_description: string;
  description: string;
  cooking_tips: string;
  show_price: boolean;
  price_per_kg: string;
  compare_price: string;
  min_order_kg: string;
  stock_status: StockStatus;
  badges: Badge[];
  is_featured: boolean;
  is_active: boolean;
  sort_order: string;
  sold_count: string;
  seo_title: string;
  seo_description: string;
  weights: number[];
  tiers: Tier[];
  processing: Processing[];
  images: GalleryImage[];
};

function initialState(p: ProductWithRelations | null, categories: Category[]): FormState {
  const options = p?.product_options ?? [];
  return {
    name: p?.name ?? "",
    slug: p?.slug ?? "",
    category_id: p?.category_id ?? categories[0]?.id ?? "",
    type: p?.type ?? "fresh",
    size_label: p?.size_label ?? "",
    short_description: p?.short_description ?? "",
    description: p?.description ?? "",
    cooking_tips: p?.cooking_tips ?? "",
    show_price: p?.show_price ?? true,
    price_per_kg: p?.price_per_kg?.toString() ?? "",
    compare_price: p?.compare_price?.toString() ?? "",
    min_order_kg: p?.min_order_kg?.toString() ?? "0.5",
    stock_status: p?.stock_status ?? "available",
    badges: p?.badges ?? [],
    is_featured: p?.is_featured ?? false,
    is_active: p?.is_active ?? true,
    sort_order: p?.sort_order?.toString() ?? "0",
    sold_count: p?.sold_count?.toString() ?? "0",
    seo_title: p?.seo_title ?? "",
    seo_description: p?.seo_description ?? "",
    weights: options
      .filter((o) => o.kind === "weight" && o.value)
      .map((o) => Number(o.value))
      .sort((a, b) => a - b),
    tiers: [...(p?.price_tiers ?? [])].sort((a, b) => a.min_kg - b.min_kg).map((t) => ({ min_kg: String(t.min_kg), price: String(t.price_per_kg) })),
    processing: options
      .filter((o) => o.kind === "processing")
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((o) => ({ label: o.label, extra: String(o.extra_price || "") })),
    images: [...(p?.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order).map((i) => ({ url: i.url, path: i.path })),
  };
}

const WEIGHT_PRESETS = [0.25, 0.5, 1, 2, 3, 5, 10, 20, 50];
const PROCESSING_PRESETS = ["Utuh", "Bersihkan sisik & insang", "Fillet", "Potong steak", "Kupas", "Kupas (sisakan ekor)", "Belah kupu-kupu", "Hidup", "Rebus"];

export function ProductForm({ product, categories }: { product: ProductWithRelations | null; categories: Category[] }) {
  const router = useRouter();
  const toast = useToast();
  const [initial] = useState(() => initialState(product, categories));
  const [form, setForm] = useState(initial);
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  const ladder = useMemo(() => {
    const base = toNumberOrNull(form.price_per_kg);
    if (!base) return [];
    return priceLadder(
      { price_per_kg: base, show_price: true },
      form.tiers.map((t) => ({ min_kg: parseKg(t.min_kg), price_per_kg: toNumberOrNull(t.price) ?? 0 })).filter((t) => t.min_kg > 0 && t.price_per_kg > 0),
    );
  }, [form.price_per_kg, form.min_order_kg, form.tiers]);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Nama produk wajib diisi";
    if (!slugify(form.slug || form.name)) e.slug = "Slug tidak valid";
    if (form.show_price && !toNumberOrNull(form.price_per_kg)) e.price_per_kg = "Isi harga, atau matikan \"Tampilkan harga\"";
    if (!(parseKg(form.min_order_kg) > 0)) e.min_order_kg = "Minimal order harus lebih dari 0";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function save() {
    if (!validate()) {
      toast("Periksa kembali isian yang ditandai merah", "error");
      return;
    }
    setSaving(true);
    const supabase = supabaseBrowser();
    const row = {
      name: form.name.trim(),
      slug: slugify(form.slug || form.name),
      category_id: form.category_id || null,
      type: form.type,
      size_label: form.size_label.trim() || null,
      short_description: form.short_description.trim() || null,
      description: form.description.trim() || null,
      cooking_tips: form.cooking_tips.trim() || null,
      show_price: form.show_price,
      price_per_kg: toNumberOrNull(form.price_per_kg),
      compare_price: toNumberOrNull(form.compare_price),
      min_order_kg: parseKg(form.min_order_kg),
      stock_status: form.stock_status,
      badges: form.badges,
      is_featured: form.is_featured,
      is_active: form.is_active,
      sort_order: Number(form.sort_order) || 0,
      sold_count: Number(form.sold_count) || 0,
      seo_title: form.seo_title.trim() || null,
      seo_description: form.seo_description.trim() || null,
    };

    try {
      let id = product?.id;
      if (id) {
        const { error } = await supabase.from("products").update(row).eq("id", id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("products").insert(row).select("id").single();
        if (error) throw error;
        id = data.id as string;
      }

      const weights = [...form.weights].sort((a, b) => a - b);
      const tiers = form.tiers
        .map((t) => ({ product_id: id, min_kg: parseKg(t.min_kg), price_per_kg: toNumberOrNull(t.price) }))
        .filter((t) => t.min_kg && t.price_per_kg);
      const options = [
        ...form.processing
          .filter((o) => o.label.trim())
          .map((o, i) => ({ product_id: id, kind: "processing", label: o.label.trim(), value: null, extra_price: toNumberOrNull(o.extra) ?? 0, sort_order: i })),
        ...weights.map((w, i) => ({ product_id: id, kind: "weight", label: `${w} kg`, value: w, extra_price: 0, sort_order: i })),
      ];
      const images = form.images.map((img, i) => ({ product_id: id, url: img.url, path: img.path, sort_order: i }));

      for (const table of ["price_tiers", "product_options", "product_images"]) {
        const { error } = await supabase.from(table).delete().eq("product_id", id);
        if (error) throw error;
      }
      const inserts = await Promise.all([
        tiers.length ? supabase.from("price_tiers").insert(tiers) : null,
        options.length ? supabase.from("product_options").insert(options) : null,
        images.length ? supabase.from("product_images").insert(images) : null,
      ]);
      const failed = inserts.find((r) => r?.error);
      if (failed?.error) throw failed.error;

      const kept = new Set(form.images.map((i) => i.path));
      await removeImages(initial.images.filter((i) => !kept.has(i.path)).map((i) => i.path));

      const result = await publishChanges(["/produk", "/harga", "/"]);
      toast(result.ok ? "Produk tersimpan & website diperbarui" : `Produk tersimpan (${result.message})`, result.ok ? "success" : "error");
      if (!product) router.replace(`/produk/${id}`);
      else router.refresh();
    } catch (e) {
      const message = (e as { message?: string; code?: string }).code === "23505" ? "Slug sudah dipakai produk lain" : ((e as Error).message ?? "Gagal menyimpan");
      toast(message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!product || !confirm(`Hapus "${product.name}"? Produk akan hilang dari website. Riwayat pesanan tetap tersimpan.`)) return;
    const { error } = await supabaseBrowser().from("products").delete().eq("id", product.id);
    if (error) return toast(error.message, "error");
    await removeImages(initial.images.map((i) => i.path));
    await publishChanges(["/produk", "/harga", "/"]);
    toast("Produk dihapus");
    router.replace("/produk");
  }

  return (
    <div className="pb-24">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          <Card title="Foto produk">
            <GalleryField images={form.images} onChange={(v) => set("images", v)} folder="products" />
          </Card>

          <Card title="Informasi produk">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nama produk *" error={errors.name} className="sm:col-span-2">
                <input
                  className="input"
                  value={form.name}
                  onChange={(e) => {
                    set("name", e.target.value);
                    if (!slugTouched) set("slug", slugify(e.target.value));
                  }}
                  placeholder="Udang Vaname"
                />
              </Field>
              <Field label="Kategori">
                <select className="input" value={form.category_id} onChange={(e) => set("category_id", e.target.value)}>
                  <option value="">— Tanpa kategori —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Jenis">
                <Segmented
                  value={form.type}
                  onChange={(v) => set("type", v)}
                  options={[
                    { value: "fresh", label: "Fresh" },
                    { value: "frozen", label: "Frozen" },
                  ]}
                />
              </Field>
              <Field label="Ukuran / size" hint="Contoh: size 40–50, 500–800 gr/ekor">
                <input className="input" value={form.size_label} onChange={(e) => set("size_label", e.target.value)} />
              </Field>
              <Field label="Slug (alamat URL)" error={errors.slug} hint={`${WEB_URL.replace(/^https?:\/\//, "")}/produk/${slugify(form.slug || form.name) || "…"}`}>
                <input
                  className="input"
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set("slug", e.target.value);
                  }}
                />
              </Field>
              <Field label="Deskripsi singkat" hint="Tampil di kartu produk & hasil pencarian" className="sm:col-span-2">
                <input className="input" value={form.short_description} onChange={(e) => set("short_description", e.target.value)} maxLength={140} />
              </Field>
              <Field label="Deskripsi lengkap" className="sm:col-span-2">
                <textarea className="input min-h-28" value={form.description} onChange={(e) => set("description", e.target.value)} />
              </Field>
              <Field label="Tips masak" hint="Opsional — membantu pembeli yang ragu" className="sm:col-span-2">
                <textarea className="input min-h-20" value={form.cooking_tips} onChange={(e) => set("cooking_tips", e.target.value)} />
              </Field>
            </div>
          </Card>

          <Card title="Harga">
            <div className="space-y-5">
              <div className="rounded-2xl bg-slate-50 p-4">
                <Toggle
                  checked={form.show_price}
                  onChange={(v) => set("show_price", v)}
                  label="Tampilkan harga di website"
                  description={form.show_price ? "Harga & estimasi total tampil ke pembeli." : "Produk tampil dengan tombol \"Tanya Harga\" — cocok untuk harga lelang yang naik-turun."}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Harga per kg" error={errors.price_per_kg}>
                  <RupiahInput value={form.price_per_kg} onChange={(v) => set("price_per_kg", v)} />
                </Field>
                <Field label="Harga coret (opsional)" hint="Harga normal sebelum promo">
                  <RupiahInput value={form.compare_price} onChange={(v) => set("compare_price", v)} />
                </Field>
                <Field label="Minimal order (kg)" error={errors.min_order_kg}>
                  <input className="input" inputMode="decimal" value={form.min_order_kg} onChange={(e) => set("min_order_kg", e.target.value)} />
                </Field>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-600">Harga grosir bertingkat</p>
                  <Button size="sm" variant="secondary" onClick={() => set("tiers", [...form.tiers, { min_kg: "", price: "" }])}>
                    <Plus className="size-3.5" /> Tingkat
                  </Button>
                </div>
                {form.tiers.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-200 px-4 py-3 text-xs text-slate-400">Belum ada. Contoh: mulai 5 kg Rp 90.000/kg, mulai 10 kg Rp 85.000/kg.</p>
                ) : (
                  <ul className="space-y-2">
                    {form.tiers.map((t, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-500">Mulai</span>
                        <input
                          className="input w-20"
                          inputMode="decimal"
                          value={t.min_kg}
                          onChange={(e) => set("tiers", form.tiers.map((x, j) => (j === i ? { ...x, min_kg: e.target.value } : x)))}
                        />
                        <span className="text-xs font-semibold text-slate-500">kg</span>
                        <div className="flex-1">
                          <RupiahInput value={t.price} onChange={(v) => set("tiers", form.tiers.map((x, j) => (j === i ? { ...x, price: v } : x)))} suffix="/kg" />
                        </div>
                        <button type="button" onClick={() => set("tiers", form.tiers.filter((_, j) => j !== i))} className="p-2 text-slate-400 hover:text-rose-600" aria-label="Hapus tingkat">
                          <Trash2 className="size-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {ladder.length > 1 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {ladder.map((l, i) => (
                      <span key={l.minKg} className="rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
                        {i === 0 ? `< ${l.maxKg} kg` : l.maxKg ? `${l.minKg}–${l.maxKg - 1} kg` : `≥ ${l.minKg} kg`}: {formatRupiah(l.price)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card title="Pilihan untuk pembeli">
            <div className="space-y-5">
              <div>
                <p className="mb-2 text-xs font-bold text-slate-600">Pilihan berat cepat</p>
                <div className="flex flex-wrap gap-2">
                  {WEIGHT_PRESETS.map((w) => {
                    const on = form.weights.includes(w);
                    return (
                      <button
                        key={w}
                        type="button"
                        onClick={() => set("weights", on ? form.weights.filter((x) => x !== w) : [...form.weights, w])}
                        className={cn(
                          "rounded-xl border px-3 py-1.5 text-sm font-bold transition",
                          on ? "border-brand-600 bg-brand-50 text-brand-700" : "border-slate-200 bg-white text-slate-400 hover:border-slate-300",
                        )}
                      >
                        {formatKg(w)}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs text-slate-400">Tombol berat yang muncul di halaman produk. Kosongkan untuk memakai default (½, 1, 2, 5 kg).</p>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-600">Pilihan olahan / pembersihan</p>
                  <Button size="sm" variant="secondary" onClick={() => set("processing", [...form.processing, { label: "", extra: "" }])}>
                    <Plus className="size-3.5" /> Olahan
                  </Button>
                </div>
                <ul className="space-y-2">
                  {form.processing.map((o, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <input
                        className="input flex-1"
                        value={o.label}
                        list="processing-presets"
                        placeholder="Nama olahan"
                        onChange={(e) => set("processing", form.processing.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
                      />
                      <div className="w-32 sm:w-40">
                        <RupiahInput
                          value={o.extra}
                          placeholder="Gratis"
                          suffix="/kg"
                          onChange={(v) => set("processing", form.processing.map((x, j) => (j === i ? { ...x, extra: v } : x)))}
                        />
                      </div>
                      <button type="button" onClick={() => set("processing", form.processing.filter((_, j) => j !== i))} className="p-2 text-slate-400 hover:text-rose-600" aria-label="Hapus olahan">
                        <X className="size-4" />
                      </button>
                    </li>
                  ))}
                </ul>
                <datalist id="processing-presets">
                  {PROCESSING_PRESETS.map((p) => (
                    <option key={p} value={p} />
                  ))}
                </datalist>
                <p className="mt-2 text-xs text-slate-400">Biaya tambahan per kg, kosongkan jika gratis. Pilihan pertama jadi default.</p>
              </div>
            </div>
          </Card>

          <Card title="SEO (opsional)">
            <div className="space-y-4">
              <Field label="Judul halaman" hint={`${(form.seo_title || form.name).length}/60 karakter`}>
                <input className="input" value={form.seo_title} onChange={(e) => set("seo_title", e.target.value)} placeholder={form.name ? `${form.name} Segar — Syauqi Fresh Seafood` : ""} />
              </Field>
              <Field label="Deskripsi meta" hint={`${(form.seo_description || form.short_description).length}/160 karakter`}>
                <textarea className="input min-h-20" value={form.seo_description} onChange={(e) => set("seo_description", e.target.value)} placeholder={form.short_description} />
              </Field>
            </div>
          </Card>
        </div>

        <div className="min-w-0 space-y-6">
          <Card title="Status">
            <div className="space-y-4">
              <Toggle checked={form.is_active} onChange={(v) => set("is_active", v)} label="Tampil di website" description="Matikan untuk menyembunyikan sementara" />
              <Toggle checked={form.is_featured} onChange={(v) => set("is_featured", v)} label="Produk unggulan" description="Muncul di bagian Harga Hari Ini / Best Seller" />
              <Field label="Stok">
                <Segmented
                  value={form.stock_status}
                  onChange={(v) => set("stock_status", v)}
                  options={(Object.keys(STOCK_LABELS) as StockStatus[]).map((k) => ({ value: k, label: STOCK_LABELS[k] }))}
                />
              </Field>
            </div>
          </Card>

          <Card title="Label / badge">
            <div className="flex flex-wrap gap-2">
              {(Object.keys(BADGE_LABELS) as Badge[]).map((b) => {
                const on = form.badges.includes(b);
                return (
                  <button
                    key={b}
                    type="button"
                    onClick={() => set("badges", on ? form.badges.filter((x) => x !== b) : [...form.badges, b])}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-bold transition",
                      on ? "border-brand-600 bg-brand-600 text-white" : "border-slate-200 bg-white text-slate-500 hover:border-slate-300",
                    )}
                  >
                    {BADGE_LABELS[b]}
                  </button>
                );
              })}
            </div>
          </Card>

          <Card title="Lainnya">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Urutan" hint="Kecil = tampil duluan">
                <input className="input" inputMode="numeric" value={form.sort_order} onChange={(e) => set("sort_order", e.target.value)} />
              </Field>
              <Field label="Terjual" hint="Ditampilkan sebagai bukti sosial">
                <input className="input" inputMode="numeric" value={form.sold_count} onChange={(e) => set("sold_count", e.target.value)} />
              </Field>
            </div>
          </Card>

          {product && (
            <button type="button" onClick={remove} className="flex w-full items-center justify-center gap-2 py-2 text-xs font-bold text-slate-400 hover:text-rose-600">
              <Trash2 className="size-3.5" /> Hapus produk
            </button>
          )}
        </div>
      </div>

      <SaveBar saving={saving} dirty={dirty} onSave={save} label={product ? "Simpan" : "Simpan Produk"}>
        {product && (
          <a href={`${WEB_URL}/produk/${product.slug}`} target="_blank" className={buttonClass("outline")}>
            <ExternalLink className="size-4" /> <span className="hidden sm:inline">Lihat di web</span>
          </a>
        )}
      </SaveBar>
    </div>
  );
}

function parseKg(value: string): number {
  const n = Number(value.trim().replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

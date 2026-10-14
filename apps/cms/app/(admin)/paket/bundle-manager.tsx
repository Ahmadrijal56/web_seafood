"use client";

import { discountPercent, formatRupiah, slugify, type BundleWithItems, type Product } from "@sfs/shared";
import { Package, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ImageField } from "@/components/image-field";
import { RupiahInput } from "@/components/inputs";
import { useToast } from "@/components/toast";
import { Button, EmptyState, Field, Modal, Pill, Toggle } from "@/components/ui";
import { publishChanges } from "@/lib/actions";
import { supabaseBrowser } from "@/lib/supabase/client";
import { pathFromUrl, removeImages } from "@/lib/upload";
import { cn } from "@/lib/utils";

type ProductLite = Pick<Product, "id" | "name" | "size_label" | "price_per_kg" | "show_price">;
type Draft = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  image_url: string | null;
  price: string;
  compare_price: string;
  is_active: boolean;
  sort_order: number;
  items: { product_id: string; qty_kg: string }[];
};

function toDraft(b: BundleWithItems | null, nextOrder: number): Draft {
  return {
    id: b?.id,
    name: b?.name ?? "",
    slug: b?.slug ?? "",
    description: b?.description ?? "",
    image_url: b?.image_url ?? null,
    price: b?.price?.toString() ?? "",
    compare_price: b?.compare_price?.toString() ?? "",
    is_active: b?.is_active ?? true,
    sort_order: b?.sort_order ?? nextOrder,
    items: (b?.bundle_items ?? []).map((i) => ({ product_id: i.product_id, qty_kg: String(i.qty_kg) })),
  };
}

export function BundleManager({ bundles: initial, products }: { bundles: BundleWithItems[]; products: ProductLite[] }) {
  const router = useRouter();
  const toast = useToast();
  const [bundles, setBundles] = useState(initial);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const productById = new Map(products.map((p) => [p.id, p]));

  const normalPrice = (items: Draft["items"]) =>
    items.reduce((sum, i) => sum + (productById.get(i.product_id)?.price_per_kg ?? 0) * Number(i.qty_kg.replace(",", ".") || 0), 0);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => (d ? { ...d, [key]: value } : d));

  async function save() {
    if (!draft) return;
    if (!draft.name.trim()) return toast("Nama paket wajib diisi", "error");
    if (!Number(draft.price)) return toast("Harga paket wajib diisi", "error");
    const items = draft.items.filter((i) => i.product_id && Number(i.qty_kg.replace(",", ".")) > 0);
    if (!items.length) return toast("Tambahkan minimal 1 produk ke paket", "error");

    setSaving(true);
    const supabase = supabaseBrowser();
    const row = {
      name: draft.name.trim(),
      slug: slugify(draft.slug || draft.name),
      description: draft.description.trim() || null,
      image_url: draft.image_url,
      price: Number(draft.price),
      compare_price: Number(draft.compare_price) || null,
      is_active: draft.is_active,
      sort_order: draft.sort_order,
    };
    try {
      const { data, error } = draft.id
        ? await supabase.from("bundles").update(row).eq("id", draft.id).select().single()
        : await supabase.from("bundles").insert(row).select().single();
      if (error) throw error;
      const del = await supabase.from("bundle_items").delete().eq("bundle_id", data.id);
      if (del.error) throw del.error;
      const rows = items.map((i) => ({ bundle_id: data.id, product_id: i.product_id, qty_kg: Number(i.qty_kg.replace(",", ".")) }));
      const ins = await supabase.from("bundle_items").insert(rows);
      if (ins.error) throw ins.error;

      const before = bundles.find((b) => b.id === draft.id);
      if (before?.image_url && before.image_url !== draft.image_url) await removeImages([pathFromUrl(before.image_url)]);

      const saved = { ...(data as BundleWithItems), bundle_items: rows };
      setBundles((list) => (draft.id ? list.map((b) => (b.id === saved.id ? saved : b)) : [...list, saved]));
      setDraft(null);
      const result = await publishChanges();
      toast(result.ok ? "Paket disimpan" : `Paket disimpan (${result.message})`, result.ok ? "success" : "error");
      router.refresh();
    } catch (e) {
      const err = e as { code?: string; message: string };
      toast(err.code === "23505" ? "Slug paket sudah dipakai" : err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!draft?.id || !confirm(`Hapus paket "${draft.name}"?`)) return;
    const { error } = await supabaseBrowser().from("bundles").delete().eq("id", draft.id);
    if (error) return toast(error.message, "error");
    await removeImages([pathFromUrl(draft.image_url)]);
    setBundles((list) => list.filter((b) => b.id !== draft.id));
    setDraft(null);
    await publishChanges();
    toast("Paket dihapus");
    router.refresh();
  }

  async function toggleActive(b: BundleWithItems, value: boolean) {
    setBundles((list) => list.map((x) => (x.id === b.id ? { ...x, is_active: value } : x)));
    const { error } = await supabaseBrowser().from("bundles").update({ is_active: value }).eq("id", b.id);
    if (error) return toast(error.message, "error");
    await publishChanges();
    toast(value ? "Paket ditampilkan" : "Paket disembunyikan");
  }

  const normal = draft ? normalPrice(draft.items) : 0;

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setDraft(toDraft(null, (bundles.at(-1)?.sort_order ?? 0) + 1))}>
          <Plus className="size-4" /> Tambah paket
        </Button>
      </div>

      {bundles.length === 0 ? (
        <EmptyState icon={<Package className="size-7" />} title="Belum ada paket" text="Contoh: Paket Bakar Keluarga — kakap + udang + cumi." />
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {bundles.map((b) => {
            const off = discountPercent(b.price, b.compare_price);
            return (
              <li key={b.id} className={cn("card overflow-hidden", !b.is_active && "opacity-60")}>
                <button type="button" onClick={() => setDraft(toDraft(b, 0))} className="block w-full text-left">
                  <div className="relative aspect-[16/10] bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {b.image_url && <img src={b.image_url} alt="" className="size-full object-cover" />}
                    {off && <span className="absolute left-3 top-3 rounded-full bg-coral px-2.5 py-1 text-xs font-bold text-white">Hemat {off}%</span>}
                  </div>
                  <div className="p-4">
                    <p className="font-extrabold text-navy">{b.name}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                      {(b.bundle_items ?? []).map((i) => `${productById.get(i.product_id)?.name ?? "?"} ${i.qty_kg} kg`).join(" · ")}
                    </p>
                    <p className="mt-2 font-extrabold text-brand-700">
                      {formatRupiah(b.price)}
                      {b.compare_price && <span className="ml-2 text-xs font-semibold text-slate-400 line-through">{formatRupiah(b.compare_price)}</span>}
                    </p>
                  </div>
                </button>
                <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5">
                  <span className="text-xs font-semibold text-slate-500">Tampil di website</span>
                  <Toggle checked={b.is_active} onChange={(v) => toggleActive(b, v)} />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Modal
        open={Boolean(draft)}
        onClose={() => setDraft(null)}
        title={draft?.id ? "Edit paket" : "Tambah paket"}
        size="lg"
        footer={
          <>
            {draft?.id && (
              <Button variant="danger" onClick={remove} className="mr-auto">
                <Trash2 className="size-4" /> Hapus
              </Button>
            )}
            <Button variant="outline" onClick={() => setDraft(null)}>
              Batal
            </Button>
            <Button onClick={save} loading={saving}>
              Simpan
            </Button>
          </>
        }
      >
        {draft && (
          <div className="space-y-5">
            <div className="max-w-md">
              <p className="mb-1.5 text-xs font-bold text-slate-600">Foto paket</p>
              <ImageField value={draft.image_url} onChange={(v) => set("image_url", v)} folder="bundles" aspect="aspect-[16/10]" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Nama paket *">
                <input className="input" value={draft.name} onChange={(e) => set("name", e.target.value)} placeholder="Paket Bakar Keluarga" />
              </Field>
              <Field label="Slug">
                <input className="input" value={draft.slug} placeholder={slugify(draft.name)} onChange={(e) => set("slug", e.target.value)} />
              </Field>
              <Field label="Deskripsi" className="sm:col-span-2">
                <textarea className="input min-h-20" value={draft.description} onChange={(e) => set("description", e.target.value)} />
              </Field>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-bold text-slate-600">Isi paket *</p>
                <Button size="sm" variant="secondary" onClick={() => set("items", [...draft.items, { product_id: "", qty_kg: "1" }])}>
                  <Plus className="size-3.5" /> Produk
                </Button>
              </div>
              <ul className="space-y-2">
                {draft.items.map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <select
                      className="input flex-1"
                      value={item.product_id}
                      onChange={(e) => set("items", draft.items.map((x, j) => (j === i ? { ...x, product_id: e.target.value } : x)))}
                    >
                      <option value="">— Pilih produk —</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                          {p.size_label ? ` (${p.size_label})` : ""}
                        </option>
                      ))}
                    </select>
                    <input
                      className="input w-20"
                      inputMode="decimal"
                      value={item.qty_kg}
                      onChange={(e) => set("items", draft.items.map((x, j) => (j === i ? { ...x, qty_kg: e.target.value } : x)))}
                    />
                    <span className="text-xs font-semibold text-slate-500">kg</span>
                    <button type="button" onClick={() => set("items", draft.items.filter((_, j) => j !== i))} className="p-2 text-slate-400 hover:text-rose-600" aria-label="Hapus">
                      <X className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Harga paket *">
                <RupiahInput value={draft.price} onChange={(v) => set("price", v)} />
              </Field>
              <Field label="Harga normal (coret)" hint={normal ? `Total harga satuan isi paket: ${formatRupiah(normal)}` : undefined}>
                <RupiahInput value={draft.compare_price} onChange={(v) => set("compare_price", v)} placeholder={normal ? String(normal) : "0"} />
              </Field>
            </div>
            {normal > 0 && Number(draft.price) > 0 && (
              <p className="flex items-center gap-2 text-sm">
                {Number(draft.price) < normal ? (
                  <Pill tone="green">Pembeli hemat {formatRupiah(normal - Number(draft.price))} dibanding beli satuan</Pill>
                ) : (
                  <Pill tone="amber">Harga paket tidak lebih murah dari beli satuan</Pill>
                )}
              </p>
            )}
            <div className="rounded-2xl bg-slate-50 p-4">
              <Toggle checked={draft.is_active} onChange={(v) => set("is_active", v)} label="Tampilkan di website" />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

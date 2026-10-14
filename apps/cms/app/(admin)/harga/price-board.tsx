"use client";

import { formatRupiah, STOCK_LABELS, type Category, type ProductWithRelations, type StockStatus } from "@sfs/shared";
import { Plus, Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { SaveBar } from "@/components/save-bar";
import { useToast } from "@/components/toast";
import { Card, Field, Toggle } from "@/components/ui";
import { publishChanges } from "@/lib/actions";
import { supabaseBrowser } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { RupiahInput } from "@/components/inputs";

type Row = {
  id: string;
  show_price: boolean;
  price: string;
  compare: string;
  stock: StockStatus;
  tiers: { min_kg: string; price: string }[];
};

function toRow(p: ProductWithRelations): Row {
  return {
    id: p.id,
    show_price: p.show_price,
    price: p.price_per_kg?.toString() ?? "",
    compare: p.compare_price?.toString() ?? "",
    stock: p.stock_status,
    tiers: [...(p.price_tiers ?? [])].sort((a, b) => a.min_kg - b.min_kg).map((t) => ({ min_kg: String(t.min_kg), price: String(t.price_per_kg) })),
  };
}

const STOCK_STYLE: Record<StockStatus, string> = {
  available: "bg-emerald-500 text-white",
  limited: "bg-amber-400 text-white",
  out: "bg-rose-500 text-white",
};

export function PriceBoard({
  products,
  categories,
  showPrices: initialShowPrices,
  note: initialNote,
}: {
  products: ProductWithRelations[];
  categories: Category[];
  showPrices: boolean;
  note: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [initial, setInitial] = useState(() => Object.fromEntries(products.map((p) => [p.id, toRow(p)])));
  const [rows, setRows] = useState(initial);
  const [note, setNote] = useState(initialNote);
  const [savedNote, setSavedNote] = useState(initialNote);
  const [showPrices, setShowPrices] = useState(initialShowPrices);
  const [q, setQ] = useState("");
  const [saving, setSaving] = useState(false);

  const changed = useMemo(() => Object.keys(rows).filter((id) => JSON.stringify(rows[id]) !== JSON.stringify(initial[id])), [rows, initial]);
  const dirty = changed.length > 0 || note !== savedNote;

  const groups = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = products.filter((p) => !term || p.name.toLowerCase().includes(term));
    return [...categories, { id: "", name: "Tanpa kategori" } as Category]
      .map((c) => ({ category: c, items: list.filter((p) => (p.category_id ?? "") === c.id) }))
      .filter((g) => g.items.length);
  }, [products, categories, q]);

  const update = (id: string, patch: Partial<Row>) => setRows((r) => ({ ...r, [id]: { ...r[id], ...patch } }));

  async function toggleGlobal(value: boolean) {
    const msg = value ? "Tampilkan harga di seluruh website?" : "Sembunyikan SEMUA harga? Semua produk akan tampil sebagai \"Tanya Harga\".";
    if (!confirm(msg)) return;
    setShowPrices(value);
    const { error } = await supabaseBrowser().from("settings").upsert({ key: "show_prices", value });
    if (error) {
      setShowPrices(!value);
      return toast(error.message, "error");
    }
    await publishChanges();
    toast(value ? "Harga ditampilkan di website" : "Semua harga disembunyikan");
  }

  async function save() {
    for (const id of changed) {
      const r = rows[id];
      if (r.show_price && !Number(r.price)) {
        const name = products.find((p) => p.id === id)?.name;
        return toast(`${name}: isi harga atau matikan "Tampilkan"`, "error");
      }
    }
    setSaving(true);
    const supabase = supabaseBrowser();
    try {
      for (const id of changed) {
        const r = rows[id];
        const { error } = await supabase
          .from("products")
          .update({ show_price: r.show_price, price_per_kg: Number(r.price) || null, compare_price: Number(r.compare) || null, stock_status: r.stock })
          .eq("id", id);
        if (error) throw error;
        if (JSON.stringify(r.tiers) !== JSON.stringify(initial[id].tiers)) {
          const tiers = r.tiers
            .map((t) => ({ product_id: id, min_kg: Number(t.min_kg.replace(",", ".")), price_per_kg: Number(t.price) }))
            .filter((t) => t.min_kg > 0 && t.price_per_kg > 0);
          const del = await supabase.from("price_tiers").delete().eq("product_id", id);
          if (del.error) throw del.error;
          if (tiers.length) {
            const ins = await supabase.from("price_tiers").insert(tiers);
            if (ins.error) throw ins.error;
          }
        }
      }
      if (note !== savedNote) {
        const { error } = await supabase.from("settings").upsert({ key: "today_price_note", value: note });
        if (error) throw error;
        setSavedNote(note);
      }
      setInitial(rows);
      const result = await publishChanges(["/produk", "/"]);
      toast(result.ok ? `${changed.length} produk diperbarui & tampil di website` : `Tersimpan (${result.message})`, result.ok ? "success" : "error");
      router.refresh();
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="pb-24">
      <div className="mb-5 grid gap-4 lg:grid-cols-2">
        <Card>
          <Toggle
            checked={showPrices}
            onChange={toggleGlobal}
            label="Tampilkan harga di website"
            description={showPrices ? "Harga per produk mengikuti pengaturan di bawah." : "Semua produk sedang tampil sebagai \"Tanya Harga\"."}
          />
        </Card>
        <Card>
          <Field label="Catatan harga hari ini" hint="Tampil di bagian Harga Hari Ini di beranda">
            <input className="input" value={note} onChange={(e) => setNote(e.target.value)} />
          </Field>
        </Card>
      </div>

      <div className="relative mb-5">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari produk…" className="input pl-10" />
      </div>

      <div className="space-y-6">
        {groups.map(({ category, items }) => (
          <section key={category.id}>
            <h2 className="mb-2 px-1 text-xs font-extrabold uppercase tracking-wider text-slate-400">{category.name}</h2>
            <ul className="card divide-y divide-slate-100">
              {items.map((p) => {
                const r = rows[p.id];
                const isChanged = changed.includes(p.id);
                const image = [...(p.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order)[0];
                return (
                  <li key={p.id} className={cn("p-4 transition", isChanged && "bg-amber-50/60", !p.is_active && "opacity-60")}>
                    <div className="flex flex-col gap-3 md:flex-row md:items-center">
                      <div className="flex min-w-0 items-center gap-3 md:w-64">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {image ? <img src={image.url} alt="" className="size-12 shrink-0 rounded-xl object-cover" /> : <div className="size-12 shrink-0 rounded-xl bg-slate-100" />}
                        <div className="min-w-0">
                          <Link href={`/produk/${p.id}`} className="block truncate text-sm font-bold text-navy hover:text-brand-600">
                            {p.name}
                          </Link>
                          <p className="truncate text-xs text-slate-400">{p.size_label}</p>
                          {isChanged && <p className="text-[11px] font-bold text-amber-600">Belum disimpan</p>}
                        </div>
                      </div>

                      <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-[1fr_1fr_auto]">
                        <div className={cn(!r.show_price && "opacity-40")}>
                          <p className="mb-1 text-[11px] font-bold text-slate-400">Harga /kg</p>
                          <RupiahInput value={r.price} onChange={(v) => update(p.id, { price: v })} />
                        </div>
                        <div className={cn(!r.show_price && "opacity-40")}>
                          <p className="mb-1 text-[11px] font-bold text-slate-400">Harga coret</p>
                          <RupiahInput value={r.compare} onChange={(v) => update(p.id, { compare: v })} placeholder="—" />
                        </div>
                        <div className="col-span-2 flex items-end justify-between gap-3 sm:col-span-1 sm:flex-col sm:items-start">
                          <label className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                            <Toggle checked={r.show_price} onChange={(v) => update(p.id, { show_price: v })} />
                            {r.show_price ? "Tampilkan" : "Tanya harga"}
                          </label>
                          <div className="flex overflow-hidden rounded-lg border border-slate-200 text-[11px] font-bold">
                            {(Object.keys(STOCK_LABELS) as StockStatus[]).map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => update(p.id, { stock: s })}
                                className={cn("px-2.5 py-1.5", r.stock === s ? STOCK_STYLE[s] : "bg-white text-slate-400")}
                              >
                                {STOCK_LABELS[s]}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {r.show_price && (
                      <div className="mt-3 flex flex-wrap items-center gap-2 md:pl-[268px]">
                        <span className="text-[11px] font-bold text-slate-400">Grosir:</span>
                        {r.tiers.map((t, i) => (
                          <span key={i} className="flex items-center gap-1 rounded-xl bg-slate-50 py-1 pl-2 pr-1 ring-1 ring-slate-200">
                            <span className="text-[11px] text-slate-500">≥</span>
                            <input
                              value={t.min_kg}
                              inputMode="decimal"
                              onChange={(e) => update(p.id, { tiers: r.tiers.map((x, j) => (j === i ? { ...x, min_kg: e.target.value } : x)) })}
                              className="w-8 bg-transparent text-xs font-bold outline-none"
                            />
                            <span className="text-[11px] text-slate-500">kg</span>
                            <input
                              value={t.price ? Number(t.price).toLocaleString("id-ID") : ""}
                              inputMode="numeric"
                              onChange={(e) => update(p.id, { tiers: r.tiers.map((x, j) => (j === i ? { ...x, price: e.target.value.replace(/\D/g, "") } : x)) })}
                              className="w-20 rounded-lg bg-white px-2 py-1 text-xs font-bold outline-none ring-1 ring-slate-200 focus:ring-brand-400"
                            />
                            <button type="button" onClick={() => update(p.id, { tiers: r.tiers.filter((_, j) => j !== i) })} className="p-1 text-slate-400 hover:text-rose-600" aria-label="Hapus">
                              <X className="size-3" />
                            </button>
                          </span>
                        ))}
                        <button
                          type="button"
                          onClick={() => update(p.id, { tiers: [...r.tiers, { min_kg: "", price: "" }] })}
                          className="flex items-center gap-1 rounded-xl px-2 py-1 text-[11px] font-bold text-brand-600 hover:bg-brand-50"
                        >
                          <Plus className="size-3" /> tingkat
                        </button>
                        {Number(r.price) > 0 && Number(r.compare) > Number(r.price) && (
                          <span className="ml-auto text-[11px] font-bold text-coral">Hemat {formatRupiah(Number(r.compare) - Number(r.price))}/kg</span>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      <SaveBar saving={saving} dirty={dirty} onSave={save} label={changed.length ? `Simpan ${changed.length} perubahan` : "Simpan"} />
    </div>
  );
}

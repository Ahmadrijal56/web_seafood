"use client";

import { BADGE_LABELS, formatRupiah, STOCK_LABELS, TYPE_LABELS, type Category, type ProductWithRelations, type StockStatus } from "@sfs/shared";
import { Fish, Search, Star } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useToast } from "@/components/toast";
import { EmptyState, Pill, Toggle } from "@/components/ui";
import { publishChanges } from "@/lib/actions";
import { supabaseBrowser } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const STOCK_TONE = { available: "green", limited: "amber", out: "rose" } as const;

export function ProductList({ products: initial, categories }: { products: ProductWithRelations[]; categories: Category[] }) {
  const toast = useToast();
  const [products, setProducts] = useState(initial);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return products.filter(
      (p) => (cat === "all" || p.category_id === cat) && (!term || `${p.name} ${p.size_label ?? ""}`.toLowerCase().includes(term)),
    );
  }, [products, q, cat]);

  async function patch(id: string, values: Partial<ProductWithRelations>, message: string) {
    const prev = products;
    setProducts((list) => list.map((p) => (p.id === id ? { ...p, ...values } : p)));
    const { error } = await supabaseBrowser().from("products").update(values).eq("id", id);
    if (error) {
      setProducts(prev);
      return toast(error.message, "error");
    }
    toast(message);
    publishChanges();
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari produk…" className="input pl-10" />
        </div>
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="input sm:w-56">
          <option value="all">Semua kategori</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Fish className="size-7" />} title="Produk tidak ditemukan" text="Coba kata kunci lain atau tambah produk baru." />
      ) : (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {filtered.map((p) => {
            const image = [...(p.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order)[0];
            return (
              <li key={p.id} className={cn("card flex flex-col p-3 transition", !p.is_active && "opacity-60")}>
                <div className="flex flex-1 gap-3">
                  <Link href={`/produk/${p.id}`} className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:size-24">
                    {image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={image.url} alt="" className="size-full object-cover" />
                    )}
                    <span className="absolute bottom-1 left-1 rounded-md bg-navy/80 px-1.5 py-0.5 text-[10px] font-bold text-white">{TYPE_LABELS[p.type]}</span>
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      <Link href={`/produk/${p.id}`} className="min-w-0 flex-1">
                        <p className="truncate font-bold text-navy hover:text-brand-600">{p.name}</p>
                        <p className="truncate text-xs text-slate-400">
                          {p.category?.name ?? "Tanpa kategori"}
                          {p.size_label && ` · ${p.size_label}`}
                        </p>
                      </Link>
                      <button
                        type="button"
                        onClick={() => patch(p.id, { is_featured: !p.is_featured }, p.is_featured ? "Dihapus dari unggulan" : "Dijadikan produk unggulan")}
                        aria-label="Produk unggulan"
                        title="Tampilkan di beranda (unggulan)"
                        className="-mr-1 -mt-1 shrink-0 p-1"
                      >
                        <Star className={cn("size-5", p.is_featured ? "fill-amber-400 text-amber-400" : "text-slate-300")} />
                      </button>
                    </div>
                    <p className="mt-1 text-sm font-extrabold text-slate-700">
                      {p.show_price && p.price_per_kg ? (
                        <>
                          {formatRupiah(p.price_per_kg)}
                          <span className="text-xs font-semibold text-slate-400">/kg</span>
                          {(p.price_tiers?.length ?? 0) > 0 && <span className="ml-1 text-[11px] font-bold text-brand-600">+{p.price_tiers!.length} harga grosir</span>}
                        </>
                      ) : (
                        <span className="text-coral">Tanya Harga</span>
                      )}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {p.badges.map((b) => (
                        <Pill key={b} tone="brand">
                          {BADGE_LABELS[b]}
                        </Pill>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                  <select
                    value={p.stock_status}
                    onChange={(e) => patch(p.id, { stock_status: e.target.value as StockStatus }, `Stok ${p.name}: ${STOCK_LABELS[e.target.value as StockStatus]}`)}
                    className={cn(
                      "rounded-lg border-0 py-1 pl-2 pr-7 text-xs font-bold outline-none",
                      { green: "bg-emerald-50 text-emerald-700", amber: "bg-amber-50 text-amber-700", rose: "bg-rose-50 text-rose-600" }[STOCK_TONE[p.stock_status]],
                    )}
                  >
                    {Object.entries(STOCK_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        Stok: {v}
                      </option>
                    ))}
                  </select>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    Tampil
                    <Toggle checked={p.is_active} onChange={(v) => patch(p.id, { is_active: v }, v ? `${p.name} ditampilkan` : `${p.name} disembunyikan`)} />
                  </label>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

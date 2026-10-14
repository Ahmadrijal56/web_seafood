"use client";

import type { Category } from "@sfs/shared";
import { Search, SearchX, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import type { ProductSummary } from "@/lib/product";
import { cn } from "@/lib/utils";
import { CategoryIcon } from "./icons";
import { ProductCard } from "./product-card";

const SORTS = [
  { value: "rekomendasi", label: "Rekomendasi" },
  { value: "terlaris", label: "Terlaris" },
  { value: "termurah", label: "Harga terendah" },
  { value: "termahal", label: "Harga tertinggi" },
  { value: "terbaru", label: "Terbaru" },
];

const TYPES = [
  { value: "", label: "Semua" },
  { value: "fresh", label: "Fresh" },
  { value: "frozen", label: "Frozen" },
];

export function Catalog({
  products,
  categories,
  showPrices,
}: {
  products: ProductSummary[];
  categories: Category[];
  showPrices: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();
  const category = params.get("kategori") ?? "";
  const type = params.get("tipe") ?? "";
  const sort = params.get("urut") ?? "rekomendasi";
  const [query, setQuery] = useState(params.get("q") ?? "");

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    startTransition(() => router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false }));
  }

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = products.filter(
      (p) =>
        (!category || p.categorySlug === category) &&
        (!type || p.type === type) &&
        (!q || `${p.name} ${p.sizeLabel ?? ""} ${p.categoryName ?? ""} ${p.shortDescription ?? ""}`.toLowerCase().includes(q)),
    );
    const price = (p: ProductSummary) => (showPrices && p.showPrice && p.pricePerKg != null ? p.pricePerKg : null);
    const sorted = [...filtered];
    switch (sort) {
      case "terlaris":
        sorted.sort((a, b) => b.soldCount - a.soldCount);
        break;
      case "termurah":
        sorted.sort((a, b) => (price(a) ?? Infinity) - (price(b) ?? Infinity));
        break;
      case "termahal":
        sorted.sort((a, b) => (price(b) ?? -1) - (price(a) ?? -1));
        break;
      case "terbaru":
        sorted.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
        break;
    }
    // Produk habis selalu di akhir.
    return sorted.sort((a, b) => Number(a.stockStatus === "out") - Number(b.stockStatus === "out"));
  }, [products, category, type, sort, query, showPrices]);

  const activeCategory = categories.find((c) => c.slug === category);

  return (
    <div>
      <div className="sticky top-16 z-20 -mx-4 border-b border-slate-100 bg-white/95 px-4 pb-3 pt-3 backdrop-blur sm:-mx-6 sm:px-6 lg:top-[72px] lg:-mx-8 lg:px-8">
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          <button
            type="button"
            onClick={() => setParam("kategori", "")}
            className={cn(
              "h-10 shrink-0 cursor-pointer rounded-full px-4 text-sm font-semibold transition",
              !category ? "bg-navy text-white" : "bg-slate-100 text-slate-700 hover:bg-brand-50",
            )}
          >
            Semua
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setParam("kategori", c.slug === category ? "" : c.slug)}
              className={cn(
                "inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full px-4 text-sm font-semibold transition",
                c.slug === category ? "bg-navy text-white" : "bg-slate-100 text-slate-700 hover:bg-brand-50",
              )}
            >
              <CategoryIcon icon={c.icon} size={16} /> {c.name}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <span className="sr-only">Cari produk</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onBlur={() => setParam("q", query.trim())}
              placeholder="Cari udang, kakap, cumi…"
              className="h-11 w-full rounded-full border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
            />
          </label>
          <div className="flex gap-2">
            <div className="flex rounded-full bg-slate-100 p-1">
              {TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setParam("tipe", t.value)}
                  className={cn(
                    "h-9 cursor-pointer rounded-full px-3.5 text-sm font-semibold transition",
                    type === t.value ? "bg-white text-navy shadow" : "text-slate-600",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <select
              value={sort}
              onChange={(e) => setParam("urut", e.target.value === "rekomendasi" ? "" : e.target.value)}
              className="h-11 min-w-0 flex-1 cursor-pointer rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-navy outline-none focus:border-brand-400 sm:flex-none"
              aria-label="Urutkan"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mb-4 mt-6 flex items-center justify-between">
        <p className="text-sm text-slate-600">
          <span className="font-bold text-navy">{results.length}</span> produk
          {activeCategory && (
            <>
              {" "}di <span className="font-bold text-navy">{activeCategory.name}</span>
            </>
          )}
        </p>
        {(category || type || query) && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              startTransition(() => router.replace(pathname, { scroll: false }));
            }}
            className="inline-flex cursor-pointer items-center gap-1 text-sm font-semibold text-brand-600"
          >
            <X className="size-4" /> Reset filter
          </button>
        )}
      </div>

      {results.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {results.map((p, i) => (
            <ProductCard key={p.id} product={p} showPrices={showPrices} priority={i < 4} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-3xl bg-ice px-6 py-16 text-center">
          <SearchX className="size-10 text-brand-400" />
          <p className="font-bold text-navy">Produk tidak ditemukan</p>
          <p className="max-w-sm text-sm text-slate-600">Coba kata kunci lain, atau tanyakan langsung ke admin — stok lapak sering berubah setiap hari.</p>
        </div>
      )}
    </div>
  );
}

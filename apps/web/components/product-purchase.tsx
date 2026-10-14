"use client";

import { DEFAULT_WEIGHTS, buildProductInquiry, formatKg, formatRupiah, unitPriceFor, waLink } from "@sfs/shared";
import { Check, Info, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { roundQty } from "@/lib/cart";
import type { ProductSummary } from "@/lib/product";
import { track } from "@/lib/track";
import { cn } from "@/lib/utils";
import { WhatsAppIcon } from "./icons";
import { QtyStepper } from "./qty-stepper";
import { useAddProduct } from "./quick-add";
import { useStore } from "./store-provider";

export interface ProcessingOption {
  id: string;
  label: string;
  extra: number;
}

export function ProductPurchase({
  product,
  weights,
  processing,
}: {
  product: ProductSummary;
  weights: number[];
  processing: ProcessingOption[];
}) {
  const { settings } = useStore();
  const addProduct = useAddProduct();
  const min = product.minOrderKg;
  const presets = (weights.length ? weights : DEFAULT_WEIGHTS).filter((w) => w >= min);
  const [qty, setQty] = useState(presets.includes(1) ? 1 : (presets[0] ?? min));
  const [proc, setProc] = useState<ProcessingOption | null>(processing[0] ?? null);
  const [notes, setNotes] = useState("");
  const [added, setAdded] = useState(false);

  const soldOut = product.stockStatus === "out";
  const priced = settings.show_prices && product.showPrice && product.pricePerKg != null;
  const unit = priced ? unitPriceFor({ show_price: true, price_per_kg: product.pricePerKg }, product.tiers, qty) : null;
  const total = unit != null ? Math.round((unit + (proc?.extra ?? 0)) * qty) : null;
  const tierApplied = unit != null && product.pricePerKg != null && unit < product.pricePerKg;

  const wa = waLink(
    settings.whatsapp,
    buildProductInquiry({ name: product.name, size_label: product.sizeLabel }, qty, proc?.label) + (notes ? `\nCatatan: ${notes}` : ""),
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-sm font-bold text-navy">Berat</p>
        <div className="flex flex-wrap items-center gap-2">
          {presets.map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setQty(w)}
              className={cn(
                "h-10 cursor-pointer rounded-full px-4 text-sm font-semibold ring-1 transition",
                qty === w ? "bg-navy text-white ring-navy" : "bg-white text-navy ring-slate-200 hover:ring-brand-300",
              )}
            >
              {formatKg(w)}
            </button>
          ))}
          <QtyStepper value={qty} min={min} step={0.5} unit="kg" onChange={(v) => setQty(roundQty(v))} />
        </div>
        <p className="mt-2 text-xs text-slate-500">Minimal order {formatKg(min)}. Untuk pesanan &gt; 50 kg silakan chat admin.</p>
      </div>

      {processing.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-bold text-navy">Olahan</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {processing.map((option) => {
              const selected = proc?.id === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setProc(option)}
                  className={cn(
                    "flex cursor-pointer items-center justify-between gap-2 rounded-2xl px-4 py-3 text-left text-sm ring-1 transition",
                    selected ? "bg-brand-50 font-bold text-navy ring-2 ring-brand-500" : "bg-white text-slate-700 ring-slate-200 hover:ring-brand-300",
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className={cn("grid size-5 place-items-center rounded-full ring-1", selected ? "bg-brand-600 text-white ring-brand-600" : "ring-slate-300")}>
                      {selected && <Check className="size-3" strokeWidth={3} />}
                    </span>
                    {option.label}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">{option.extra > 0 ? `+${formatRupiah(option.extra)}/kg` : "Gratis"}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <label className="block">
        <span className="mb-2 block text-sm font-bold text-navy">Catatan (opsional)</span>
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={200}
          placeholder="Contoh: pilih yang besar, kepiting jantan, potong 5 bagian…"
          className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
        />
      </label>

      <div className="rounded-3xl bg-ice p-4 sm:p-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Estimasi total</p>
            {total != null ? (
              <p className="text-2xl font-extrabold text-navy">{formatRupiah(total)}</p>
            ) : (
              <p className="text-lg font-extrabold text-brand-700">Harga dikonfirmasi admin</p>
            )}
          </div>
          {unit != null && (
            <p className="text-right text-xs text-slate-500">
              {formatKg(qty)} × {formatRupiah(unit + (proc?.extra ?? 0))}/kg
              {tierApplied && <span className="block font-bold text-emerald-600">Harga grosir diterapkan ✓</span>}
            </p>
          )}
        </div>
        {!priced && (
          <p className="mt-2 flex items-start gap-1.5 text-xs text-slate-600">
            <Info className="mt-0.5 size-3.5 shrink-0" /> Tetap bisa dimasukkan ke keranjang. Admin akan mengirim harga terbaru via WhatsApp.
          </p>
        )}
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            disabled={soldOut}
            onClick={() => {
              addProduct(product, { qty, processing: proc, notes });
              setAdded(true);
              setTimeout(() => setAdded(false), 1500);
            }}
            className={cn(
              "inline-flex h-13 cursor-pointer items-center justify-center gap-2 rounded-full font-bold text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none",
              added ? "bg-emerald-500" : "bg-coral shadow-lg shadow-coral/25 hover:bg-coral-600",
            )}
          >
            {added ? <Check className="size-5" /> : <ShoppingBag className="size-5" />}
            {soldOut ? "Stok Habis" : added ? "Masuk keranjang" : "Tambah ke Keranjang"}
          </button>
          <a
            href={wa}
            target="_blank"
            rel="noopener"
            onClick={() => track("wa_click", product.id, { from: "detail", qty, processing: proc?.label })}
            className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-wa font-bold text-white shadow-lg shadow-wa/25 transition hover:bg-wa-600 active:scale-[0.98]"
          >
            <WhatsAppIcon size={20} /> {soldOut ? "Tanya Stok" : "Pesan Sekarang"}
          </a>
        </div>
      </div>
    </div>
  );
}

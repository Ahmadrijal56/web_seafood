"use client";

import { formatRupiah } from "@sfs/shared";
import { ShoppingBag, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { cartSummary, lineTotal, useCart, type CartLine } from "@/lib/cart";
import { cn } from "@/lib/utils";
import { FreeShippingBar } from "./free-shipping-bar";
import { WhatsAppIcon } from "./icons";
import { QtyStepper } from "./qty-stepper";
import { useAddProduct } from "./quick-add";
import { useStore } from "./store-provider";
import { buttonClass } from "./ui";

export function CartLineRow({ line, compact }: { line: CartLine; compact?: boolean }) {
  const { settings } = useStore();
  const update = useCart((s) => s.update);
  const remove = useCart((s) => s.remove);
  const total = lineTotal(line, settings.show_prices);
  const isBundle = line.kind === "bundle";
  return (
    <li className="flex gap-3 py-4">
      <Link
        href={isBundle ? "/paket" : `/produk/${line.slug}`}
        className={cn("relative shrink-0 overflow-hidden rounded-xl bg-brand-50", compact ? "size-16" : "size-20")}
      >
        {line.image && <Image src={line.image} alt={line.name} fill sizes="80px" className="object-cover" />}
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-bold text-navy">{line.name}</p>
            <p className="truncate text-xs text-slate-500">
              {[line.sizeLabel, line.processingLabel].filter(Boolean).join(" · ") || (isBundle ? "Paket hemat" : "")}
              {line.extraPrice > 0 && ` (+${formatRupiah(line.extraPrice)}/kg)`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => remove(line.key)}
            className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-full text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
            aria-label={`Hapus ${line.name}`}
          >
            <Trash2 className="size-4" />
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <QtyStepper
            size="sm"
            value={line.qty}
            min={line.minQty}
            step={isBundle ? 1 : 0.5}
            unit={isBundle ? "pkt" : "kg"}
            onChange={(qty) => update(line.key, { qty })}
          />
          <span className={cn("text-right text-sm font-bold", total == null ? "text-brand-600" : "text-navy")}>
            {total == null ? "Tanya harga" : formatRupiah(total)}
          </span>
        </div>
      </div>
    </li>
  );
}

function CrossSell() {
  const { suggestions, settings } = useStore();
  const lines = useCart((s) => s.lines);
  const addProduct = useAddProduct();
  const inCart = new Set(lines.map((l) => l.id));
  const items = suggestions.filter((p) => !inCart.has(p.id) && p.stockStatus !== "out").slice(0, 3);
  if (!items.length) return null;
  return (
    <div className="border-t border-slate-100 pt-4">
      <p className="mb-3 text-sm font-bold text-navy">Sering dibeli bersama</p>
      <ul className="space-y-2">
        {items.map((p) => (
          <li key={p.id} className="flex items-center gap-3 rounded-xl bg-slate-50 p-2">
            <div className="relative size-12 shrink-0 overflow-hidden rounded-lg">
              {p.image && <Image src={p.image} alt={p.name} fill sizes="48px" className="object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-navy">{p.name}</p>
              <p className="text-xs text-slate-500">
                {settings.show_prices && p.showPrice && p.pricePerKg ? `${formatRupiah(p.pricePerKg)}/kg` : "Tanya harga"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => addProduct(p, { openDrawer: false })}
              className="h-8 cursor-pointer rounded-full bg-white px-3 text-xs font-bold text-coral ring-1 ring-coral/30 transition hover:bg-coral hover:text-white"
            >
              + Tambah
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CartDrawer() {
  const { settings } = useStore();
  const open = useCart((s) => s.open);
  const setOpen = useCart((s) => s.setOpen);
  const lines = useCart((s) => s.lines);
  const pathname = usePathname();
  const summary = cartSummary(lines, settings.show_prices);

  useEffect(() => setOpen(false), [pathname, setOpen]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, setOpen]);

  return (
    <div className={cn("fixed inset-0 z-50", open ? "pointer-events-auto" : "pointer-events-none")} aria-hidden={!open}>
      <div
        className={cn("absolute inset-0 bg-navy/50 backdrop-blur-sm transition-opacity duration-300", open ? "opacity-100" : "opacity-0")}
        onClick={() => setOpen(false)}
      />
      <aside
        role="dialog"
        aria-label="Keranjang belanja"
        className={cn(
          "absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-navy">
            <ShoppingBag className="size-5 text-brand-600" /> Keranjang
            {lines.length > 0 && <span className="rounded-full bg-brand-50 px-2 text-sm text-brand-700">{lines.length}</span>}
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="grid size-10 cursor-pointer place-items-center rounded-full hover:bg-slate-100"
            aria-label="Tutup keranjang"
          >
            <X className="size-5" />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="grid size-20 place-items-center rounded-full bg-brand-50 text-brand-600">
              <ShoppingBag className="size-9" />
            </div>
            <div>
              <p className="font-bold text-navy">Keranjang masih kosong</p>
              <p className="mt-1 text-sm text-slate-500">Yuk pilih seafood segar hari ini.</p>
            </div>
            <Link href="/produk" className={buttonClass("coral")} onClick={() => setOpen(false)}>
              Lihat Produk
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5">
              <ul className="divide-y divide-slate-100">
                {lines.map((line) => (
                  <CartLineRow key={line.key} line={line} />
                ))}
              </ul>
              <div className="pb-5">
                <CrossSell />
              </div>
            </div>
            <div className="space-y-3 border-t border-slate-100 bg-white px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
              {settings.show_prices && <FreeShippingBar subtotal={summary.subtotal} threshold={settings.free_shipping_min} />}
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-slate-600">Estimasi subtotal</span>
                <span className="text-xl font-extrabold text-navy">{formatRupiah(summary.subtotal)}</span>
              </div>
              {summary.unpriced > 0 && (
                <p className="text-xs text-slate-500">+ {summary.unpriced} item harga dikonfirmasi admin via WhatsApp</p>
              )}
              <Link href="/keranjang" className={buttonClass("wa", "lg", "w-full")} onClick={() => setOpen(false)}>
                <WhatsAppIcon size={20} /> Lanjut Pesan via WhatsApp
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

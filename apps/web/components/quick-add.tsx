"use client";

import { buildProductInquiry, waLink } from "@sfs/shared";
import { Check, Plus } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { defaultQty, type ProductSummary } from "@/lib/product";
import { track } from "@/lib/track";
import { cn } from "@/lib/utils";
import { WhatsAppIcon } from "./icons";
import { useStore } from "./store-provider";

export function useAddProduct() {
  const add = useCart((s) => s.add);
  const setOpen = useCart((s) => s.setOpen);
  return (product: ProductSummary, opts?: { qty?: number; processing?: { id: string; label: string; extra: number } | null; notes?: string; openDrawer?: boolean }) => {
    const processing = opts?.processing === undefined ? product.defaultProcessing : opts.processing;
    add({
      kind: "product",
      id: product.id,
      slug: product.slug,
      name: product.name,
      sizeLabel: product.sizeLabel,
      image: product.image,
      qty: opts?.qty ?? defaultQty(product.minOrderKg),
      minQty: product.minOrderKg,
      processingId: processing?.id ?? null,
      processingLabel: processing?.label ?? null,
      extraPrice: processing?.extra ?? 0,
      notes: opts?.notes ?? "",
      showPrice: product.showPrice,
      pricePerKg: product.pricePerKg,
      tiers: product.tiers,
    });
    track("add_to_cart", product.id);
    if (opts?.openDrawer !== false) setOpen(true);
  };
}

export function QuickAdd({ product, disabled }: { product: ProductSummary; disabled?: boolean }) {
  const { settings } = useStore();
  const addProduct = useAddProduct();
  const [added, setAdded] = useState(false);

  const wa = waLink(settings.whatsapp, buildProductInquiry({ name: product.name, size_label: product.sizeLabel }, defaultQty(product.minOrderKg)));

  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          addProduct(product);
          setAdded(true);
          setTimeout(() => setAdded(false), 1500);
        }}
        className={cn(
          "inline-flex h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full text-sm font-semibold text-white transition active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none",
          added ? "bg-emerald-500" : "bg-coral shadow-md shadow-coral/25 hover:bg-coral-600",
        )}
      >
        {added ? <Check className="size-4" strokeWidth={3} /> : <Plus className="size-4" strokeWidth={3} />}
        <span>{added ? "Masuk" : "Keranjang"}</span>
      </button>
      <a
        href={wa}
        target="_blank"
        rel="noopener"
        onClick={() => track("wa_click", product.id, { from: "card" })}
        className="grid size-10 shrink-0 place-items-center rounded-full bg-wa/10 text-wa-600 transition hover:bg-wa hover:text-white"
        aria-label={`Tanya ${product.name} via WhatsApp`}
      >
        <WhatsAppIcon size={18} />
      </a>
    </div>
  );
}

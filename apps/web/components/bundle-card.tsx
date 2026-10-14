"use client";

import { discountPercent, formatKg, formatRupiah, type BundleWithItems } from "@sfs/shared";
import { Check, Gift, Plus } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { track } from "@/lib/track";
import { cn } from "@/lib/utils";
import { useStore } from "./store-provider";

export function BundleCard({ bundle }: { bundle: BundleWithItems }) {
  const { settings } = useStore();
  const add = useCart((s) => s.add);
  const setOpen = useCart((s) => s.setOpen);
  const [added, setAdded] = useState(false);
  const discount = discountPercent(bundle.price, bundle.compare_price);

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-900/10">
      <div className="relative aspect-[4/3] overflow-hidden bg-brand-50">
        {bundle.image_url && (
          <Image
            src={bundle.image_url}
            alt={bundle.name}
            fill
            sizes="(min-width: 1024px) 33vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-transparent" />
        {discount && (
          <span className="absolute left-3 top-3 rounded-full bg-rose-500 px-3 py-1 text-xs font-bold text-white shadow">
            Hemat {discount}%
          </span>
        )}
        <h3 className="absolute bottom-3 left-4 right-4 text-xl font-extrabold text-white">{bundle.name}</h3>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <p className="text-sm text-slate-600">{bundle.description}</p>
        <ul className="space-y-1.5">
          {bundle.bundle_items?.map((item) => (
            <li key={item.product_id} className="flex items-center gap-2 text-sm text-navy">
              <Check className="size-4 shrink-0 text-emerald-500" strokeWidth={3} />
              <span className="font-semibold">{item.product?.name}</span>
              <span className="text-slate-500">{formatKg(Number(item.qty_kg))}</span>
            </li>
          ))}
        </ul>
        <div className="mt-auto flex items-end justify-between gap-3">
          {settings.show_prices ? (
            <div>
              {bundle.compare_price && <s className="text-sm text-slate-400">{formatRupiah(bundle.compare_price)}</s>}
              <p className="text-2xl font-extrabold text-navy">{formatRupiah(bundle.price)}</p>
            </div>
          ) : (
            <span className="rounded-lg bg-brand-50 px-3 py-1.5 font-bold text-brand-700">Tanya Harga</span>
          )}
          <button
            type="button"
            onClick={() => {
              add({
                kind: "bundle",
                id: bundle.id,
                slug: bundle.slug,
                name: bundle.name,
                sizeLabel: null,
                image: bundle.image_url,
                qty: 1,
                minQty: 1,
                processingId: null,
                processingLabel: null,
                extraPrice: 0,
                notes: "",
                showPrice: true,
                pricePerKg: bundle.price,
                tiers: [],
              });
              track("add_to_cart", null, { bundle: bundle.slug });
              setAdded(true);
              setTimeout(() => setAdded(false), 1500);
              setOpen(true);
            }}
            className={cn(
              "inline-flex h-11 cursor-pointer items-center gap-1.5 rounded-full px-5 text-sm font-bold text-white transition active:scale-95",
              added ? "bg-emerald-500" : "bg-coral shadow-lg shadow-coral/25 hover:bg-coral-600",
            )}
          >
            {added ? <Check className="size-4" /> : <Plus className="size-4" />} {added ? "Masuk" : "Ambil Paket"}
          </button>
        </div>
      </div>
    </article>
  );
}

export function BundleIcon() {
  return <Gift className="size-5" />;
}

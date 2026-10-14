"use client";

import { formatRupiah, waLink } from "@sfs/shared";
import { ChevronRight, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cartSummary, useCart } from "@/lib/cart";
import { track } from "@/lib/track";
import { cn } from "@/lib/utils";
import { useHydrated } from "./header";
import { WhatsAppIcon } from "./icons";
import { useStore } from "./store-provider";

export function FloatingBars() {
  const { settings } = useStore();
  const lines = useCart((s) => s.lines);
  const hydrated = useHydrated();
  const pathname = usePathname();
  const onCheckout = pathname.startsWith("/keranjang") || pathname.startsWith("/pesanan");
  const showBar = hydrated && lines.length > 0 && !onCheckout;
  const summary = cartSummary(lines, settings.show_prices);

  return (
    <>
      <a
        href={waLink(settings.whatsapp, "Halo Syauqi Fresh Seafood, saya mau tanya stok & harga hari ini 🙏")}
        target="_blank"
        rel="noopener"
        onClick={() => track("wa_click", null, { from: "floating" })}
        className={cn(
          "fixed right-4 z-30 grid size-14 place-items-center rounded-full bg-wa text-white shadow-xl shadow-wa/30 transition-all duration-300 hover:scale-110 lg:bottom-6 lg:right-6",
          showBar ? "bottom-24" : "bottom-5",
          onCheckout && "hidden",
        )}
        aria-label="Chat WhatsApp"
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-wa opacity-20" />
        <WhatsAppIcon size={28} />
      </a>

      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-30 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-transform duration-300 lg:hidden",
          showBar ? "translate-y-0" : "invisible translate-y-full",
        )}
      >
        <Link
          href="/keranjang"
          className="flex items-center gap-3 rounded-2xl bg-navy p-2 pl-4 text-white shadow-2xl shadow-navy/40"
        >
          <ShoppingBag className="size-5 shrink-0 text-cyan" />
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block text-xs text-brand-100/80">{lines.length} item</span>
            <span className="block font-bold">
              {formatRupiah(summary.subtotal)}
              {summary.unpriced > 0 && <span className="text-xs font-medium text-brand-100/70"> + konfirmasi</span>}
            </span>
          </span>
          <span className="flex h-11 items-center gap-1.5 rounded-xl bg-wa px-4 text-sm font-bold">
            <WhatsAppIcon size={16} /> Pesan via WA <ChevronRight className="size-4" />
          </span>
        </Link>
      </div>
    </>
  );
}
